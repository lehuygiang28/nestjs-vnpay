import type { ModuleMetadata, Provider, Type } from '@nestjs/common';
import type { VNPayConfig } from 'vnpay';

export interface VnpayModuleOptions extends VNPayConfig {}

export interface VnpayModuleOptionsFactory {
    createVnpayOptions(): Promise<VnpayModuleOptions> | VnpayModuleOptions;
}

export interface VnpayModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<VnpayModuleOptionsFactory>;
    useClass?: Type<VnpayModuleOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<VnpayModuleOptions> | VnpayModuleOptions;
    inject?: any[];
    extraProviders?: Provider[];
}
