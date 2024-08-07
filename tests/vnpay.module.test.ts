import { Test } from '@nestjs/testing';

import type { VnpayModuleAsyncOptions, VnpayModuleOptions } from '../src/interfaces';
import { VNPAY_MODULE_OPTIONS } from '../src/vnpay.constant';
import { VnpayModule } from '../src/vnpay.module';
import { VnpayService } from '../src/vnpay.service';

describe('VnpayModule', () => {
    it('should create a dynamic module with options', async () => {
        const options: VnpayModuleOptions = {
            secureSecret: 'test',
            tmnCode: 'test',
        };

        const module = await Test.createTestingModule({
            imports: [VnpayModule.register(options)],
        }).compile();

        expect(module).toBeDefined();
        expect(module.get(VnpayService)).toBeDefined();
        expect(module.get(VNPAY_MODULE_OPTIONS)).toBe(options);
    });

    it('should create a dynamic module with async options', async () => {
        const options: VnpayModuleAsyncOptions = {
            useFactory: async () => {
                // Emulate async operation
                await new Promise((resolve) => setTimeout(resolve, 100));
                return {
                    secureSecret: 'test',
                    tmnCode: 'test',
                };
            },
        };

        const module = await Test.createTestingModule({
            imports: [VnpayModule.registerAsync(options)],
        }).compile();

        expect(module).toBeDefined();
        expect(module.get(VnpayService)).toBeDefined();
        expect(module.get(VNPAY_MODULE_OPTIONS)).toBeDefined();
    });
});
