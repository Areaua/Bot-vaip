import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { PromoService } from './promo.service';

@Controller('promo')
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  async check(@Body() body: { code: string; telegramId: string }) {
    const result = await this.promoService.check(body.code, BigInt(body.telegramId));
    if (!result.valid) throw new UnauthorizedException('Невірний або використаний промокод');
    return { discount: result.discount };
  }
}
