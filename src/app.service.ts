import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AES, enc } from 'crypto-js';
import * as OTPAuth from 'otpauth';
import { randomBytes } from 'crypto';
import { GenerateQrcodeDto } from './dto/generate-qrcode.dto';
import { CheckQrcodeDto } from './dto/check-qrcode.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  private readonly AES_SECRET_KEY =
    this.configService.get<string>('AES_SECRET_KEY');

  private async getUser(id: number) {
    if (!id) {
      throw new BadRequestException('id is required');
    }
    let user = await this.usersRepository.findOne(id);
    if (!user) {
      user = new User({
        id,
        secretKey: randomBytes(128).toString('hex'),
      });
      await user.save();
    }
    return user;
  }

  private encrypt(message: string) {
    return AES.encrypt(message, this.AES_SECRET_KEY).toString();
  }

  private decrypt(message: string) {
    return AES.decrypt(message, this.AES_SECRET_KEY).toString(enc.Utf8);
  }

  async generateQrcode(generateQrcodeDto: GenerateQrcodeDto) {
    const user = await this.getUser(generateQrcodeDto.id);
    const totp = new OTPAuth.TOTP({
      issuer: 'ACME',
      label: 'AzureDiamond',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: user.secretKey,
    });
    const message = [
      generateQrcodeDto.id,
      generateQrcodeDto.companyId,
      generateQrcodeDto.name,
      totp.generate(),
    ].join('|');

    return {
      data: '#BE' + this.encrypt(message),
    };
  }

  async checkQrcode(checkQrcodeDto: CheckQrcodeDto) {
    try {
      const params = this.decrypt(checkQrcodeDto.data.slice(3)).split('|');

      if (params.length !== 4) {
        throw new ForbiddenException();
      }
      const [id, companyId, name, token] = params;

      const user = await this.getUser(+id);
      const totp = new OTPAuth.TOTP({
        issuer: 'ACME',
        label: 'AzureDiamond',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: user.secretKey,
      });
      const isValid = totp.validate({ token, window: +id > 0 ? 1 : 30 });

      return {
        id: +id,
        companyId: +companyId,
        name,
        isValid,
      };
    } catch (err) {
      throw new ForbiddenException('Invalid qrcode');
    }
  }
}
