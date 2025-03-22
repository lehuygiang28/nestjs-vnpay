<div align="center">

# 📦 nestjs-vnpay

[🇻🇳 Tiếng Việt](./README.md) | [🇺🇸 English](./README_en-US.md)

[![NPM Version](https://img.shields.io/npm/v/nestjs-vnpay)](https://www.npmjs.com/package/nestjs-vnpay)
[![Package License](https://img.shields.io/npm/l/nestjs-vnpay)](https://www.npmjs.com/package/nestjs-vnpay)
[![NPM Downloads](https://img.shields.io/npm/d18m/nestjs-vnpay)](https://www.npmjs.com/package/nestjs-vnpay)

**NestJS module wrapper for [VNPay](https://vnpay.vn) payment gateway integration based on the [vnpay](https://www.npmjs.com/package/vnpay) package**

</div>

## 📚 Documentation

**Useful resources:**
- [vnpay.js.org](https://vnpay.js.org/) - Detailed library documentation
- [sandbox.vnpayment.vn/apis](https://sandbox.vnpayment.vn/apis) - Official VNPay integration documentation

## 🚀 Installation

```bash
# NPM
npm install nestjs-vnpay vnpay

# Yarn
yarn add nestjs-vnpay vnpay

# PNPM
pnpm install nestjs-vnpay vnpay
```

## 💡 Usage

### Register VnpayModule

#### Synchronous registration:

```ts
import { Module } from '@nestjs/common';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    VnpayModule.register({
        tmnCode: 'YOUR_TMN_CODE',
        secureSecret: 'YOUR_SECURE_SECRET',
        vnpayHost: 'https://sandbox.vnpayment.vn',

        // Optional configuration
        testMode: true,                // Test mode (overrides vnpayHost to sandbox if true)
        hashAlgorithm: 'SHA512',       // Hash algorithm
        enableLog: true,               // Enable/disable logging
        loggerFn: ignoreLogger,        // Custom logger function
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### Asynchronous registration (with ConfigService):

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
        }),
        VnpayModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secureSecret: configService.getOrThrow<string>('VNPAY_SECURE_SECRET'),
                tmnCode: configService.getOrThrow<string>('VNPAY_TMN_CODE'),
                loggerFn: ignoreLogger,
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
```

### Use in service

```ts
import { Injectable } from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';

@Injectable()
export class AppService {
  constructor(private readonly vnpayService: VnpayService) {}

  async getBankList() {
    return this.vnpayService.getBankList();
  }

  /* ... other methods ... */
}
```

## 🤝 Support & Contribution

**nestjs-vnpay is an open-source project**

If you find this library useful:
- Star ⭐️ the [GitHub repository](https://github.com/lehuygiang28/nestjs-vnpay)
- Contributions are always welcome! Please create an issue or pull request if you have any suggestions, improvements, or questions.

## 📄 License

[MIT](LICENSE) © [Lê Huy Giang](https://github.com/lehuygiang28)
