# Insignia Crypto - Cryptocurrency Wallet API

A simple backend API for managing cryptocurrency wallet operations, built with NestJS, Prisma, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Registration**: Create accounts with unique usernames
- **Authentication**: Token-based authentication system
- **Balance Management**: Top-up user balances
- **Transfers**: Send funds to other users with atomic transactions
- **Transaction Analytics**: 
  - Get top 10 user transactions
  - Get top 10 transacting users
- **Input Validation**: Comprehensive validation for all requests
- **Error Handling**: Global exception handling with detailed error responses
- **API Documentation**: Interactive Swagger/OpenAPI documentation

## 🛠 Tech Stack

- **Framework**: NestJS v11+
- **Language**: TypeScript
- **Database**: PostgreSQL v14.18+
- **ORM**: Prisma
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Code Quality**: ESLint, Prettier

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **PostgreSQL**: v14+ ([Download](https://www.postgresql.org/download/))
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/nerufuyo/insignia-crypto.git
cd insignia-crypto
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

Edit `.env` with your database credentials (see [Environment Variables](#environment-variables))

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/insignia_crypto?schema=public"

# Application
PORT=3000
NODE_ENV=development
```

**Important**: Replace `username` and `password` with your PostgreSQL credentials.

## 🗄 Database Setup

1. **Create PostgreSQL database**

```bash
createdb insignia_crypto
```

Or using psql:

```sql
CREATE DATABASE insignia_crypto;
```

2. **Run Prisma migrations**

```bash
npx prisma migrate dev
```

This will:
- Create the database schema
- Generate Prisma Client
- Apply all migrations

3. **Verify database connection** (optional)

```bash
npx prisma studio
```

Opens Prisma Studio at `http://localhost:5555` for database visualization.

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Watch Mode

```bash
npm run start
```

## 📚 API Documentation

Once the application is running, access the interactive Swagger documentation:

**Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)

The Swagger interface provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive API testing
- Authentication examples

## 🔌 API Endpoints

### User Management

#### Register User
```http
POST /register
Content-Type: application/json

{
  "username": "john_doe"
}
```

**Response**:
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

---

### Balance Operations

All balance and transfer endpoints require authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

#### Top Up Balance
```http
POST /balance/topup
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500000
}
```

**Response**:
```json
{
  "message": "Top up successful. New balance: 500000"
}
```

**Constraints**:
- Amount must be positive
- Maximum top-up: 10,000,000

#### Get Balance
```http
GET /balance
Authorization: Bearer <token>
```

**Response**:
```json
{
  "balance": 500000
}
```

---

### Transfer Operations

#### Transfer to User
```http
POST /transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "to_username": "jane_doe",
  "amount": 100000
}
```

**Response**: `204 No Content`

**Validations**:
- Amount must be positive
- Sender must have sufficient balance
- Recipient must exist
- Cannot transfer to self

---

### Transaction Analytics

#### Get User's Top 10 Transactions
```http
GET /transactions/user/top
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "username": "alice_smith",
    "amount": -150000
  },
  {
    "username": "bob_jones",
    "amount": 200000
  }
]
```

**Note**: Negative amounts represent debits (outgoing transfers)

#### Get Top 10 Transacting Users
```http
GET /transactions/top-users
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "username": "alice_smith",
    "transacted_value": 2500000
  },
  {
    "username": "bob_jones",
    "transacted_value": 1800000
  }
]
```

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

Coverage reports will be generated in the `coverage/` directory.

## 📁 Project Structure

```
insignia-crypto/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── common/
│   │   ├── decorators/        # Custom decorators (CurrentUser)
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards
│   │   └── utils/             # Utility functions
│   ├── modules/
│   │   ├── user/              # User registration & auth
│   │   ├── balance/           # Balance management
│   │   ├── transfer/          # Transfer operations
│   │   └── transaction/       # Transaction analytics
│   ├── prisma/                # Prisma service
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── test/                      # E2E tests
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## 🏗 Architecture

This project follows **Clean Architecture** principles:

### Layers

1. **Domain Layer**: Core business entities (Prisma models)
2. **Application Layer**: Use cases (Services)
3. **Infrastructure Layer**: Framework, database, external services

### Key Patterns

- **Dependency Injection**: NestJS built-in DI container
- **Repository Pattern**: Prisma as data access layer
- **DTO Pattern**: Request/response validation
- **Guard Pattern**: Authentication & authorization
- **Filter Pattern**: Global exception handling

### Database Optimizations

- Indexed fields: `username`, `token`, `fromUsername`, `toUsername`, `type`, `amount`, `createdAt`
- Atomic transactions for transfers
- Efficient aggregation queries for analytics

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>
```

Or change the port in `.env`:

```env
PORT=3001
```

### Database Connection Error

1. Verify PostgreSQL is running:

```bash
pg_isready
```

2. Check database credentials in `.env`
3. Ensure database exists:

```bash
psql -U postgres -l
```

### Prisma Client Not Generated

Run:

```bash
npx prisma generate
```

### Migration Issues

Reset database (⚠️ **WARNING**: Deletes all data):

```bash
npx prisma migrate reset
```

### ESLint Errors

Auto-fix linting issues:

```bash
npm run lint
```

### Build Errors

Clean build artifacts and rebuild:

```bash
rm -rf dist/
npm run build
```

## 📄 License

This project is [MIT licensed](LICENSE).

## 👥 Author

**Nerufuyo**
- GitHub: [@nerufuyo](https://github.com/nerufuyo)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Commit Convention

This project follows conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

---

**Built with ❤️ using NestJS**
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
