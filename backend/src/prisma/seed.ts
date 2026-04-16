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
      { label: 'Chaser 10мл 🎯',       type: 'PHYSICAL_PRODUCT', value: 0,   probability: 0.01  },
    ],
  });

  console.log('Done! Prizes created.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());