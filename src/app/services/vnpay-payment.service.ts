import { Injectable, Logger } from '@nestjs/common';
import { VnpayService } from '../../vnpay.service';
import { VnpayPaymentHandler, PaymentState } from '../handlers/vnpay-payment.handler';
import type { ReturnQueryFromVNPay } from 'vnpay';

/**
 * Kết quả xử lý thanh toán
 * @en Payment processing result
 */
export interface PaymentResult {
    isSuccess: boolean;
    transactionRef: string;
    state: PaymentState;
    responseCode: string;
    message: string;
}

/**
 * VnpayPaymentService
 *
 * Xử lý nghiệp vụ thanh toán VNPay.
 * Pattern借鉴 từ BillService trong ERP project với:
 * - Idempotency check: tránh xử lý trùng giao dịch
 * - Error handling: không throw exception ra ngoài
 * - State management: sử dụng VnpayPaymentHandler
 *
 * @en VNPay payment business logic service.
 * Pattern borrowed from BillService in the ERP project with:
 * - Idempotency check: avoid duplicate transaction processing
 * - Error handling: don't throw exceptions outward
 * - State management: uses VnpayPaymentHandler
 */
@Injectable()
export class VnpayPaymentService {
    private readonly logger = new Logger(VnpayPaymentService.name);

    /**
     * Lưu trữ các giao dịch đã xử lý (In-memory) để idempotency check
     * Trong production, nên dùng Redis/Database.
     *
     * @en Stores processed transactions (In-memory) for idempotency check.
     * In production, use Redis/Database.
     */
    private readonly processedTransactions = new Map<string, PaymentResult>();

    constructor(
        private readonly vnpayService: VnpayService,
        private readonly paymentHandler: VnpayPaymentHandler,
    ) {}

