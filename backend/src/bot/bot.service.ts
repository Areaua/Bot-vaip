import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Bot, InlineKeyboard } from 'grammy';
import { UsersService } from '../users/users.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  readonly bot: Bot;

  constructor(private usersService: UsersService) {
    this.bot = new Bot(process.env.BOT_TOKEN!);
    this.setupHandlers();
  }

  async onModuleInit() {
    this.bot.start({ onStart: () => this.logger.log('Bot started (long polling)') });
  }

  async onModuleDestroy() {
    await this.bot.stop();
  }

  private setupHandlers() {
    // ── /start ──────────────────────────────────────────────────────────────
    this.bot.command('start', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;

      const param = ctx.match as string | undefined;
      const referralCode = param?.startsWith('ref_') ? param.slice(4) : undefined;

      try {
        await this.usersService.getOrCreate(
          BigInt(tgUser.id),
          tgUser.username,
          tgUser.first_name,
          referralCode,
        );
      } catch { /* user already exists */ }

      const name = tgUser.first_name ?? 'друже';
      const miniappUrl = process.env.MINIAPP_URL ?? '';
      const keyboard = new InlineKeyboard().webApp('🛍 Відкрити VOLT VAPE', miniappUrl);

      await ctx.reply(
        `⚡ <b>Ласкаво просимо до VOLT VAPE, ${name}!</b>\n\n` +
        `🎡 Крути колесо щодня — вигравай знижки та промокоди\n` +
        `🛍 Купуй преміальні рідини та одноразки\n` +
        `⭐ Накопичуй бали та отримуй знижки\n` +
        `👥 Запрошуй друзів — +50 балів за кожного\n\n` +
        `Натисни кнопку нижче щоб відкрити магазин:`,
        { parse_mode: 'HTML', reply_markup: keyboard },
      );
    });

    // ── /profile ────────────────────────────────────────────────────────────
    this.bot.command('profile', async (ctx) => {
      const tgUser = ctx.from;
      if (!tgUser) return;

      try {
        const profile = await this.usersService.getProfile(BigInt(tgUser.id));
        if (!profile) {
          await ctx.reply('Профіль не знайдено. Відкрийте магазин через /start');
          return;
        }

        const miniappUrl = process.env.MINIAPP_URL ?? '';
        const keyboard = new InlineKeyboard().webApp('⭐ Відкрити профіль', miniappUrl);

        await ctx.reply(
          `⚡ <b>Ваш профіль VOLT VAPE</b>\n\n` +
          `👤 ${profile.firstName ?? profile.username ?? 'Гравець'}\n` +
          `⭐ Баланс: <b>${profile.bonusBalance} балів</b>\n` +
          `🎡 Спінів: ${profile.spinLogs?.length ?? 0}\n` +
          `📦 Замовлень: ${profile.orders?.length ?? 0}\n\n` +
          `Реферальний код: <code>${profile.referralCode}</code>`,
          { parse_mode: 'HTML', reply_markup: keyboard },
        );
      } catch {
        await ctx.reply('Виникла помилка. Спробуйте ще раз.');
      }
    });

    // ── будь-яке інше повідомлення ───────────────────────────────────────────
    this.bot.on('message', async (ctx) => {
      if (ctx.message.text && !ctx.message.text.startsWith('/')) {
        const miniappUrl = process.env.MINIAPP_URL ?? '';
        const keyboard = new InlineKeyboard().webApp('🛍 Відкрити магазин', miniappUrl);
        await ctx.reply('Скористайтесь магазином щоб зробити замовлення:', { reply_markup: keyboard });
      }
    });

    this.bot.catch((err) => {
      this.logger.error(`Bot error: ${err.message}`);
    });
  }

  async sendMessage(chatId: bigint, text: string) {
    try {
      await this.bot.api.sendMessage(Number(chatId), text, { parse_mode: 'HTML' });
    } catch (e: any) {
      this.logger.warn(`Failed to send message to ${chatId}: ${e.message}`);
    }
  }
}
