import fs from "fs";
import path from "path";

const __dirname = path.resolve();

// Ф-ция для загрузки пользователей из файла
export const loadUsers = () => {
  const filePath = path.join(__dirname, "utils", "users.json");
  console.log("Путь к файлу:", filePath);

  // Проверка на наличие файла
  if (!fs.existsSync(filePath)) {
    console.log("Файл не найден, создаём новый");
    fs.writeFileSync(filePath, JSON.stringify({}), {flag: "wx"});
  } else {
    console.log("Файл найден, загружаем данные");
  }

  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (err) {
    console.error("Ошибка при чтении файла", err.message);
    return {};
  }
};

// Ф-ция для сохранения пользователей в файл
export const saveUsers = (users) => {
  fs.writeFileSync(
    path.join(__dirname, "utils", "users.json"),
    JSON.stringify(users, null, 2)
  );
};
