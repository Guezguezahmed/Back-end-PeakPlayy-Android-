import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiOperation } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('OTP - One-Time Password')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envoyer un code OTP par SMS',
    description: `
      **Envoie un code OTP (One-Time Password) de 6 chiffres par SMS via l'API Vonage.**
      
      **Fonctionnalités:**
      - Génère un code OTP aléatoire de 6 chiffres
      - Envoie le code par SMS au numéro de téléphone fourni
      - Le code est valide pendant 2 minutes
      - Format automatique: Si le numéro ne commence pas par "+", le préfixe "+216" (Tunisie) est ajouté
      
      **Configuration requise:**
      - \`VONAGE_API_KEY\` et \`VONAGE_API_SECRET\` doivent être configurés dans les variables d'environnement
      - \`VONAGE_BRAND_NAME\` (optionnel) pour personnaliser le nom de l'expéditeur
      
      **Format du numéro de téléphone:**
      - Format international: \`+21612345678\`
      - Format local: \`12345678\` (sera automatiquement converti en \`+21612345678\`)
    `,
  })
  @ApiBody({ 
    type: SendOtpDto,
    description: 'Numéro de téléphone au format international ou local',
    examples: {
      international: {
        summary: 'Format international',
        value: { phone: '+21612345678' }
      },
      local: {
        summary: 'Format local (Tunisie)',
        value: { phone: '12345678' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP envoyé avec succès',
    schema: {
      example: {
        success: true,
        message: 'OTP envoyé avec succès'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Erreur de validation ou numéro de téléphone invalide',
    schema: {
      example: {
        success: false,
        message: 'Le numéro de téléphone est requis'
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erreur lors de l\'envoi du SMS (problème avec l\'API Vonage)',
    schema: {
      example: {
        success: false,
        message: 'Échec de l\'envoi OTP',
        error: 'Failed to send OTP: Invalid phone number'
      }
    }
  })
  async sendOtp(@Body() dto: SendOtpDto) {
    // Validate phone number presence
    if (!dto.phone) {
      return { success: false, message: 'Le numéro de téléphone est requis' };
    }

    // Format phone number for Tunisia if not already international
    const formattedPhone = dto.phone.startsWith('+') ? dto.phone : '+216' + dto.phone;

    try {
      // Send OTP
      return await this.otpService.sendOtp(formattedPhone);
    } catch (error) {
      // Catch errors from SMS service
      return {
        success: false,
        message: error?.message || "Erreur lors de l'envoi de l'OTP",
      };
    }
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérifier un code OTP',
    description: `
      **Vérifie un code OTP reçu par SMS.**
      
      **Fonctionnalités:**
      - Vérifie que le code OTP correspond au numéro de téléphone
      - Vérifie que le code n'a pas expiré (validité: 2 minutes)
      - Supprime le code de la base de données après vérification réussie
      
      **Processus:**
      1. Le système recherche le code OTP associé au numéro de téléphone
      2. Vérifie que le code n'a pas expiré
      3. Compare le code fourni avec le code stocké
      4. Si valide, supprime le code et retourne un succès
      
      **Cas d'erreur:**
      - Code OTP non trouvé (pas de code envoyé pour ce numéro)
      - Code OTP expiré (plus de 2 minutes)
      - Code OTP invalide (code incorrect)
    `,
  })
  @ApiBody({ 
    type: VerifyOtpDto,
    description: 'Numéro de téléphone et code OTP à vérifier',
    examples: {
      example1: {
        summary: 'Exemple de vérification',
        value: {
          phone: '+21612345678',
          code: '123456'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP vérifié avec succès',
    schema: {
      example: {
        success: true,
        message: 'OTP vérifié avec succès'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'OTP invalide, expiré ou numéro/code manquant',
    schema: {
      examples: {
        missingFields: {
          summary: 'Champs manquants',
          value: {
            success: false,
            message: 'Numéro ou code manquant'
          }
        },
        notFound: {
          summary: 'OTP non trouvé',
          value: {
            success: false,
            message: 'OTP non trouvé'
          }
        },
        expired: {
          summary: 'OTP expiré',
          value: {
            success: false,
            message: 'OTP expiré'
          }
        },
        invalid: {
          summary: 'Code invalide',
          value: {
            success: false,
            message: 'OTP invalide'
          }
        }
      }
    }
  })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    // Validate phone and code presence
    if (!dto.phone || !dto.code) {
      return { success: false, message: 'Numéro ou code manquant' };
    }

    try {
      // Verify OTP
      return this.otpService.verifyOtp(dto.phone, dto.code);
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Erreur lors de la vérification de l'OTP",
      };
    }
  }
}

