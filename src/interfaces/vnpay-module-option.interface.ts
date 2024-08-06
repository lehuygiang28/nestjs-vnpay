import type { InjectionToken, ModuleMetadata, Provider, Type } from '@nestjs/common';
import type { VNPayConfig } from 'vnpay';

export interface VnpayModuleOptions extends VNPayConfig {}

export interface VnpayModuleOptionsFactory {
    createVnpayOptions(): Promise<VnpayModuleOptions> | VnpayModuleOptions;
}

export interface VnpayModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<VnpayModuleOptionsFactory> | InjectionToken<VnpayModuleOptionsFactory>;
    useClass?: Type<VnpayModuleOptionsFactory> | InjectionToken<VnpayModuleOptionsFactory>;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    useFactory?: (...args: any[]) => Promise<VnpayModuleOptions> | VnpayModuleOptions;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    inject?: any[];
    extraProviders?: Provider[];
}
