import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Bot, InlineKeyboard } from 'grammy';
import { UsersService } from '../users/users.service';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  readonly bot: Bot;

  // msgId відповіді адміна → telegramId юзера
  private readonly supportMap = new Map<number, bigint>();

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

    // ── /reply <telegramId> <text> — відповідь адміна юзеру ────────────────
    this.bot.command('reply', async (ctx) => {
      const adminChatId = process.env.ADMIN_CHAT_ID
      if (!ctx.from || String(ctx.from.id) !== adminChatId) return
      const parts = (ctx.match as string ?? '').split(' ')
      const targetId = parts[0]
      const text = parts.slice(1).join(' ')
      if (!targetId || !text) {
        await ctx.reply('Використання: /reply 123456789 текст відповіді')
        return
      }
      try {
        await this.bot.api.sendMessage(Number(targetId),
          `💬 <b>Відповідь підтримки VOLT VAPE:</b>\n\n${text}`,
          { parse_mode: 'HTML' })
        await ctx.reply('✅ Відповідь надіслана')
      } catch {
        await ctx.reply('❌ Не вдалось надіслати')
      }
    })

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

    // ── Відповідь адміна на forwarded повідомлення → переслати юзеру ────────
    this.bot.on('message', async (ctx) => {
      const from = ctx.from;
      if (!from) return;

      const adminChatId = process.env.ADMIN_CHAT_ID;
      const isAdmin = adminChatId && String(from.id) === adminChatId;

      // Адмін відповідає на forwarded — переслати юзеру
      if (isAdmin && ctx.message.reply_to_message) {
        const replyToId = ctx.message.reply_to_message.message_id;
        const userTgId = this.supportMap.get(replyToId);
        if (userTgId) {
          const text = ctx.message.text ?? ctx.message.caption ?? '';
          if (text) {
            await this.bot.api.sendMessage(
              Number(userTgId),
              `💬 <b>Відповідь підтримки VOLT VAPE:</b>\n\n${text}`,
              { parse_mode: 'HTML' },
            );
            await ctx.react('👍').catch(() => {});
          }
          return;
        }
      }

      // Звичайне повідомлення юзера → переслати адміну
      if (!isAdmin && ctx.message.text && !ctx.message.text.startsWith('/')) {
        const miniappUrl = process.env.MINIAPP_URL ?? '';
        const keyboard = new InlineKeyboard().webApp('🛍 Відкрити магазин', miniappUrl);

        if (adminChatId && /^\d+$/.test(adminChatId)) {
          const name = from.first_name ?? from.username ?? 'Користувач';
          const tag  = from.username ? ` (@${from.username})` : '';
          const forwarded = await this.bot.api.sendMessage(
            Number(adminChatId),
            `💬 <b>Повідомлення від ${name}${tag}</b> [<code>${from.id}</code>]:\n\n${ctx.message.text}\n\n<i>Відповідайте на це повідомлення щоб написати клієнту</i>`,
            { parse_mode: 'HTML' },
          );
          // Зберегти mapping: messageId → telegramId юзера
          this.supportMap.set(forwarded.message_id, BigInt(from.id));
          // Очистити старі записи (зберігаємо max 500)
          if (this.supportMap.size > 500) {
            const firstKey = this.supportMap.keys().next().value;
            this.supportMap.delete(firstKey);
          }
        }

        await ctx.reply(
          '✉️ Ваше повідомлення надіслано підтримці. Незабаром вам відповідять!',
          { reply_markup: keyboard },
        );
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

  async sendSupportToAdmin(userTgId: bigint, name: string, tag: string, text: string) {
    const adminChatId = process.env.ADMIN_CHAT_ID;
    if (!adminChatId || !/^\d+$/.test(adminChatId)) return;
    try {
      const sent = await this.bot.api.sendMessage(
        Number(adminChatId),
        `💬 <b>Звернення в підтримку</b>\n👤 ${name}${tag} [<code>${userTgId}</code>]\n\n${text}\n\n<i>Відповідайте reply на це повідомлення</i>`,
        { parse_mode: 'HTML' },
      );
      this.supportMap.set(sent.message_id, userTgId);
      if (this.supportMap.size > 500) {
        const first = this.supportMap.keys().next().value;
        this.supportMap.delete(first);
      }
    } catch (e: any) {
      this.logger.warn(`sendSupportToAdmin error: ${e.message}`);
    }
  }
}
