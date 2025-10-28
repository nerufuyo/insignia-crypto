# Architecture Documentation

## Overview
This project follows **Clean Architecture** principles with a clear separation of concerns, SOLID principles, and the KISS (Keep It Simple, Stupid) and DRY (Don't Repeat Yourself) principles.

## Architecture Layers

### 1. **Domain Layer** (Core Business Logic)
- **Entities**: User, Transaction
- **Business Rules**: Balance validation, transaction logic
- **Interfaces**: Repository interfaces, service interfaces

### 2. **Application Layer** (Use Cases)
- **Services**: UserService, BalanceService, TransferService, TransactionService
- **DTOs**: Data Transfer Objects for input/output
- **Validators**: Input validation using class-validator

### 3. **Infrastructure Layer** (External Dependencies)
- **Database**: PostgreSQL with Prisma ORM
- **Controllers**: HTTP endpoint handlers
- **Guards**: Authentication guards
- **Filters**: Exception filters
- **Pipes**: Validation pipes

## Module Structure

```
src/
├── common/                    # Shared utilities and base classes
│   ├── decorators/           # Custom decorators (@CurrentUser)
│   ├── filters/              # Exception filters
│   ├── guards/               # Authentication guards
│   ├── interceptors/         # Response interceptors
│   └── pipes/                # Validation pipes
├── config/                    # Configuration modules
│   └── database.config.ts    # Database configuration
├── modules/
│   ├── user/                 # User management module
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── balance/              # Balance management module
│   │   ├── dto/
│   │   ├── balance.controller.ts
│   │   ├── balance.service.ts
│   │   └── balance.module.ts
│   ├── transfer/             # Transfer module
│   │   ├── dto/
│   │   ├── transfer.controller.ts
│   │   ├── transfer.service.ts
│   │   └── transfer.module.ts
│   └── transaction/          # Transaction analytics module
│       ├── dto/
│       ├── transaction.controller.ts
│       ├── transaction.service.ts
│       └── transaction.module.ts
├── prisma/                    # Prisma service
│   └── prisma.service.ts
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

## Data Flow

### Request Flow
1. **Client** → HTTP Request
2. **Controller** → Receives request, validates input
3. **Guard** → Validates authentication token
4. **Pipe** → Validates and transforms DTO
5. **Service** → Business logic execution
6. **Prisma Service** → Database operations
7. **Response** → Formatted response to client

### Authentication Flow
1. User registers → Generate unique token → Store in database
2. User makes authenticated request → Include token in Authorization header
3. AuthGuard validates token → Extract user from database
4. Inject user into controller using @CurrentUser decorator

## Error Handling Strategy

### HTTP Exception Filters
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Resource not found (user, transaction)
- **409 Conflict**: Duplicate username
- **500 Internal Server Error**: Unexpected errors

### Global Exception Filter
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error
    // Format response
    // Return appropriate HTTP status
  }
}
```

## DTO Definitions

### User Module
```typescript
// RegisterDto
{
  username: string; // required, unique
}

// RegisterResponseDto
{
  token: string;
}
```

### Balance Module
```typescript
// TopupDto
{
  amount: number; // required, positive, max 10,000,000
}

// BalanceResponseDto
{
  balance: number;
}
```

### Transfer Module
```typescript
// TransferDto
{
  to_username: string; // required
  amount: number;      // required, positive
}
```

### Transaction Module
```typescript
// UserTransactionDto
{
  username: string;
  amount: number; // negative for debits
}

// TopUserDto
{
  username: string;
  transacted_value: number;
}
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each service has one responsibility
- Controllers only handle HTTP requests
- Services only handle business logic

### Open/Closed Principle (OCP)
- Services are open for extension through interfaces
- Closed for modification through dependency injection

### Liskov Substitution Principle (LSP)
- All services implement common interfaces
- Repositories are interchangeable

### Interface Segregation Principle (ISP)
- DTOs are specific to each use case
- No unnecessary properties

### Dependency Inversion Principle (DIP)
- Controllers depend on service interfaces
- Services depend on repository interfaces
- High-level modules don't depend on low-level modules

## Database Schema

### User Table
- `id`: UUID (primary key)
- `username`: String (unique, indexed)
- `token`: String (unique, indexed)
- `balance`: Float (default: 0)
- `created_at`: DateTime
- `updated_at`: DateTime

### Transaction Table
- `id`: UUID (primary key)
- `from_username`: String (foreign key, indexed)
- `to_username`: String (foreign key, indexed)
- `amount`: Float (indexed)
- `type`: String ('topup' or 'transfer', indexed)
- `created_at`: DateTime (indexed)

## Performance Optimizations

### Database Indexes
- Username (unique index)
- Token (unique index)
- Transaction sender (index)
- Transaction receiver (index)
- Transaction type (index)
- Transaction amount (index)
- Transaction created_at (index)

### Query Optimizations
- Use Prisma's query optimization
- Limit results to top 10
- Use aggregation for analytics
- Implement proper sorting

## Security Measures

### Authentication
- Token-based authentication
- Unique tokens per user
- Token validation on every protected endpoint

### Input Validation
- All DTOs validated using class-validator
- Type checking with TypeScript
- Sanitization through Prisma ORM

### SQL Injection Prevention
- Use Prisma ORM (parameterized queries)
- No raw SQL queries

### Balance Protection
- Atomic transactions for transfers
- Balance validation before operations
- Prevent negative balances

## Testing Strategy

### Unit Tests
- Service layer tests
- Controller tests
- Guard tests
- Utility function tests

### Integration Tests
- End-to-end API tests
- Database integration tests
- Authentication flow tests

### Test Coverage Goals
- Minimum 80% code coverage
- All critical business logic tested
- Edge cases covered
