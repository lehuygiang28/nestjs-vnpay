# nestjs-vnpay

<div style="text-align: center;">
    <h5>
        <a href="./README.md">VI</a>
        |
        <a href="./README_en-US.md">EN</a>
    </h5>
</div>
<br/>

<p align="center">
    <a href="https://www.npmjs.com/package/nestjs-vnpay" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-vnpay" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/nestjs-vnpay" target="_blank"><img src="https://img.shields.io/npm/l/nestjs-vnpay" alt="Package License"><a>
    <a href="https://www.npmjs.com/package/nestjs-vnpay" target="_blank"><img src="https://img.shields.io/npm/d18m/nestjs-vnpay" alt="NPM Downloads"></a>
</p>

**VNPay utilities module based on the [vnpay](https://www.npmjs.com/package/vnpay) package**

## Documentation

### Library documentation: [vnpay.js.org](https://vnpay.js.org/)

### Documentation from VNPay: [sandbox.vnpayment.vn/apis](https://sandbox.vnpayment.vn/apis)

## Installation

Install `nestjs-vnpay` with `npm`:

```bash
$ npm install nestjs-vnpay vnpay
```

Install `nestjs-vnpay` with `yarn`:

```bash
$ yarn add nestjs-vnpay vnpay
```

Install `nestjs-vnpay` with `pnpm`:

```bash
$ pnpm install nestjs-vnpay vnpay
```

## Usage

### Registration in module

- Synchronous registration:

```ts filename="src/app.module.ts"
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
        testMode: true, // optional, overrides vnpayHost to sandbox if true
        hashAlgorithm: 'SHA512', // optional

        /**
         * Use enableLog to enable/disable logger
         * If enableLog is false, loggerFn will not be used in any method
         */
        enableLog: true, // optional

        /**
         * The `loggerFn` function will be called to log
         * By default, loggerFn will log to the console
         * You can override loggerFn to log to another place
         *
         * `ignoreLogger` is a function that does nothing
         */
        loggerFn: ignoreLogger, // optional
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- Or asynchronous registration, for example using `ConfigService`:

```ts filename="src/app.module.ts"
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

```ts filename="src/app.service.ts"
import { Injectable } from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';

@Injectable()
export class AppService {
  constructor(private readonly vnpayService: VnpayService) {}

  async getBankList() {
    return this.vnpayService.getBankList();
  }

  /* ... */
}
```

## 🙌 Contribution

Contributions are always welcome! Please create an issue or pull request if you have any suggestions, improvements, or questions.

## License

**[MIT](LICENSE) © [Lê Huy Giang](https://github.com/lehuygiang28)**
