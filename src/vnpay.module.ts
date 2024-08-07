import { type DynamicModule, Module, type Provider } from '@nestjs/common';

import type {
    VnpayModuleAsyncOptions,
    VnpayModuleOptions,
    VnpayModuleOptionsFactory,
} from './interfaces';
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

    static registerAsync(options: VnpayModuleAsyncOptions): DynamicModule {
        const allImports = [...new Set([...(options?.imports || [])])];

        return {
            module: VnpayModule,
            imports: allImports,
            providers: [
                ...VnpayModule.createAsyncProviders(options),
                ...(options?.extraProviders ?? []),
                VnpayService,
            ],
            exports: [VnpayService],
        };
    }

    private static createAsyncProviders(options: VnpayModuleAsyncOptions): Provider[] {
        if (options?.useExisting || options?.useFactory) {
            return [VnpayModule.createAsyncOptionsProvider(options)];
        }

        return [
            VnpayModule.createAsyncOptionsProvider(options),
            {
                provide: options?.useClass as any,
                useClass: options?.useClass as any,
            },
        ];
    }

    private static createAsyncOptionsProvider(options: VnpayModuleAsyncOptions): Provider {
        if (options?.useFactory) {
            return {
                provide: VNPAY_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options?.inject || [],
            };
        }

        return {
            provide: VNPAY_MODULE_OPTIONS,
            useFactory: async (optionsFactory: VnpayModuleOptionsFactory) =>
                optionsFactory.createVnpayOptions(),
            inject: [options?.useExisting || options?.useClass] as any[],
        };
    }
}
