export type TelegramNotificationChannel = 'hr' | 'it' | 'verbose' | 'log';

function getChatId(channel: TelegramNotificationChannel): string | undefined {
  switch (channel) {
    case 'hr':
      return process.env.NOTIFY_TG_HR;
    case 'it':
      return process.env.NOTIFY_TG_IT;
    case 'verbose':
    case 'log':
      return process.env.NOTIFY_TG_VERBOSE;
  }
}

export async function notifyTelegram(params: {
  channel: TelegramNotificationChannel;
  text: string;
}): Promise<void> {
  if (process.env.AUTOMATION_DRY_RUN === '1') {
    console.log(`[DRY RUN][telegram:${params.channel}] ${params.text}`);
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = getChatId(params.channel);

  if (!token || !chatId) {
    console.warn(
      `[telegram:${params.channel}] Missing TELEGRAM_BOT_TOKEN or chat id; notification skipped.`
    );
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: params.text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Telegram notification failed: ${await response.text()}`);
  }
}
