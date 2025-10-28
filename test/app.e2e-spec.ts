import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Crypto Wallet API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/ (GET) should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('API Endpoints Exist', () => {
    it('POST /register should exist', async () => {
      // Just check the endpoint exists, will return error without valid data
      const response = await request(app.getHttpServer())
        .post('/register')
        .send({});
      
      // Accept both 400 (validation), 409 (conflict), or 500 (Prisma validation)
      expect([400, 409, 500]).toContain(response.status);
    });

    it('GET /balance should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/balance')
        .expect(401);
    });

    it('POST /balance/topup should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/balance/topup')
        .send({ amount: 1000 })
        .expect(401);
    });

    it('POST /transfer should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/transfer')
        .send({ to_username: 'test', amount: 100 })
        .expect(401);
    });

    it('GET /transactions/user/top should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/transactions/user/top')
        .expect(401);
    });

    it('GET /transactions/top-users should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/transactions/top-users')
        .expect(401);
    });
  });
});
