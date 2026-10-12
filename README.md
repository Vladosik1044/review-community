# Review Community

Учебный проект по дисциплине «Веб-дизайн и разработка».

Сайт-сообщество рецензий на книги, фильмы и игры. Тема №48 из методички.

## Возможности

- Каталог произведений: поиск, фильтры, сортировка, пагинация
- Регистрация и вход (JWT)
- Восстановление пароля через вопрос безопасности
- Оценки от 1 до 10 (одна оценка на произведение от пользователя)
- Рецензии с отметкой спойлера и модерацией
- Списки «хочу/смотрю/прочитано»
- Комментарии к рецензиям
- Жалобы на рецензии
- Дашборд со статистикой
- Загрузка обложек

## Стек

**Frontend:** React, TypeScript, Vite, React Router, Axios

**Backend:** Node.js, Express, TypeScript, Prisma, JWT, bcrypt, multer

**База данных:** PostgreSQL

## Запуск проекта

### 1. Клонирование

```
git clone https://github.com/Vladosik1044/review-community.git
cd review-community
```

### 2. Backend

```
cd backend
npm install
```

Создать файл `.env` на основе `.env.example` и указать данные подключения к PostgreSQL:

```
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/reviews_db?schema=public"
PORT=8000
NODE_ENV=development
JWT_SECRET=change_me_to_long_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Применить миграции и заполнить базу тестовыми данными:

```
npx prisma migrate deploy
npx prisma db seed
```

Запустить сервер:

```
npm run dev
```

Сервер работает по адресу `http://localhost:8000`.

### 3. Frontend

```
cd ../frontend
npm install
npm run dev
```

Сайт открывается по адресу `http://localhost:5173`.

## Тестовые аккаунты

После запуска seed создаются три пользователя:

| Email | Пароль | Роль |
|---|---|---|
| admin@reviews.local | password123 | администратор |
| moder@reviews.local | password123 | модератор |
| user@reviews.local | password123 | пользователь |

## Роли

**USER** — чтение, оценки, рецензии, списки, комментарии, жалобы.

**MODERATOR** — всё перечисленное, а также модерация рецензий и жалоб, доступ к дашборду.

**ADMIN** — полный доступ, включая загрузку обложек.

## API

Базовый адрес: `http://localhost:8000/api`

Для защищённых маршрутов требуется заголовок:

```
Authorization: Bearer <токен>
```

### Авторизация

| Метод | Маршрут | Доступ | Назначение |
|---|---|---|---|
| GET | /auth/questions | все | Список вопросов безопасности |
| POST | /auth/register | все | Регистрация |
| POST | /auth/login | все | Вход |
| POST | /auth/forgot-password | все | Получить вопрос по email |
| POST | /auth/reset-password | все | Сбросить пароль по ответу |
| PATCH | /auth/password | авторизован | Сменить пароль |

### Произведения

| Метод | Маршрут | Доступ | Назначение |
|---|---|---|---|
| GET | /works | все | Список с пагинацией, поиском, фильтрами, сортировкой |
| GET | /works/:id | все | Карточка произведения |
| GET | /works/:id/reviews | все | Рецензии произведения |
| POST | /works/:id/reviews | авторизован | Создать рецензию |
| POST | /works/:id/ratings | авторизован | Поставить или изменить оценку |
| DELETE | /works/:id/ratings | авторизован | Удалить свою оценку |

Параметры запроса `/works`:

- `page`, `limit` — пагинация
- `search` — поиск по названию, оригинальному названию, автору
- `type` — BOOK, MOVIE, GAME
- `genre` — slug жанра
- `yearFrom`, `yearTo` — диапазон лет выпуска
- `sort` — year, title, rating

### Рецензии

| Метод | Маршрут | Доступ | Назначение |
|---|---|---|---|
| GET | /reviews/:id | все | Одна рецензия |
| PATCH | /reviews/:id | автор | Редактирование своей рецензии |
| DELETE | /reviews/:id | автор, админ | Удаление |
| PATCH | /reviews/:id/status | модератор, админ | Смена статуса |
| GET | /reviews/:id/comments | все | Комментарии |
| POST | /reviews/:id/comments | авторизован | Добавить комментарий |
| POST | /reviews/:id/reports | авторизован | Подать жалобу |

### Списки

| Метод | Маршрут | Доступ | Назначение |
|---|---|---|---|
| GET | /lists/public | все | Публичные списки |
| GET | /lists/my | авторизован | Свои списки |
| POST | /lists | авторизован | Создать список |
| GET | /lists/:id | все, владелец | Один список |
| PATCH | /lists/:id | владелец | Переименовать или изменить приватность |
| DELETE | /lists/:id | владелец | Удалить список |
| POST | /lists/:id/items | владелец | Добавить произведение |
| PATCH | /lists/:id/items/:itemId | владелец | Изменить статус |
| DELETE | /lists/:id/items/:itemId | владелец | Убрать из списка |

### Служебные маршруты

| Метод | Маршрут | Доступ | Назначение |
|---|---|---|---|
| DELETE | /comments/:id | автор, модератор, админ | Удалить комментарий |
| GET | /reports | модератор, админ | Список жалоб |
| PATCH | /reports/:id | модератор, админ | Смена статуса жалобы |
| GET | /dashboard | модератор, админ | Статистика |
| POST | /uploads/cover | админ | Загрузка обложки |

## Состояние проекта

Реализовано:

- База данных: 11 таблиц, миграции, seed
- Backend: все API-маршруты
- Авторизация с ролями
- Восстановление пароля
- Загрузка обложек

В разработке:

- Frontend

## Автор

Владислава, 2026.