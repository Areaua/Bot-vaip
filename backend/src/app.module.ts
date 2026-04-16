import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { SpinModule } from './spin/spin.module';

@Module({
  imports: [PrismaModule, UsersModule, SpinModule],
})
export class AppModule {}