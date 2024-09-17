import { Bot, GrammyError, HttpError, InlineKeyboard } from "grammy";
import { hydrate } from "@grammyjs/hydrate";
import dotenv from "dotenv";

import { loadUsers, saveUsers } from "./utils/userStorage.js";
import { translateText } from "./utils/translate.js";

dotenv.config();

// Создание бота
const bot = new Bot(process.env.BOT_API_KEY);

// Использование плагинов
bot.use(hydrate());

let users = loadUsers();

// Список команд
bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
  {
    command: "registr",
    description: "Создание профиля",
  },
  {
    command: "choose",
    description: "Выбор формата занятия",
  },
  // {
  //   command: "translator",
  //   description: "Открыть переводчик",
  // },
  // {
  //   command: "dictionary",
  //   description: "Открыть словарь",
  // },
]);

// Создание клавиатур
const level = new InlineKeyboard()
  .text("Начальный 🌱", "level_start")
  .text("Средний 📏", "level_intermidiate");

const lesson = new InlineKeyboard()
  .text("Уроки и упражнения 📚✏️", "lessons")
  .row()
  .text("Игры и викторины 🎲🧩", "quiz")
  .row()
  .text("Разговорная практика 🗣️💬", "practice")
  .row()
  .text("Темы для обсуждения 🗨️🤔", "topics");

// Создание команд
bot.command("start", async (ctx) => {
  await ctx.reply(
    `Привет Я - English Buddy! 👋
Для того, чтобы создать профиль, введите команду /registr
Если вы уже зарегистрированы, введите команду /choose`
  );
});

bot.command("registr", async (ctx) => {
  const userId = ctx.from.id;
  if (users[userId]) {
    await ctx.reply(`Вы уже зарегистрированы как: ${users[userId].name}`);
  } else {
    await ctx.reply(`Давайте создадим профиль!
Введите ваше имя:`);
  }
});

bot.command("choose", async (ctx) => {
  await ctx.reply(`Выберите формат занятия:`, {
    reply_markup: lesson,
  });
});

// bot.command("translator", async (ctx) => {
//   await ctx.reply(`Введите текст, который хотите перевести в формате (текст; язык перевода)
// Например: ("привет; ru" или "hello; en")`);
// });

// bot.command("dictionary", async (ctx) => {
//   await ctx.reply(`Ваш словарь:`);
// });

bot.on(":text", async (ctx) => {
  const userId = ctx.from.id;

  // Если пользователь еще не зарегистрирован
  if (!users[userId]) {
    const name = ctx.message.text;

    if (name.length < 2) {
      await ctx.reply("Имя должно содержать больше двух букв!");
      return;
    }

    users[userId] = { name: ctx.message.text, level: null };
    saveUsers(users);
    await ctx.reply(
      `Отлично, ${ctx.message.text}! 
Теперь выберите уровень знания языка:`,
      {
        reply_markup: level,
      }
    );
  } else {
    const messageText = ctx.message.text;

    if (messageText.includes(";")) {
      const [textToTranslate, lang] = messageText.split(";");
      const toRussian = lang.trim().toLowerCase() === "ru";

      const translatedText = translateText(textToTranslate.trim(), toRussian);

      if (translatedText) {
        await ctx.reply(`Перевод: ${translatedText}`);
      } else {
        await ctx.reply("Произошла ошибка при переводе");
      }
    }
  }
});

// Обработка нажатий кнопок
bot.callbackQuery("level_start", async (ctx) => {
  const userId = ctx.from.id;
  if (!users[userId].level) {
    users[userId].level = "Начальный";
    saveUsers(users);
    await ctx.reply(
      `Профиль создан! 
Имя: <b>${users[userId].name}</b>
Уровень: <b>${users[userId].level}</b>
Теперь выберите формат занятия:`,
      {
        reply_markup: lesson,
        parse_mode: "HTML",
      }
    );
  }
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("level_intermidiate", async (ctx) => {
  const userId = ctx.from.id;
  if (!users[userId].level) {
    users[userId].level = "Средний";
    saveUsers(users);
    await ctx.reply(
      `Профиль создан! 
Имя: <b>${users[userId].name}</b> 
Уровень: <b>${users[userId].level}</b>
Теперь выберите формат занятия:`,
      {
        reply_markup: lesson,
        parse_mode: "HTML",
      }
    );
  }
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
