import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ 
    description: 'Numéro de téléphone au format international ou local. Si le format local est utilisé (sans +), le préfixe +216 sera automatiquement ajouté pour la Tunisie.', 
    example: '+21612345678',
    examples: {
      international: {
        summary: 'Format international',
        value: '+21612345678',
        description: 'Numéro avec indicatif pays'
      },
      local: {
        summary: 'Format local (Tunisie)',
        value: '12345678',
        description: 'Numéro local, sera converti en +21612345678'
      }
    },
    pattern: '^\\+?\\d{8,15}$',
    minLength: 8,
    maxLength: 15
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?\d{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone: string;
}

