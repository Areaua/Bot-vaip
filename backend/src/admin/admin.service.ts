import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalSpins, jackpotWins, totalOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.spinLog.count(),
      this.prisma.spinLog.count({ where: { prize: { type: 'PHYSICAL_PRODUCT' } } }),
      this.prisma.order.count(),
    ]);

    const revenue = await this.prisma.order.aggregate({ _sum: { totalPrice: true } });
    const conversionPercent =
      totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : '0';

    return { totalUsers, totalSpins, jackpotWins, totalOrders, revenue: revenue._sum.totalPrice ?? 0, conversionPercent };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { spinLogs: true, orders: true } } },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async getProducts() {
    return this.prisma.product.findMany({ orderBy: { id: 'asc' } });
  }

  async createProduct(data: { name: string; category: string; price: number; description?: string }) {
    return this.prisma.product.create({ data: { ...data, category: data.category as any } });
  }

  async updateProduct(id: number, data: Partial<{ name: string; price: number; inStock: boolean; description: string; category: string }>) {
    const { category, ...rest } = data;
    return this.prisma.product.update({
      where: { id },
      data: { ...rest, ...(category ? { category: category as any } : {}) },
    });
  }

  async deleteProduct(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  async getPrizes() {
    return this.prisma.wheelPrize.findMany({ orderBy: { id: 'asc' } });
  }

  async updatePrize(id: number, data: Partial<{ label: string; probability: number; value: number; isActive: boolean }>) {
    return this.prisma.wheelPrize.update({ where: { id }, data });
  }

  async grantPromo(telegramId: bigint, discount: number) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) throw new NotFoundException('Користувач не знайдений');

    const code = `ADMIN-${randomBytes(3).toString('hex').toUpperCase()}`;
    return this.prisma.userPromo.create({
      data: {
        userId: user.id,
        code,
        discount,
        isUsed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async grantBonus(telegramId: bigint, points: number) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) throw new NotFoundException('Користувач не знайдений');
    return this.prisma.user.update({
      where: { telegramId },
      data: { bonusBalance: { increment: points } },
    });
  }
}
