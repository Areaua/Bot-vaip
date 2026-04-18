import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface OrderItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(
    telegramId: bigint,
    items: OrderItem[],
    promoCode?: string,
    bonusPointsToSpend = 0,
    delivery?: { customerName: string; phone: string; deliveryMethod: string; deliveryAddress: string; comment?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) throw new BadRequestException('Користувач не знайдений');

    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new BadRequestException(`Товар ${item.productId} не знайдений`);
      totalPrice += product.price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price: product.price };
    });

    let discount = 0;
    if (promoCode) {
      const promo = await this.prisma.userPromo.findFirst({
        where: { code: promoCode, userId: user.id, isUsed: false, expiresAt: { gt: new Date() } },
      });
      if (promo) {
        discount = promo.discount;
        await this.prisma.userPromo.update({
          where: { id: promo.id },
          data: { isUsed: true },
        });
      }
    }

    const priceAfterPromo = Math.round(totalPrice * (1 - discount / 100));

    // Списати бонусні бали (1 бал = 1 ₴, максимум 50% від суми)
    const maxBonus = Math.min(bonusPointsToSpend, user.bonusBalance, Math.floor(priceAfterPromo * 0.5));
    const bonusPointsUsed = Math.max(0, maxBonus);
    const finalPrice = priceAfterPromo - bonusPointsUsed;

    if (bonusPointsUsed > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { bonusBalance: { decrement: bonusPointsUsed } },
      });
    }

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        totalPrice: finalPrice,
        discount,
        promoCode,
        bonusPointsUsed,
        customerName: delivery?.customerName,
        phone: delivery?.phone,
        deliveryMethod: delivery?.deliveryMethod,
        deliveryAddress: delivery?.deliveryAddress,
        comment: delivery?.comment,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    // Нарахувати 1 бал за кожні 10 ₴
    const earnedPoints = Math.floor(finalPrice / 10);
    if (earnedPoints > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { bonusBalance: { increment: earnedPoints } },
      });
    }

    // +1 бонусний спін за покупку
    const bonusKey = `spin:bonus:${user.id}`;
    const cur = parseInt((await this.redis.get(bonusKey)) ?? '0');
    await this.redis.set(bonusKey, String(cur + 1), 86400 * 30);

    return order;
  }

  async getUserOrders(telegramId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) throw new BadRequestException('Користувач не знайдений');

    return this.prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
  }
}
