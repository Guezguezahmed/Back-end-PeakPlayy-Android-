import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || 'no-reply@example.com';
    this.fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'DAM App';

    if (!this.apiKey) {
      this.logger.warn('BREVO_API_KEY is not set. Email sending will fail.');
    }
  }

  async sendVerificationEmail(toEmail: string, name: string, code: string) {
    if (!this.apiKey) {
      this.logger.error('Cannot send email: BREVO_API_KEY is missing');
      throw new InternalServerErrorException('Configuration email manquante');
    }

    const htmlContent = `
      <p>Bonjour ${name || ''},</p>
      <p>Merci de vous être inscrit. Voici votre code de vérification :</p>
      <h2 style="letter-spacing:4px">${code}</h2>
      <p>Entrez ce code dans l'application pour vérifier votre adresse email.</p>
      <p>Si vous n'avez pas demandé d'inscription, ignorez ce message.</p>
    `;

    const body = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: [
        {
          email: toEmail,
          name: name,
        },
      ],
      subject: 'Vérification de votre adresse email',
      htmlContent: htmlContent,
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Brevo API Error: ${JSON.stringify(errorData)}`);
        throw new Error(`Brevo API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`Email sent successfully to ${toEmail}. MessageId: ${data.messageId}`);
      return { message: 'Email envoyé', info: data };

    } catch (error) {
      this.logger.error('Error sending email via Brevo API:', error);
      throw new InternalServerErrorException('Impossible d’envoyer l’email de vérification');
    }
  }
}
