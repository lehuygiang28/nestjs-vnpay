import type {
    BuildPaymentUrlLogger,
    BuildPaymentUrlOptions as VnpayBuildPaymentUrlOptions,
    GenerateQrResponseLogger,
    GenerateQrResponseOptions as VnpayGenerateQrResponseOptions,
    QueryDrResponseLogger,
    QueryDrResponseOptions as VnpayQueryDrResponseOptions,
    RefundResponseLogger,
    RefundOptions as VnpayRefundOptions,
    VerifyIpnCallLogger,
    VerifyIpnCallOptions as VnpayVerifyIpnCallOptions,
    VerifyReturnUrlLogger,
    VerifyReturnUrlOptions as VnpayVerifyReturnUrlOptions,
} from 'vnpay';

export type BuildPaymentUrlOptions = VnpayBuildPaymentUrlOptions<keyof BuildPaymentUrlLogger>;

export type VerifyReturnUrlOptions = VnpayVerifyReturnUrlOptions<keyof VerifyReturnUrlLogger>;

export type VerifyIpnCallOptions = VnpayVerifyIpnCallOptions<keyof VerifyIpnCallLogger>;

export type QueryDrOptions = VnpayQueryDrResponseOptions<keyof QueryDrResponseLogger>;

export type RefundOptions = VnpayRefundOptions<keyof RefundResponseLogger>;

export type GenerateQrOptions = VnpayGenerateQrResponseOptions<keyof GenerateQrResponseLogger>;
