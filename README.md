<div align="center">

# 📦 nestjs-vnpay

[🇻🇳 Tiếng Việt](./README.md) | [🇺🇸 English](./README_en-US.md)

[![NPM Version](https://img.shields.io/npm/v/nestjs-vnpay)](https://www.npmjs.com/package/nestjs-vnpay)
[![Package License](https://img.shields.io/npm/l/nestjs-vnpay)](https://www.npmjs.com/package/nestjs-vnpay)
[![NPM Downloads](https://img.shields.io/npm/d18m/nestjs-vnpay)](https://www.npmjs.com/package/nestjs-vnpay)

**Module tích hợp cổng thanh toán [VNPay](https://vnpay.vn) cho NestJS, dựa trên gói [vnpay](https://www.npmjs.com/package/vnpay)**

</div>

## 📚 Tài liệu

**Nguồn tài liệu hữu ích:**
- [vnpay.js.org](https://vnpay.js.org/) - Tài liệu chi tiết của thư viện
- [sandbox.vnpayment.vn/apis](https://sandbox.vnpayment.vn/apis) - Tài liệu tích hợp chính thức từ VNPay

## 🚀 Cài đặt

```bash
# NPM
npm install nestjs-vnpay vnpay

# Yarn
yarn add nestjs-vnpay vnpay

# PNPM
pnpm install nestjs-vnpay vnpay
```

## 💡 Sử dụng

### Khởi tạo VnpayModule

#### Khởi tạo đồng bộ:

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

        // Cấu hình tùy chọn
        testMode: true,                // Chế độ test (ghi đè vnpayHost thành sandbox nếu là true)
        hashAlgorithm: 'SHA512',       // Thuật toán mã hóa
        enableLog: true,               // Bật/tắt ghi log
        loggerFn: ignoreLogger,        // Hàm xử lý log tùy chỉnh
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### Khởi tạo bất đồng bộ (với ConfigService):

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

### Sử dụng trong service

```ts
import { Injectable } from '@nestjs/common';
import { VnpayService } from 'nestjs-vnpay';

@Injectable()
export class AppService {
  constructor(private readonly vnpayService: VnpayService) {}

  async getBankList() {
    return this.vnpayService.getBankList();
  }

  /* ... các phương thức khác ... */
}
```

## 🤝 Hỗ trợ & Đóng góp

**nestjs-vnpay là một dự án mã nguồn mở**

Nếu bạn thấy thư viện hữu ích:
- Tặng sao ⭐️ trên [GitHub](https://github.com/lehuygiang28/nestjs-vnpay)
- Các đóng góp luôn được đón nhận! Hãy tạo một issue hoặc pull request nếu bạn có bất kỳ đề xuất, cải thiện hoặc câu hỏi nào.

## 📄 Giấy phép

[MIT](LICENSE) © [Lê Huy Giang](https://github.com/lehuygiang28)
