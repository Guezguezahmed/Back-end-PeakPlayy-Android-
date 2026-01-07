import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/schemas/user.schemas';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/verifmail/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  // validate for login: also block if not verified
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    const matched = await bcrypt.compare(password, user.password);
    if (user && matched) {
      if (!user.isVerified) {
        throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter.');
      }
      const { password: _p, verificationCode: _v, codeExpiresAt: _c, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      userId: user._id.toString(),
      role: user.role,
    };
    return {
      user: user,
      access_token: this.jwtService.sign(payload),
    };
  }

  // register: create user (isVerified false). Front should call send-code after register.
  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Utilisateur déjà existant');
    }

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isVerified: false,
      verificationCode: null,
      codeExpiresAt: null,
    });
    const saved = await newUser.save();

    // Generate and send verification code (non-blocking)
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      saved.verificationCode = code;
      saved.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await saved.save();

      await this.emailService.sendVerificationEmail(saved.email, saved.prenom, code);
      console.log(`Verification code sent to ${saved.email}`);
    } catch (err) {
      console.error('Failed to send verification email:', err?.message || err);
    }

    // Don't return password, verificationCode, or codeExpiresAt
    const userObject = saved.toObject();
    const { password, verificationCode, codeExpiresAt, ...result } = userObject as any;
    return result;
  }

  // send-code: only if user exists
  async sendVerificationCode(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = code;
    user.codeExpiresAt = expiresAt;
    await user.save();

    await this.emailService.sendVerificationEmail(user.email, user.prenom, code);
    return { message: 'Code envoyé avec succès' };
  }

  // verify-code: validate and mark isVerified = true
  async verifyCode(email: string, code: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (user.verificationCode !== code) throw new UnauthorizedException('Code incorrect');

    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      user.verificationCode = null;
      user.codeExpiresAt = null;
      await user.save();
      throw new UnauthorizedException('Code expiré');
    }

    // success: mark verified and clear code
    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();

    return { message: 'Compte vérifié avec succès' };
  }

  /**
   * Envoie un code de réinitialisation si l'utilisateur existe.
   */
  async sendPasswordResetCode(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = code;
    user.codeExpiresAt = expiresAt;
    await user.save();

    try {
      await this.emailService.sendVerificationEmail(user.email, user.prenom, code);
    } catch (err) {
      user.verificationCode = null;
      user.codeExpiresAt = null;
      await user.save();
      throw new InternalServerErrorException('Impossible d\'envoyer l\'email de reinitialisation');
    }

    return { message: 'Code de réinitialisation envoyé par email' };
  }

  /**
   * Vérifie uniquement le code (utilisé pour l'étape où l'utilisateur entre le code).
   * Ne modifie pas le mot de passe ni ne supprime le code : la suppression se fait après reset.
   */
  async verifyPasswordResetCode(email: string, code: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new UnauthorizedException('Code incorrect');
    }

    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      user.verificationCode = null;
      user.codeExpiresAt = null;
      await user.save();
      throw new UnauthorizedException('Code expiré');
    }

    return { message: 'Code valide' };
  }

  /**
   * Reset le mot de passe : vérifie le code puis remplace le password hashé,
   * supprime code et expiresAt après succès.
   */
  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    if (!user.verificationCode || user.verificationCode !== code) {
      throw new UnauthorizedException('Code incorrect');
    }

    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      user.verificationCode = null;
      user.codeExpiresAt = null;
      await user.save();
      throw new UnauthorizedException('Code expiré');
    }

    // Everything OK -> hash and replace password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    // clear reset code
    user.verificationCode = null;
    user.codeExpiresAt = null;
    await user.save();

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}