    /**
     * Xử lý kết quả thanh toán từ VNPay Return URL
     * (Khách hàng được redirect về đây sau khi thanh toán)
     *
     * @en Process payment result from VNPay Return URL
     *
     * @param query - Dữ liệu trả về từ VNPay
     * @returns PaymentResult
     */
    async processReturnUrl(query: ReturnQueryFromVNPay): Promise<PaymentResult> {
        const txnRef = query.vnp_TxnRef;
        this.logger.log(`[${txnRef}] Xử lý return URL...`);

        // Idempotency check - Kiểm tra giao dịch đã xử lý chưa
        const existing = this.processedTransactions.get(txnRef);
        if (existing) {
            this.logger.warn(`[${txnRef}] Giao dịch đã được xử lý trước đó, bỏ qua`);
            return existing;
        }

        try {
            // Xác thực dữ liệu từ VNPay
            const verify = await this.vnpayService.verifyReturnUrl(query);

            // Xác định trạng thái thanh toán
            const state = this.paymentHandler.resolveFromResponseCode(
                query.vnp_ResponseCode,
                query.vnp_TransactionStatus,
            );

            const result: PaymentResult = {
                isSuccess: verify.isSuccess && state === PaymentState.SUCCESS,
                transactionRef: txnRef,
                state,
                responseCode: query.vnp_ResponseCode,
                message: verify.isSuccess
                    ? 'Xác thực chữ ký thành công'
                    : 'Xác thực chữ ký thất bại',
            };

            // Lưu kết quả để idempotency check
            this.processedTransactions.set(txnRef, result);

            this.logger.log(`[${txnRef}] Kết quả: ${result.isSuccess ? 'THÀNH CÔNG' : 'THẤT BẠI'}`);
            return result;

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[${txnRef}] Lỗi xử lý return URL: ${errMsg}`);

            const result: PaymentResult = {
                isSuccess: false,
                transactionRef: txnRef,
                state: PaymentState.FAILED,
                responseCode: query.vnp_ResponseCode,
                message: `Lỗi xử lý: ${errMsg}`,
            };

            this.processedTransactions.set(txnRef, result);
            return result;
        }
    }

    /**
     * Xử lý IPN call từ VNPay (Backend-to-Backend)
     * Đây là nơi UPDATE DATABASE an toàn.
     *
     * @en Process IPN call from VNPay (Backend-to-Backend)
     *
     * @param query - Dữ liệu IPN từ VNPay
     * @returns PaymentResult và response code để trả về VNPay
     */
    async processIpnCall(query: ReturnQueryFromVNPay): Promise<{
        result: PaymentResult;
        rspCode: string;
        message: string;
    }> {
        const txnRef = query.vnp_TxnRef;
        this.logger.log(`[${txnRef}] Xử lý IPN call...`);

        // Idempotency check
        const existing = this.processedTransactions.get(txnRef);
        if (existing) {
            this.logger.warn(`[${txnRef}] IPN đã được xử lý, trả về kết quả cũ`);
            return {
                result: existing,
                rspCode: '00',
                message: 'Confirm Success (duplicate)',
            };
        }

        try {
            // Xác thực IPN call
            const verify = await this.vnpayService.verifyIpnCall(query);

            if (!verify.isVerified) {
                this.logger.warn(`[${txnRef}] Chữ ký IPN không hợp lệ`);

                const result: PaymentResult = {
                    isSuccess: false,
                    transactionRef: txnRef,
                    state: PaymentState.FAILED,
                    responseCode: query.vnp_ResponseCode,
                    message: 'Invalid signature',
                };

                this.processedTransactions.set(txnRef, result);
                return { result, rspCode: '97', message: 'Invalid signature' };
            }

            // Xác định trạng thái
            const state = this.paymentHandler.resolveFromResponseCode(
                query.vnp_ResponseCode,
                query.vnp_TransactionStatus,
            );

            const isSuccess = state === PaymentState.SUCCESS;

            // TODO: Trong production, cập nhật database ở đây
            // TODO: Gọi OrderService để cập nhật trạng thái đơn hàng
            if (isSuccess) {
                this.logger.log(`[${txnRef}] ✅ Thanh toán THÀNH CÔNG! Cần cập nhật database.`);
                // Ví dụ: await this.orderService.markAsPaid(txnRef);
            } else {
                this.logger.log(`[${txnRef}] ❌ Thanh toán THẤT BẠI. Code: ${query.vnp_ResponseCode}`);
            }

            const result: PaymentResult = {
                isSuccess,
                transactionRef: txnRef,
                state,
                responseCode: query.vnp_ResponseCode,
                message: isSuccess ? 'Payment successful' : 'Payment failed',
            };

            this.processedTransactions.set(txnRef, result);
            return { result, rspCode: '00', message: 'Confirm Success' };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`[${txnRef}] Lỗi xử lý IPN: ${errMsg}`);

            const result: PaymentResult = {
                isSuccess: false,
                transactionRef: txnRef,
                state: PaymentState.FAILED,
                responseCode: query.vnp_ResponseCode,
                message: `Error: ${errMsg}`,
            };

            this.processedTransactions.set(txnRef, result);
            return { result, rspCode: '99', message: `Processing error: ${errMsg}` };
        }
    }

    /**
     * Kiểm tra trạng thái giao dịch (query)
     * @en Query transaction status
     */
    async queryTransaction(txnRef: string): Promise<PaymentResult | null> {
        // Kiểm tra trong cache trước
        const cached = this.processedTransactions.get(txnRef);
        if (cached) {
            return cached;
        }

        // TODO: Query từ VNPay API nếu cần
        // const response = await this.vnpayService.queryDr({ vnp_TxnRef: txnRef, ... });
        return null;
    }

    /**
     * Xóa cache giao dịch (dùng cho testing)
     * @en Clear transaction cache (for testing)
     */
    clearTransactionCache(txnRef?: string): void {
        if (txnRef) {
            this.processedTransactions.delete(txnRef);
        } else {
            this.processedTransactions.clear();
        }
    }
}
