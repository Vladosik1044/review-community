import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API = 'http://localhost:8000/api';

const testEmail = `test_${Date.now()}@test.local`;
const testUsername = `testuser_${Date.now()}`;
let token = '';
let workId = 0;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

describe('API tests', () => {
  test('1. Список произведений — 200 и массив', async () => {
    const res = await request(API).get('/works');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.works)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
    workId = res.body.works[0].id;
  });

  test('2. Регистрация — 201 и токен', async () => {
    const res = await request(API)
      .post('/auth/register')
      .send({
        email: testEmail,
        username: testUsername,
        password: 'password123',
        securityQuestion: 'First pet name?',
        securityAnswer: 'barsik',
      });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('3. Дубликат email — 409', async () => {
    const res = await request(API)
      .post('/auth/register')
      .send({
        email: testEmail,
        username: testUsername + 'x',
        password: 'password123',
        securityQuestion: 'First pet name?',
        securityAnswer: 'barsik',
      });
    expect(res.status).toBe(409);
  });

  test('4. Оценка без токена — 401', async () => {
    const res = await request(API)
      .post(`/works/${workId}/ratings`)
      .send({ value: 9 });
    expect(res.status).toBe(401);
  });

  test('5. Оценка с токеном — 200', async () => {
    const res = await request(API)
      .post(`/works/${workId}/ratings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 10 });
    expect(res.status).toBe(200);
    expect(res.body.userRating).toBe(10);
  });

  test('6. Создание рецензии — 201', async () => {
    const res = await request(API)
      .post(`/works/${workId}/reviews`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'This is a test review with enough characters.', hasSpoiler: false });
    expect(res.status).toBe(201);
  });

  test('7. Создание списка — 201', async () => {
    const res = await request(API)
      .post('/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test list', isPublic: true });
    expect(res.status).toBe(201);
  });

  test('8. Валидация — короткий пароль', async () => {
    const res = await request(API)
      .post('/auth/register')
      .send({
        email: `short_${Date.now()}@test.local`,
        username: `short_${Date.now()}`,
        password: '123',
        securityQuestion: 'First pet name?',
        securityAnswer: 'barsik',
      });
    expect(res.status).toBe(400);
  });
});