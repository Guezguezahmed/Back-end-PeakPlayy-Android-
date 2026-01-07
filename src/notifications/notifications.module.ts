// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from 'src/schemas/notification.schema'; // Correct absolute path

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}