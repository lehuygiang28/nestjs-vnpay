# nestjs-vnpay

<p align="center">
    <a href="https://www.npmjs.com/package/nestjs-vnpay" target="_blank"><img src="https://img.shields.io/npm/v/nestjs-vnpay" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/nestjs-vnpay" target="_blank"><img src="https://img.shields.io/npm/l/nestjs-vnpay" alt="Package License"><a>
    <a href="https://www.npmjs.com/package/nestjs-vnpay" target="_blank"><img src="https://img.shields.io/npm/d18m/nestjs-vnpay" alt="NPM Downloads"></a>
</p>

<strong>VNPay utilities module based on the [vnpay](https://www.npmjs.com/package/vnpay) package</strong>

## Tài liệu

### Tài liệu của thư viện: [vnpay.js.org](https://vnpay.js.org/)

### Tài liệu từ VNPay: [sandbox.vnpayment.vn/apis](https://sandbox.vnpayment.vn/apis)

## Cài đặt

Cài đặt `nestjs-vnpay` với `npm`:

```bash
$ npm install nestjs-vnpay vnpay
```

Cài đặt `nestjs-vnpay` với `yarn`:

```bash
$ yarn add nestjs-vnpay vnpay
```

Cài đặt `nestjs-vnpay` với `pnpm`:

```bash
$ pnpm install nestjs-vnpay vnpay
```

## Sử dụng

### Khởi tạo

#### Khởi tạo trong module

```ts filename="src/app.module.ts"
import { Module } from '@nestjs/common';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';

@Module({
  imports: [
    VnpayModule.register({
        tmnCode: 'YOUR_TMN_CODE',
        secureSecret: 'YOUR_SECURE_SECRET',
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
        hashAlgorithm: 'SHA512', // tùy chọn

        /**
         * Sử dụng enableLog để bật/tắt logger
         * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
         */
        enableLog: true, // tùy chọn

        /**
         * Hàm `loggerFn` sẽ được gọi để ghi log
         * Mặc định, loggerFn sẽ ghi log ra console
         * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
         *
         * `ignoreLogger` là một hàm không làm gì cả
         */
        loggerFn: ignoreLogger, // tùy chọn
    })
  ],
  controllers: [],
})
export class AppModule {}
```

#### Sử dụng trong service

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

## 🙌 Đóng góp

Các đóng góp được chào đón! Vui lòng tạo một issue hoặc pull request nếu bạn có bất kỳ đề xuất hoặc cải thiện nào.

## Giấy phép

**[MIT](LICENSE) © [Lê Huy Giang](https://github.com/lehuygiang28)**
