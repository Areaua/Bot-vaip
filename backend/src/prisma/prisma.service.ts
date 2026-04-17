import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL!,
    });
    this.client = new PrismaClient({ adapter } as any);
  }

  get user() { return this.client.user; }
  get wheelPrize() { return this.client.wheelPrize; }
  get spinLog() { return this.client.spinLog; }
  get order() { return this.client.order; }
  get orderItem() { return this.client.orderItem; }
  get product() { return this.client.product; }
  get userPromo() { return this.client.userPromo; }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}