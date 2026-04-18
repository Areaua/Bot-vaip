import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { randomInt, randomBytes } from 'crypto';

@Injectable()
export class SpinService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private async checkCanSpin(userId: number): Promise<{ canSpin: boolean; isBonusSpin: boolean }> {
    const dailyKey = `spin:daily:${userId}:${this.todayKey()}`;
    const dailyUsed = await this.redis.get(dailyKey);
    if (!dailyUsed) return { canSpin: true, isBonusSpin: false };

    const bonusKey = `spin:bonus:${userId}`;
    const bonusCount = parseInt((await this.redis.get(bonusKey)) ?? '0');
    if (bonusCount > 0) return { canSpin: true, isBonusSpin: true };

    return { canSpin: false, isBonusSpin: false };
  }

  async spin(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) throw new BadRequestException('Користувач не знайдений');

    const { canSpin, isBonusSpin } = await this.checkCanSpin(user.id);
    if (!canSpin) throw new BadRequestException('Сьогодні спін вже використано!');

    const prizes = await this.prisma.wheelPrize.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
    if (prizes.length === 0) throw new BadRequestException('Призи не налаштовані');

    const prize = this.selectPrize(prizes);
    const segmentIndex = prizes.findIndex((p) => p.id === prize.id);

    let promoCode: string | undefined;

    if (prize.type === 'BONUS_POINTS') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { bonusBalance: { increment: prize.value } },
      });
    }

    if (prize.type === 'PROMO_CODE' || prize.type === 'DISCOUNT') {
      promoCode = `VOLT-${randomBytes(3).toString('hex').toUpperCase()}`;
      await this.prisma.userPromo.create({
        data: {
          userId: user.id,
          code: promoCode,
          discount: prize.value,
          isUsed: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const log = await this.prisma.spinLog.create({
      data: { userId: user.id, prizeId: prize.id, promoCode },
    });

    if (isBonusSpin) {
      const bonusKey = `spin:bonus:${user.id}`;
      const cur = parseInt((await this.redis.get(bonusKey)) ?? '0');
      await this.redis.set(bonusKey, String(Math.max(0, cur - 1)), 86400 * 30);
    } else {
      const dailyKey = `spin:daily:${user.id}:${this.todayKey()}`;
      await this.redis.set(dailyKey, '1', 86400);
    }

    return {
      prize: { label: prize.label, type: prize.type, value: prize.value },
      segmentIndex,
      promoCode,
      logId: log.id,
    };
  }

  async getStatus(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) return { canSpin: false, bonusBalance: 0, bonusSpins: 0 };
    const { canSpin } = await this.checkCanSpin(user.id);
    const bonusKey = `spin:bonus:${user.id}`;
    const bonusSpins = parseInt((await this.redis.get(bonusKey)) ?? '0');
    return { canSpin, bonusBalance: user.bonusBalance, bonusSpins };
  }

  private selectPrize(prizes: any[]) {
    const total = prizes.reduce((sum, p) => sum + p.probability, 0);
    const rand = randomInt(0, 1_000_000) / 1_000_000;
    let cumulative = 0;
    for (const prize of prizes) {
      cumulative += prize.probability / total;
      if (rand < cumulative) return prize;
    }
    return prizes[prizes.length - 1];
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
