import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding wheel prizes...');
  await prisma.wheelPrize.deleteMany();
  await prisma.wheelPrize.createMany({
    data: [
      { label: 'Знижка 5%',            type: 'DISCOUNT',         value: 5,   probability: 0.25  },
      { label: 'Знижка 10%',           type: 'DISCOUNT',         value: 10,  probability: 0.15  },
      { label: '50 бонусів',           type: 'BONUS_POINTS',     value: 50,  probability: 0.20  },
      { label: '100 бонусів',          type: 'BONUS_POINTS',     value: 100, probability: 0.10  },
      { label: 'Безкоштовна доставка', type: 'FREE_DELIVERY',    value: 0,   probability: 0.15  },
      { label: 'Промокод -15%',        type: 'PROMO_CODE',       value: 15,  probability: 0.08  },
      { label: 'Промокод -25%',        type: 'PROMO_CODE',       value: 25,  probability: 0.04  },
      { label: 'Подвійні бонуси',      type: 'BONUS_POINTS',     value: 200, probability: 0.005 },
      { label: '25 бонусів',           type: 'BONUS_POINTS',     value: 25,  probability: 0.105 },
      { label: '🎯 Chaser 10мл',       type: 'PHYSICAL_PRODUCT', value: 0,   probability: 0.01  },
    ],
  });
  console.log('Wheel prizes seeded.');

  console.log('Seeding products...');
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: [
      { name: 'LOST MARY 4000',    category: 'DISPOSABLE',  price: 380, description: 'Одноразка 4000 затяжок, 10 смаків', inStock: true  },
      { name: 'Elf Bar 1500',      category: 'DISPOSABLE',  price: 280, description: 'Компактна одноразка 1500 затяжок',  inStock: true  },
      { name: 'Chaser Salt 30мл',  category: 'LIQUID',      price: 180, description: 'Сольова рідина 30мл, 50мг',         inStock: true  },
      { name: 'Fruit Mix 60мл',    category: 'LIQUID',      price: 220, description: 'Фруктовий мікс 60мл, 3мг',          inStock: true  },
      { name: 'Coil для Pod',      category: 'ACCESSORY',   price: 120, description: 'Змінний випаровувач 0.8 Ом',        inStock: true  },
      { name: 'Кабель USB-C',      category: 'ACCESSORY',   price: 80,  description: 'Кабель для зарядки 1м',             inStock: true  },
    ],
  });
  console.log('Products seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
