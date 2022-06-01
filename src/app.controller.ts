import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthGuard } from './auth.guard';
import { CheckQrcodeDto } from './dto/check-qrcode.dto';
import { GenerateQrcodeDto } from './dto/generate-qrcode.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    throw new ForbiddenException();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/qrcode/generate')
  async generateQrcode(@Body() generateQrcodeDto: GenerateQrcodeDto) {
    return await this.appService.generateQrcode(generateQrcodeDto);
  }

  @Post('/qrcode/check')
  async check(@Body() checkQrcodeDto: CheckQrcodeDto) {
    return await this.appService.checkQrcode(checkQrcodeDto);
  }
}
