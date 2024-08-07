import { type DynamicModule, Module } from '@nestjs/common';

import type { VnpayModuleOptions } from './interfaces';
import { VNPAY_MODULE_OPTIONS } from './vnpay.constant';
import { VnpayService } from './vnpay.service';

@Module({})
export class VnpayModule {
    static register(options: VnpayModuleOptions): DynamicModule {
        return {
            module: VnpayModule,
            providers: [{ provide: VNPAY_MODULE_OPTIONS, useValue: options || {} }, VnpayService],
            exports: [VnpayService],
        };
    }
}
