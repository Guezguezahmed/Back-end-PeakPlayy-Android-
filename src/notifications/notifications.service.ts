// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from 'src/schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  // **C**REATE (System/OWNER triggered)
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto);
    return newNotification.save();
  }

  // **R**EAD All (Admin/OWNER audit)
  findAll(): Promise<Notification[]> {
    return this.notificationModel
      .find()
      .populate('id_destinataire', 'nom prenom') // Show who received it
      .exec();
  }
  
  // Custom Read: Get notifications for a specific user
  findUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ id_destinataire: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .exec();
  }

  // **R**EAD One
  findOne(id: string): Promise<Notification | null> {
    return this.notificationModel.findById(id).exec();
  }

  // **U**PDATE (Mark as read)
  update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  // **D**ELETE
  remove(id: string): Promise<any> {
    return this.notificationModel.findByIdAndDelete(id).exec();
  }
}