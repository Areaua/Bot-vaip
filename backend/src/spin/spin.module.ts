import { Module } from '@nestjs/common';
import { SpinService } from './spin.service';
import { SpinController } from './spin.controller';

@Module({
  providers: [SpinService],
  controllers: [SpinController]
})
export class SpinModule {}
