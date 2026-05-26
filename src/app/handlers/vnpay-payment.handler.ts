import { Injectable, Logger } from '@nestjs/common';

/**
 * Trạng thái thanh toán VNPay
 * @en VNPay payment states
 *
 * @see OrderStatusHandler trong ERP project - State machine pattern
 */
export enum PaymentState {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

/**
 * Định nghĩa các chuyển trạng thái hợp lệ
 * Key: trạng thái hiện tại, Value: danh sách trạng thái có thể chuyển đến
 */
const VALID_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
    [PaymentState.PENDING]: [PaymentState.PROCESSING, PaymentState.FAILED],
    [PaymentState.PROCESSING]: [PaymentState.SUCCESS, PaymentState.FAILED],
    [PaymentState.SUCCESS]: [PaymentState.REFUNDED],
    [PaymentState.FAILED]: [PaymentState.PROCESSING],
    [PaymentState.REFUNDED]: [],
};

/**
 * VnpayPaymentHandler
 *
 * Quản lý trạng thái thanh toán VNPay dạng state machine.
 * Pattern借鉴 từ OrderStatusHandler trong ERP project.
 *
 * @en Manages VNPay payment states as a state machine.
 * Pattern borrowed from OrderStatusHandler in the ERP project.
 */
@Injectable()
export class VnpayPaymentHandler {
    private readonly logger = new Logger(VnpayPaymentHandler.name);

    /**
     * Kiểm tra chuyển trạng thái có hợp lệ không
     * @en Check if a state transition is valid
     *
     * @param currentState - Trạng thái hiện tại
     * @param targetState - Trạng thái muốn chuyển đến
     * @returns true nếu hợp lệ, false nếu không
     */
    canTransition(currentState: PaymentState, targetState: PaymentState): boolean {
        const allowed = VALID_TRANSITIONS[currentState];
        if (!allowed) {
            return false;
        }
        return allowed.includes(targetState);
    }

    /**
     * Thực hiện chuyển trạng thái
     * @en Perform a state transition
     *
     * @param currentState - Trạng thái hiện tại
     * @param targetState - Trạng thái muốn chuyển đến
     * @param txnRef - Mã giao dịch tham chiếu (vnp_TxnRef)
     * @returns Trạng thái mới nếu hợp lệ
     * @throws Error nếu chuyển trạng thái không hợp lệ
     */
    transition(currentState: PaymentState, targetState: PaymentState, txnRef: string): PaymentState {
        if (!this.canTransition(currentState, targetState)) {
            const msg = `[${txnRef}] Chuyển trạng thái không hợp lệ: ${currentState} → ${targetState}`;
            this.logger.warn(msg);
            throw new Error(msg);
        }

        this.logger.log(`[${txnRef}] Chuyển trạng thái: ${currentState} → ${targetState}`);
        return targetState;
    }

    /**
     * Xác định trạng thái thanh toán từ response code VNPay
     * @en Determine payment state from VNPay response code
     *
     * @param responseCode - Mã phản hồi từ VNPay (vnp_ResponseCode)
     * @param transactionStatus - Trạng thái giao dịch (vnp_TransactionStatus)
     * @returns PaymentState tương ứng
     */
    resolveFromResponseCode(responseCode: string, transactionStatus?: string): PaymentState {
        // Mã 00 và trạng thái 00 = Thành công
        if (responseCode === '00' && (!transactionStatus || transactionStatus === '00')) {
            return PaymentState.SUCCESS;
        }

        // Các mã lỗi phổ biến
        switch (responseCode) {
            case '01':
            case '02':
            case '03':
            case '04':
            case '05':
            case '06':
            case '07':
            case '08':
            case '09':
            case '10':
            case '11':
            case '12':
            case '13':
            case '24':
            case '51':
            case '65':
            case '75':
            case '79':
            case '99':
                return PaymentState.FAILED;
            default:
                return PaymentState.FAILED;
        }
    }

    /**
     * Kiểm tra giao dịch đã thành công chưa
     * @en Check if the transaction was successful
     */
    isSuccess(responseCode: string, transactionStatus?: string): boolean {
        return this.resolveFromResponseCode(responseCode, transactionStatus) === PaymentState.SUCCESS;
    }

    /**
     * Lấy danh sách trạng thái có thể chuyển đến từ trạng thái hiện tại
     * @en Get list of valid target states from current state
     */
    getAllowedTransitions(currentState: PaymentState): PaymentState[] {
        return VALID_TRANSITIONS[currentState] ?? [];
    }
}
