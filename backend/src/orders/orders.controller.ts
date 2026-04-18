import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

interface DeliveryInfo {
  customerName: string;
  phone: string;
  deliveryMethod: string;
  deliveryAddress: string;
  comment?: string;
}

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async create(
    @Body()
    body: {
      telegramId: string;
      items: { productId: number; quantity: number }[];
      promoCode?: string;
      bonusPoints?: number;
      delivery: DeliveryInfo;
    },
  ) {
    return this.ordersService.create(
      BigInt(body.telegramId),
      body.items,
      body.promoCode,
      body.bonusPoints,
      body.delivery,
    );
  }

  @Get('user/:telegramId')
  async userOrders(@Param('telegramId') telegramId: string) {
    return this.ordersService.getUserOrders(BigInt(telegramId));
  }
}
