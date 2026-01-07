import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: '+21612345678',
    description: 'Numéro de téléphone pour lequel le code OTP a été envoyé. Doit correspondre exactement au numéro utilisé lors de l\'envoi.',
    pattern: '^\\+?\\d{8,15}$',
    minLength: 8,
    maxLength: 15
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'Code OTP de 6 chiffres reçu par SMS. Le code est valide pendant 2 minutes après l\'envoi.',
    pattern: '^\\d{6}$',
    minLength: 6,
    maxLength: 6,
    examples: {
      valid: {
        summary: 'Code OTP valide',
        value: '123456',
        description: 'Code à 6 chiffres'
      }
    }
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Le code OTP doit contenir exactement 6 chiffres' })
  @Matches(/^\d{6}$/, { message: 'Le code OTP doit contenir uniquement des chiffres' })
  code: string;
}

