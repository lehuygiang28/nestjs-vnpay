import { Inject, Injectable } from '@nestjs/common';

import { VNPay } from 'vnpay';
import type {
    Bank,
    BuildPaymentUrl,
    QueryDr,
    QueryDrResponse,
    Refund,
    ReturnQueryFromVNPay,
    VerifyIpnCall,
    VerifyReturnUrl,
} from 'vnpay';

import type {
    BuildPaymentUrlOptions,
    QueryDrOptions,
    RefundOptions,
    VerifyIpnCallOptions,
    VerifyReturnUrlOptions,
    VnpayModuleOptions,
} from './interfaces/';
import { VNPAY_MODULE_OPTIONS } from './vnpay.constant';

@Injectable()
export class VnpayService {
    private readonly vnpayInstance: VNPay;

    constructor(@Inject(VNPAY_MODULE_OPTIONS) private readonly options: VnpayModuleOptions) {
        this.vnpayInstance = new VNPay(this.options);
    }

    /**
     * Lấy danh sách ngân hàng
     * @en Get list of banks
     * @returns {Promise<Bank[]>} List of banks
     */
    async getBankList(): Promise<Bank[]> {
        return this.vnpayInstance.getBankList();
    }

    /**
     * Phương thức xây dựng, tạo thành url thanh toán của VNPay
     * @en Build the payment url
     *
     * @param {BuildPaymentUrl} data - Payload that contains the information to build the payment url
     * @param {BuildPaymentUrlOptions} options - Options
     * @returns {string} The payment url string
     * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#tao-url-thanh-toan
     */
    buildPaymentUrl(data: BuildPaymentUrl, options?: BuildPaymentUrlOptions): string {
        return this.vnpayInstance.buildPaymentUrl(data, options);
    }

    /**
     * Phương thức xác thực tính đúng đắn của các tham số trả về từ VNPay
     * @en Method to verify the return url from VNPay
     *
     * @param {ReturnQueryFromVNPay} query - The object of data return from VNPay
     * @param {VerifyReturnUrlOptions} options - Options
     * @returns {VerifyReturnUrl} The return object
     * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#code-returnurl
     */
    async verifyReturnUrl(
        data: ReturnQueryFromVNPay,
        options?: VerifyReturnUrlOptions,
    ): Promise<VerifyReturnUrl> {
        return this.vnpayInstance.verifyReturnUrl(data, options);
    }

    /**
     * Phương thức xác thực tính đúng đắn của lời gọi ipn từ VNPay
     *
     * Sau khi nhận được lời gọi, hệ thống merchant cần xác thực dữ liệu nhận được từ VNPay, kiểm tra đơn hàng có hợp lệ không, kiểm tra số tiền thanh toán có đúng không.
     *
     * Sau đó phản hồi lại VNPay kết quả xác thực thông qua các `IpnResponse`
     *
     * @en Method to verify the ipn url from VNPay
     *
     * After receiving the call, the merchant system needs to verify the data received from VNPay, check if the order is valid, check if the payment amount is correct.
     *
     * Then respond to VNPay the verification result through the `IpnResponse`
     *
     * @param {ReturnQueryFromVNPay} query The object of data return from VNPay
     * @param {VerifyIpnCallOptions} options - Options
     * @returns {VerifyIpnCall} The return object
     * @see https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#code-ipn-url
     */
    async verifyIpnCall(
        data: ReturnQueryFromVNPay,
        options?: VerifyIpnCallOptions,
    ): Promise<VerifyIpnCall> {
        return this.vnpayInstance.verifyIpnCall(data, options);
    }

    /**
     * Đây là API để hệ thống merchant truy vấn kết quả thanh toán của giao dịch tại hệ thống VNPAY.
     *
     * @en This is the API for the merchant system to query the payment result of the transaction at the VNPAY system.
     *
     * @param {QueryDr} query - The data to query payment result
     * @param {QueryDrOptions} options - Options
     * @returns {Promise<QueryDrResponse>} The data return from VNPay and after verified
     * @see https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html#truy-van-ket-qua-thanh-toan-PAY
     */
    async queryDr(data: QueryDr, options?: QueryDrOptions): Promise<QueryDrResponse> {
        return this.vnpayInstance.queryDr(data, options);
    }

    /**
     * Đây là API để hệ thống merchant gửi yêu cầu hoàn tiền cho giao dịch qua hệ thống Cổng thanh toán VNPAY.
     *
     * @en This is the API for the merchant system to refund the transaction at the VNPAY system.
     * @param {Refund} data - The data to request refund
     * @param {RefundOptions} options - Options
     * @returns The data return from VNPay
     * @see https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html#hoan-tien-thanh-toan-PAY
     */
    async refund(data: Refund, options?: RefundOptions) {
        return this.vnpayInstance.refund(data, options);
    }
}
