import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async check(code: string, telegramId: bigint): Promise<{ valid: boolean; discount: number }> {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) return { valid: false, discount: 0 };

    const promo = await this.prisma.userPromo.findFirst({
      where: {
        code,
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!promo) return { valid: false, discount: 0 };
    return { valid: true, discount: promo.discount };
  }
}
