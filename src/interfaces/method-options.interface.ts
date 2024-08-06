import type {
    BuildPaymentUrlLogger,
    VerifyIpnCallLogger,
    VerifyReturnUrlLogger,
    BuildPaymentUrlOptions as _BuildPaymentUrlOptions,
    VerifyIpnCallOptions as _VerifyIpnCallOptions,
    VerifyReturnUrlOptions as _VerifyReturnUrlOptions,
} from 'vnpay';
import type {
    QueryDrResponseLogger,
    QueryDrResponseOptions as _QueryDrResponseOptions,
} from 'vnpay/lib/types/query-dr.type';
import type {
    RefundResponseLogger,
    RefundOptions as _RefundOptions,
} from 'vnpay/lib/types/refund.type';

export interface BuildPaymentUrlOptions
    extends _BuildPaymentUrlOptions<keyof BuildPaymentUrlLogger> {}

export interface VerifyReturnUrlOptions
    extends _VerifyReturnUrlOptions<keyof VerifyReturnUrlLogger> {}

export interface VerifyIpnCallOptions extends _VerifyIpnCallOptions<keyof VerifyIpnCallLogger> {}

export interface QueryDrOptions extends _QueryDrResponseOptions<keyof QueryDrResponseLogger> {}

export interface RefundOptions extends _RefundOptions<keyof RefundResponseLogger> {}
