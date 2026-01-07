import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Vonage } from '@vonage/server-sdk';

@Injectable()
export class OtpService {
  private vonage: Vonage;

  private otpStore: Map<string, { code: string; expires: number }> = new Map();

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('vonage.apiKey');
    const apiSecret = this.configService.get<string>('vonage.apiSecret');

    if (!apiKey || !apiSecret) {
      console.warn('⚠️  Warning: Vonage API credentials are not configured. OTP SMS sending will fail.');
      console.warn('Please set VONAGE_API_KEY and VONAGE_API_SECRET in your .env file');
    }

    this.vonage = new Vonage({
      apiKey: apiKey || '',
      apiSecret: apiSecret || '',
    });
  }

  async sendOtp(phone: string) {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const brandName = this.configService.get<string>('vonage.brandName') || 'Vonage';

      const response = await this.vonage.sms.send({
        to: phone,
        from: brandName,
        text: `Your OTP code is: ${otpCode}`,
      });

      if (response.messages[0].status !== '0') {
        throw new Error(`Failed to send OTP: ${response.messages[0]['error-text']}`);
      }

      // Stocker OTP 2 minutes
      this.otpStore.set(phone, {
        code: otpCode,
        expires: Date.now() + 2 * 60 * 1000,
      });

      return { success: true, message: 'OTP envoyé avec succès' };
    } catch (err) {
      console.error('Erreur lors de l\'envoi OTP:', err);
      return { success: false, message: 'Échec de l\'envoi OTP', error: err.message };
    }
  }

  verifyOtp(phone: string, code: string) {
    const entry = this.otpStore.get(phone);

    if (!entry) {
      return { success: false, message: 'OTP non trouvé' };
    }

    if (Date.now() > entry.expires) {
      this.otpStore.delete(phone);
      return { success: false, message: 'OTP expiré' };
    }

    if (entry.code !== code) {
      return { success: false, message: 'OTP invalide' };
    }

    this.otpStore.delete(phone);

    return { success: true, message: 'OTP vérifié avec succès' };
  }
}

