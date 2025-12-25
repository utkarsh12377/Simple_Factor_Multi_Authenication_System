const request = require('supertest');
const express = require('express');
const bodyParser = require('express').json;
const authRoutes = require('../../routes/auth');

const app = express();
app.use(bodyParser());
app.use('/api/auth', authRoutes);

// Before running, ensure .env points to a test DB or run against local db with cleanup

describe('auth routes', () => {
  let testEmail = `test${Date.now()}@example.com`;
  test('create user and login', async () => {
    // create user
    const createRes = await request(app)
      .post('/api/auth/create-user')
      .send({ email: testEmail, password: 'Test@12345' });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.user_id).toBeDefined();

    // login with correct password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'Test@12345' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.needOtp).toBe(true);

    // login with wrong password
    const wrongRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrong' });
    expect(wrongRes.statusCode).toBe(401);
  });
});