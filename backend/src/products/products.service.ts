import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CATEGORY_EMOJI: Record<string, string> = {
  LIQUID: '🧪',
  DISPOSABLE: '💨',
  ACCESSORY: '🔧',
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getAll(category?: string) {
    const where: any = { inStock: true };
    if (category) where.category = category;
    const products = await this.prisma.product.findMany({ where, orderBy: { id: 'asc' } });
    return products.map(p => ({ ...p, emoji: CATEGORY_EMOJI[p.category] ?? '📦' }));
  }

  async getFeatured() {
    // Хіти — найбільше продано за OrderItem
    const orderStats = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const hitIds = orderStats.map(s => s.productId);
    const hits = hitIds.length > 0
      ? await this.prisma.product.findMany({ where: { id: { in: hitIds }, inStock: true } })
      : [];

    // Новинки — додані за останні 4 дні
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const hitIdsFinal = hits.map(p => p.id);
    const newArrivals = await this.prisma.product.findMany({
      where: {
        inStock: true,
        id: { notIn: hitIdsFinal },
        createdAt: { gt: fourDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      hits: hits.map(p => ({ ...p, emoji: CATEGORY_EMOJI[p.category] ?? '📦', badge: 'Хіт' })),
      newArrivals: newArrivals.map(p => ({ ...p, emoji: CATEGORY_EMOJI[p.category] ?? '📦', badge: 'Новинка' })),
    };
  }
}
