import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt'; 
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { UsersModule } from 'src/users/users.module'; 

import { User, UserSchema } from 'src/schemas/user.schemas';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy'; 
import { EmailService } from 'src/verifmail/email.service';

import { GoogleAuthGuard } from './guards/google-auth.guard';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule, 
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
        secret: configService.get<string>('jwt.secret')!, 
        signOptions: { 
          // CORRECTION FINALE: Utilisation de 'as any' pour résoudre l'incompatibilité de type entre 'string' et 'StringValue | number'.
          expiresIn: configService.get<string>('jwt.expiresIn')! as any, 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
   
    GoogleAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService so GoogleApiModule can use it
})
export class AuthModule {}