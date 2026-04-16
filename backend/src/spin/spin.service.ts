import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomInt } from 'crypto';

@Injectable()
export class SpinService {
  constructor(private prisma: PrismaService) {}

  async spin(telegramId: bigint) {
    // Находим юзера
    let user = await this.prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Получаем активные призы
    const prizes = await this.prisma.wheelPrize.findMany({
      where: { isActive: true },
    });

    if (prizes.length === 0) {
      throw new BadRequestException('Призы не настроены');
    }

    // CSPRNG выбор приза
    const prize = this.selectPrize(prizes);

    // Записываем лог спина
    const log = await this.prisma.spinLog.create({
      data: {
        userId: user.id,
        prizeId: prize.id,
      },
    });

    // Начисляем бонусы если BONUS_POINTS
    if (prize.type === 'BONUS_POINTS') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { bonusBalance: { increment: prize.value } },
      });
    }

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
}