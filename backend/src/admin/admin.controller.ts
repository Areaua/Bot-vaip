import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Headers,
  UnauthorizedException, BadRequestException, ParseIntPipe,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  private auth(key: string) {
    if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET)
      throw new UnauthorizedException('Невірний ключ адміна');
  }

  @Get('stats')
  stats(@Headers('x-admin-key') key: string) {
    this.auth(key);
    return this.adminService.getStats();
  }

  @Get('users')
  users(@Headers('x-admin-key') key: string, @Query('page') page = '1') {
    this.auth(key);
    return this.adminService.getUsers(parseInt(page));
  }

  @Get('products')
  products(@Headers('x-admin-key') key: string) {
    this.auth(key);
    return this.adminService.getProducts();
  }

  @Post('products')
  createProduct(@Headers('x-admin-key') key: string, @Body() body: any) {
    this.auth(key);
    return this.adminService.createProduct(body);
  }

  @Put('products/:id')
  updateProduct(
    @Headers('x-admin-key') key: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.auth(key);
    return this.adminService.updateProduct(id, body);
  }

  @Delete('products/:id')
  deleteProduct(@Headers('x-admin-key') key: string, @Param('id', ParseIntPipe) id: number) {
    this.auth(key);
    return this.adminService.deleteProduct(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (_req: any, file: Express.Multer.File, cb: (err: Error | null, accept: boolean) => void) => {
      if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'), false);
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  upload(
    @Headers('x-admin-key') key: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.auth(key);
    if (!file) throw new BadRequestException('Файл не завантажено');
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return { url: base64 };
  }

  @Get('orders')
  orders(
    @Headers('x-admin-key') key: string,
    @Query('page') page = '1',
    @Query('status') status?: string,
  ) {
    this.auth(key);
    return this.adminService.getOrders(parseInt(page), status);
  }

  @Put('orders/:id/status')
  updateOrderStatus(
    @Headers('x-admin-key') key: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    this.auth(key);
    return this.adminService.updateOrderStatus(id, body.status);
  }

  @Get('prizes')
  prizes(@Headers('x-admin-key') key: string) {
    this.auth(key);
    return this.adminService.getPrizes();
  }

  @Put('prizes/:id')
  updatePrize(
    @Headers('x-admin-key') key: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    this.auth(key);
    return this.adminService.updatePrize(id, body);
  }

  @Post('grant/promo')
  grantPromo(
    @Headers('x-admin-key') key: string,
    @Body() body: { telegramId: string; discount: number },
  ) {
    this.auth(key);
    return this.adminService.grantPromo(BigInt(body.telegramId), body.discount);
  }

  @Post('grant/bonus')
  grantBonus(
    @Headers('x-admin-key') key: string,
    @Body() body: { telegramId: string; points: number },
  ) {
    this.auth(key);
    return this.adminService.grantBonus(BigInt(body.telegramId), body.points);
  }
}
