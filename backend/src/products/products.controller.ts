import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('featured')
  featured() {
    return this.productsService.getFeatured();
  }

  @Get()
  list(@Query('category') category?: string) {
    return this.productsService.getAll(category);
  }
}
