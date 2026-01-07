import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpService = this.configService.get<string>('SMTP_SERVICE') || 'gmail';
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    // Check if service looks like a hostname (e.g. smtp.brevo.com) or is explicitly 'gmail'
    if (smtpService.includes('.') || smtpService === 'smtp-relay.brevo.com') {
      // Use generic SMTP configuration for Brevo/SendinBlue or others
      this.transporter = nodemailer.createTransport({
        host: smtpService,
        port: 587, // Standard SMTP port (STARTTLS)
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    } else {
      // Use built-in service support (e.g. 'gmail')
      this.transporter = nodemailer.createTransport({
        service: smtpService,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    }
  }

  async sendVerificationEmail(toEmail: string, name: string, code: string) {
    try {
      const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com';

      const html = `
        <p>Bonjour ${name || ''},</p>
        <p>Merci de vous être inscrit. Voici votre code de vérification :</p>
        <h2 style="letter-spacing:4px">${code}</h2>
        <p>Entrez ce code dans l'application pour vérifier votre adresse email.</p>
        <p>Si vous n'avez pas demandé d'inscription, ignorez ce message.</p>
      `;

      const info = await this.transporter.sendMail({
        from,
        to: toEmail,
        subject: 'Vérification de votre adresse email',
        html,
      });

      return { message: 'Email envoyé', info };
    } catch (error) {
      console.error('Erreur Nodemailer:', error);
      throw new InternalServerErrorException('Impossible d’envoyer l’email de vérification');
    }
  }
}
