const { Bot, GrammyError, HttpError, InlineKeyboard } = require("grammy");
const { hydrate } = require("@grammyjs/hydrate");
require("dotenv").config();

// Создание бота
const bot = new Bot(process.env.BOT_API_KEY);

// Использование плагинов
bot.use(hydrate());

// Список команд
bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
  {
    command: "translator",
    description: "Открыть переводчик",
  },
  {
    command: "dictionary",
    description: "Открыть словарь",
  },
]);

const users = {};

// Создание клавиатур
const level = new InlineKeyboard()
  .text("Начальный", "level_start")
  .text("Средний", "level_intermidiate");

const start = new InlineKeyboard()
  .text("Уроки и упражнения", "lessons")
  .row()
  .text("Игры и викторины", "quiz")
  .row()
  .text("Разговорная практика", "practice")
  .row()
  .text("Темы для обсуждения", "topics");

// Создание команд
bot.command("start", async (ctx) => {
  await ctx.reply(
    `Привет Я - English Buddy! 
Давай создадим твой профиль. Введи своё имя:`
  );
});

bot.command("translator", async (ctx) => {
  await ctx.reply(`Введите слово, которое хотите перевести:`);
});

bot.command("dictionary", async (ctx) => {
  await ctx.reply(`Ваш словарь:`);
});

bot.on("message:text", async (ctx) => {
  const userId = ctx.from.id;

  // Если пользователь еще не зарегистрирован
  if (!users[userId]) {
    users[userId] = { name: ctx.message.text };
    await ctx.reply(
      `Отлично, ${ctx.message.text}! 
Теперь выбери уровень знания языка:`,
      {
        reply_markup: level,
      }
    );
  }
});

// Обработка нажатий кнопок
bot.callbackQuery("level_start", async (ctx) => {
  const userId = ctx.from.id;
  users[userId].level = "Начальный";
  await ctx.reply(
    `Профиль создан! 
Имя: <b>${users[userId].name}</b>
Уровень: <b>${users[userId].level}</b>
Теперь выбери формат занятия:`,
    {
      reply_markup: start,
      parse_mode: "HTML",
    }
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("level_intermidiate", async (ctx) => {
  const userId = ctx.from.id;
  users[userId].level = "Средний";
  await ctx.reply(
    `Профиль создан! 
Имя: <b>${users[userId].name}</b> 
Уровень: <b>${users[userId].level}</b>
Теперь выбери формат занятия:`,
    {
      reply_markup: start,
      parse_mode: "HTML",
    }
  );
  await ctx.answerCallbackQuery();
});

// Отлавливание ошибок
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

// Запуск бота
bot.start();
