import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Kafka consumer tự động kết nối qua lifecycle hook (OnModuleInit)
    // trong VnpayKafkaConsumer service

    await app.listen(3077);
    console.log('[+] NestJS VNPay Project is running on: http://localhost:3077');
}
bootstrap();
