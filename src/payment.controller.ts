import { Controller, Get, Logger, Optional, Query, Res } from '@nestjs/common';
import { ReturnQueryFromVNPay } from 'vnpay';
import { VnpayService } from './vnpay.service';
import { VnpayPaymentService } from './app/services/vnpay-payment.service';
import { PaymentState } from './app/handlers/vnpay-payment.handler';

/**
 * PaymentController
 *
 * Xử lý các endpoint thanh toán VNPay.
 * - vnpay-return: URL redirect cho khách hàng sau khi thanh toán (Frontend)
 * - vnpay-ipn: URL IPN cho VNPay gọi ngầm (Backend)
 *
 * Pattern: Controller chỉ làm nhiệm vụ routing,
 * business logic được chuyển xuống VnpayPaymentService.
 */
@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);
    private readonly webhookServiceUrl: string | null;

    constructor(
        private readonly vnpayService: VnpayService,
        @Optional() private readonly paymentService?: VnpayPaymentService,
    ) {
        this.webhookServiceUrl = process.env.WEBHOOK_SERVICE_URL || null;
    }

    /**
     * 1. URL Return - Dành cho Frontend
     * Khi khách hàng thanh toán xong, VNPay redirect họ về đây.
     * Hiển thị thông báo kết quả thanh toán.
     */
    @Get('vnpay-return')
    async vnpayReturn(@Query() query: ReturnQueryFromVNPay, @Res() res: any) {
        this.logger.log(`[${query.vnp_TxnRef}] Nhận return URL từ VNPay`);

        try {
            // Xác thực trực tiếp
            const verify = await this.vnpayService.verifyReturnUrl(query);

            if (verify.isSuccess) {
                this.logger.log(`[${query.vnp_TxnRef}] ✅ Xác thực return URL thành công`);
                return res.send('<h1>Thanh toán thành công! Cảm ơn bạn.</h1>');
            } else {
                this.logger.warn(`[${query.vnp_TxnRef}] ❌ Xác thực return URL thất bại`);
                return res.send('<h1>Giao dịch thất bại hoặc đã bị hủy!</h1>');
            }
        } catch (error) {
            this.logger.error(`[${query.vnp_TxnRef}] Lỗi xác thực return URL:`, error);
            return res.send('<h1>Dữ liệu không hợp lệ! Vui lòng thử lại.</h1>');
        }
    }

    /**
     * 2. Webhook IPN - Dành cho Backend VNPay gọi ngầm
     * Nơi này DÙNG ĐỂ UPDATE DATABASE an toàn.
     * Phản hồi VNPay với mã RspCode là BẮT BUỘC.
     */
    @Get('vnpay-ipn')
    async vnpayIpn(@Query() query: ReturnQueryFromVNPay) {
        this.logger.log(`[${query.vnp_TxnRef}] Nhận IPN call từ VNPay`);

        try {
            if (this.paymentService) {
                // Xử lý qua service layer nếu có
                const { result, rspCode, message } = await this.paymentService.processIpnCall(query);
                this.logger.log(`[${query.vnp_TxnRef}] IPN result: ${result.isSuccess ? 'SUCCESS' : 'FAILED'}`);
                return { RspCode: rspCode, Message: message };
            }

            // Fallback: xác thực trực tiếp
            const verify = await this.vnpayService.verifyIpnCall(query);

            if (verify.isSuccess) {
                this.logger.log(`[IPN] Đơn hàng ${query.vnp_TxnRef} thanh toán THÀNH CÔNG!`);
                // TODO: Cập nhật database
            } else {
                this.logger.log(`[IPN] Đơn hàng ${query.vnp_TxnRef} thanh toán THẤT BẠI!`);
                // TODO: Cập nhật database
            }

            return { RspCode: '00', Message: 'Confirm Success' };
        } catch (error) {
            this.logger.error(`[${query.vnp_TxnRef}] Lỗi xử lý IPN:`, error);
            return { RspCode: '97', Message: 'Invalid signature' };
        }
    }
}
