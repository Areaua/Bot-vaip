import { Module } from '@nestjs/common';
import { SpinService } from './spin.service';
import { SpinController } from './spin.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SpinController],
  providers: [SpinService, PrismaService],
})
export class SpinModule {}