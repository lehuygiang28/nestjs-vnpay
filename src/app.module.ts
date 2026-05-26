import { Module } from '@nestjs/common';
import { VnpayModule } from './vnpay.module';
import { PaymentController } from './payment.controller';
import { VnpayKafkaConsumer } from './kafka/vnpay-kafka.consumer';
import { VnpayPaymentHandler } from './app/handlers/vnpay-payment.handler';
import { VnpayPaymentService } from './app/services/vnpay-payment.service';

@Module({
    imports: [
        VnpayModule.register({
            tmnCode: process.env.TMN_CODE as string,
            secureSecret: process.env.SECURE_SECRET as string,
            vnp_Version: process.env.VNP_VERSION,
        }),
    ],
    controllers: [PaymentController],
    providers: [
        VnpayKafkaConsumer,
        VnpayPaymentHandler,
        VnpayPaymentService,
    ],
})
export class AppModule {}
