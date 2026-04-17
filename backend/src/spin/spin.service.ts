import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { randomInt } from 'crypto';

@Injectable()
export class SpinService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async canSpin(userId: number): Promise<boolean> {
    const key = `spin:daily:${userId}:${this.todayKey()}`;
    const used = await this.redis.get(key);
    return !used;
  }

  async spin(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) throw new BadRequestException('Користувач не знайдений');

    const allowed = await this.canSpin(user.id);
    if (!allowed) {
      throw new BadRequestException('Сьогодні спін вже використано!');
    }

    const prizes = await this.prisma.wheelPrize.findMany({
      where: { isActive: true },
    });

    if (prizes.length === 0) {
      throw new BadRequestException('Призи не налаштовані');
    }

    const prize = this.selectPrize(prizes);

    const log = await this.prisma.spinLog.create({
      data: { userId: user.id, prizeId: prize.id },
    });

    if (prize.type === 'BONUS_POINTS') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { bonusBalance: { increment: prize.value } },
      });
    }

    // Записываем что спин использован — сбросится в полночь
    const key = `spin:daily:${user.id}:${this.todayKey()}`;
    await this.redis.set(key, '1', 86400);

    return {
      prize: {
        label: prize.label,
        type: prize.type,
        value: prize.value,
      },
      logId: log.id,
    };
  }

  async getStatus(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        spinLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { prize: true },
        },
      },
    });
    return user;
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