const { Bot, GrammyError, HttpError } = require("grammy");
const { hydrate } = require("@grammyjs/hydrate");
require("dotenv").config();

const bot = new Bot(process.env.BOT_API_KEY);

bot.use(hydrate());

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
]);

bot.command("start", async (ctx) => {
  await ctx.reply("Привет Я - English Buddy");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Произошла ошибка при обновлении ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Произошла ошибка при отправке запроса:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Произошла ошибка при подключении к серверам Telegram:", e);
  } else {
    console.error("Неопознанная ошибка:", e);
  }
});

bot.start();
