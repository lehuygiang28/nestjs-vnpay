import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import { VNPay } from 'vnpay';

import type {
    VnpayModuleAsyncOptions,
    VnpayModuleOptions,
    VnpayModuleOptionsFactory,
} from './interfaces';
import { VNPAY_INSTANCE_TOKEN, VNPAY_MODULE_OPTIONS } from './vnpay.constant';

@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: use for register module
export class VnpayModule {
    static register(options: VnpayModuleOptions): DynamicModule {
        return {
            module: VnpayModule,
            providers: [{ provide: VNPAY_INSTANCE_TOKEN, useValue: options || {} }],
        };
    }

    static registerAsync(options: VnpayModuleAsyncOptions): DynamicModule {
        return {
            module: VnpayModule,
            imports: options.imports || [],
            providers: [
                ...VnpayModule.createAsyncProviders(options),
                ...(options.extraProviders ?? []),
            ],
        };
    }

    private static createAsyncProviders(options: VnpayModuleAsyncOptions): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [VnpayModule.createAsyncOptionsProvider(options)];
        }
        return [
            VnpayModule.createAsyncOptionsProvider(options),
            {
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                provide: options?.useClass as any,
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                useClass: options?.useClass as any,
            },
        ];
    }

    private static createAsyncOptionsProvider(options: VnpayModuleAsyncOptions): Provider {
        if (options.useFactory) {
            return {
                provide: VNPAY_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: VNPAY_MODULE_OPTIONS,
            useFactory: async (optionsFactory: VnpayModuleOptionsFactory) =>
                optionsFactory.createVnpayOptions(),
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            inject: [options.useExisting || options.useClass] as any[],
        };
    }
}
