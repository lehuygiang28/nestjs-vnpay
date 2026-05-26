import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer as KafkaConsumerClient } from 'kafkajs';
import { VnpayService } from '../../vnpay.service';

/**
 * VnpayKafkaConsumer
 *
 * Kafka consumer được inject VnpayService qua NestJS DI.
 * Pattern: @Injectable() + lifecycle hooks (OnModuleInit, OnModuleDestroy)
 * Thay vì standalone function tạo VnpayService bằng `new`.
 *
 * @en Kafka consumer with VnpayService injected via NestJS DI.
 * Pattern: @Injectable() + lifecycle hooks instead of standalone function.
 */
@Injectable()
export class VnpayKafkaConsumer implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(VnpayKafkaConsumer.name);
    private consumer: KafkaConsumerClient | null = null;

    constructor(private readonly vnpayService: VnpayService) {}

    async onModuleInit(): Promise<void> {
        await this.start();
    }

    async onModuleDestroy(): Promise<void> {
        await this.stop();
    }

    /**
     * Kết nối và bắt đầu consume message từ Kafka
     * @en Connect and start consuming messages from Kafka
     */
    async start(): Promise<void> {
        const clientId = process.env.CLIENT_ID || 'nestjs-vnpay-client';
        const brokers = process.env.BROKERS?.split(',') || [];
        const groupId = process.env.GROUP_ID || 'nestjs-vnpay-group';

        if (brokers.length === 0) {
            this.logger.warn('Không tìm thấy cấu hình Kafka (BROKERS), bỏ qua kết nối');
            return;
        }

        const kafka = new Kafka({ clientId, brokers });
        this.consumer = kafka.consumer({ groupId });

        try {
            await this.consumer.connect();
            this.logger.log('Đã kết nối thành công tới Kafka Broker!');

            await this.consumer.subscribe({ topic: 'order-topic', fromBeginning: true });
            this.logger.log('Đang chờ message từ topic: order-topic...');

            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    await this.handleMessage(message.value?.toString());
                },
            });
        } catch (error) {
            this.logger.error('Lỗi kết nối Kafka:', error);
        }
    }

    /**
     * Ngắt kết nối Kafka consumer
     * @en Disconnect Kafka consumer
     */
    async stop(): Promise<void> {
        if (this.consumer) {
            try {
                await this.consumer.disconnect();
                this.logger.log('Đã ngắt kết nối Kafka');
            } catch (error) {
                this.logger.error('Lỗi ngắt kết nối Kafka:', error);
            }
        }
    }

    /**
     * Xử lý message nhận được từ Kafka
     * @en Handle received Kafka message
     */
    private async handleMessage(rawMessage?: string): Promise<void> {
        if (!rawMessage) return;

        try {
            const payload = JSON.parse(rawMessage);

            // Chỉ xử lý message VNPAY
            if (payload?.paymentOptions?.paymentMethod !== 'VNPAY') {
                return;
            }

            const { amount, orderId, paymentOptions, customerInfo, orderDescription } = payload;

            const paymentUrl = this.vnpayService.buildPaymentUrl({
                vnp_Amount: amount,
                vnp_IpAddr: customerInfo?.ipAddress,
                vnp_TxnRef: orderId,
                vnp_OrderInfo: orderDescription,
                vnp_ReturnUrl: process.env.RETURN_URL as string,
                vnp_Locale: customerInfo?.language,
                ...(paymentOptions?.bankCode && { vnp_BankCode: paymentOptions.bankCode }),
            });

            this.logger.log(`[x] ĐÃ TẠO VNPAY URL CHO ĐƠN ${orderId}: ${paymentUrl}`);
        } catch (error) {
            this.logger.error('Lỗi xử lý message:', error);
        }
    }
}
