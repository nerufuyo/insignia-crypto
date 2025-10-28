# Project Plan: Insignia Crypto Wallet Backend API

## Project Overview
Build a backend REST API for a simple cryptocurrency wallet application using Node.js, NestJS, PostgreSQL, and Prisma ORM. The system will manage user accounts, wallet balances, and transactions.

---

## Technical Requirements

### Technology Stack
- **Runtime**: Node.js
- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Version Control**: Git (with frequent commits to remote repository)
- **API Documentation**: REST APIs exposed via Stoplight or similar

### Development Requirements
- Detailed README with setup and running instructions
- Source code pushed to Git remote repository
- Clean architecture and clean code practices
- Proper use of asynchronous operations
- Unit tests for important files/modules

---

## Functional Requirements

### 1. User Registration
**Endpoint**: `POST /register`
- Register new users with unique username
- Return authentication token upon successful registration
- **Request Body**:
  - `username` (string, required, unique)
- **Response**: 
  - Status: 201
  - Body: `{ token: string }`

### 2. Balance Top-up
**Endpoint**: `POST /balance/topup`
- Add funds to user's wallet balance
- Requires authentication via token
- Only positive amounts allowed
- Maximum single topup: 10,000,000
- **Headers**:
  - `Authorization` (string, required): User token
- **Request Body**:
  - `amount` (number, required)
- **Response**:
  - Status: 201
  - Body: Success message

### 3. Read Balance
**Endpoint**: `GET /balance`
- Fetch current wallet balance for authenticated user
- Requires authentication via token
- **Headers**:
  - `Authorization` (string, required): User token
- **Response**:
  - Status: 200
  - Body: `{ balance: number }`

### 4. Transfer Between Wallets
**Endpoint**: `POST /transfer`
- Transfer balance from one user to another
- Requires authentication via token
- Balance must be non-negative (>= 0)
- Deduct from sender, add to recipient
- **Headers**:
  - `Authorization` (string, required): User token
- **Request Body**:
  - `to_username` (string, required)
  - `amount` (number, required)
- **Response**:
  - Status: 204
  - Body: Success message

### 5. Top Transactions by User
**Endpoint**: `GET /transactions/user/top`
- Return top 10 transactions by value for the authenticated user
- Include both credits (incoming) and debits (outgoing)
- Sort by absolute value in descending order
- Debits should be returned as negative values
- Return empty array if user has no transactions
- **Headers**:
  - `Authorization` (string, required): User token
- **Response**:
  - Status: 200
  - Body: `array of { username: string, amount: number }`

### 6. Top Transacting Users by Value
**Endpoint**: `GET /transactions/top-users`
- Return top 10 users by total outbound transfer value (debits only)
- Aggregate total value of all debit transactions per user
- Sort by total transacted value in descending order
- **Headers**:
  - `Authorization` (string, required): User token
- **Response**:
  - Status: 200
  - Body: `array of { username: string, transacted_value: number }`

---

## Data Model Requirements

### User Entity
- Unique username (primary identifier)
- Authentication token
- Wallet balance (number, default: 0)
- Timestamps (created_at, updated_at)

### Transaction Entity
- Transaction ID (auto-generated)
- From user (username)
- To user (username)
- Amount (number)
- Transaction type (topup/transfer)
- Timestamp
- Proper indexing for query performance

---

## Non-Functional Requirements

### Code Quality
1. **Code Readability**: Clean, well-structured, and maintainable code
2. **Correctness**: All APIs must function according to specifications
3. **Unit Testing**: Write unit tests for critical business logic and services
4. **Asynchronous Operations**: Proper use of async/await and promises

### Performance
- Efficient database queries with proper indexing
- Optimized transaction aggregation for top users queries

### Security
- Token-based authentication for protected endpoints
- Input validation and sanitization
- Prevent SQL injection through ORM usage
- Balance validation (no negative balances except during valid operations)

### Documentation
- Comprehensive README with:
  - Project setup instructions
  - How to run the application
  - How to run tests
  - API endpoint documentation
  - Database schema explanation
- API documentation via Stoplight or Swagger

---

## Evaluation Criteria

### Primary (Required)
1. ✅ Code readability and solution design
2. ✅ Correctness of implementation
3. ✅ Unit test coverage for important modules
4. ✅ Proper asynchronous programming

### Bonus Points
1. ✅ Complete all test cases
2. ✅ Deployable live URL
3. ✅ Clean architecture implementation (BIG plus)

---

## Project Timeline

**Maximum Duration**: 7 days  
**Repository**: https://github.com/nerufuyo/insignia-crypto.git

### Day 1: Project Setup & Architecture (8 hours)

#### Morning Session (4 hours)
- [ ] **Environment Setup** (1 hour)
  - [ ] Install Node.js (v18 or higher)
  - [ ] Install PostgreSQL (v14 or higher)
  - [ ] Configure Git and connect to remote repository
  - [ ] Set up IDE (VS Code) with recommended extensions
  - [ ] Install global dependencies (NestJS CLI)

- [ ] **Project Initialization** (1.5 hours)
  - [ ] Initialize NestJS project with CLI
  - [ ] Set up project folder structure (modules, services, controllers)
  - [ ] Configure ESLint and Prettier
  - [ ] Set up environment variables (.env file)
  - [ ] Create .gitignore file
  - [ ] Initial commit and push to repository

- [ ] **Database Setup** (1.5 hours)
  - [ ] Create PostgreSQL database
  - [ ] Install and initialize Prisma
  - [ ] Design database schema (User and Transaction models)
  - [ ] Create Prisma schema file
  - [ ] Configure database connection

#### Afternoon Session (4 hours)
- [ ] **Architecture Planning** (2 hours)
  - [ ] Design clean architecture layers (Domain, Application, Infrastructure)
  - [ ] Plan module structure (Auth, User, Balance, Transaction)
  - [ ] Define DTOs (Data Transfer Objects) for all endpoints
  - [ ] Plan error handling strategy
  - [ ] Design authentication flow
  - [ ] Document architecture decisions

- [ ] **Core Infrastructure** (2 hours)
  - [ ] Run Prisma migrations
  - [ ] Set up Prisma service for database connection
  - [ ] Create common utilities (response formatters, error handlers)
  - [ ] Set up global exception filters
  - [ ] Configure validation pipes
  - [ ] Commit: "Setup project infrastructure and database"

---

### Day 2: Authentication & User Management (8 hours)

#### Morning Session (4 hours)
- [ ] **User Module Setup** (1.5 hours)
  - [ ] Create User module, controller, and service
  - [ ] Create User entity and repository pattern
  - [ ] Set up DTOs for user registration
  - [ ] Implement input validation decorators
  - [ ] Commit: "Create user module structure"

- [ ] **Registration Endpoint** (2.5 hours)
  - [ ] Implement user registration logic
  - [ ] Add username uniqueness validation
  - [ ] Generate authentication tokens (JWT or UUID)
  - [ ] Hash sensitive data if needed
  - [ ] Create error handling for duplicate users
  - [ ] Test registration with Postman/Thunder Client
  - [ ] Commit: "Implement user registration endpoint"

#### Afternoon Session (4 hours)
- [ ] **Authentication Middleware** (3 hours)
  - [ ] Create authentication guard/middleware
  - [ ] Implement token validation logic
  - [ ] Create custom decorators for user extraction
  - [ ] Add unauthorized error handling
  - [ ] Test authentication flow
  - [ ] Commit: "Implement authentication middleware"

- [ ] **Unit Tests - Auth** (1 hour)
  - [ ] Write tests for user registration service
  - [ ] Write tests for authentication guard
  - [ ] Test edge cases (duplicate username, invalid token)
  - [ ] Commit: "Add unit tests for authentication"

---

### Day 3: Balance Management (8 hours)

#### Morning Session (4 hours)
- [ ] **Balance Module Setup** (1 hour)
  - [ ] Create Balance module, controller, and service
  - [ ] Set up DTOs for balance operations
  - [ ] Define validation rules for amounts
  - [ ] Commit: "Create balance module structure"

- [ ] **Balance Top-up Endpoint** (3 hours)
  - [ ] Implement top-up service logic
  - [ ] Add validation (positive amount, max 10,000,000)
  - [ ] Update user balance in database
  - [ ] Create transaction record for top-up
  - [ ] Implement error handling (invalid amounts)
  - [ ] Add authentication guard to endpoint
  - [ ] Test with various scenarios
  - [ ] Commit: "Implement balance top-up endpoint"

#### Afternoon Session (4 hours)
- [ ] **Read Balance Endpoint** (1.5 hours)
  - [ ] Implement get balance service
  - [ ] Add authentication guard
  - [ ] Format response according to spec
  - [ ] Test balance retrieval
  - [ ] Commit: "Implement read balance endpoint"

- [ ] **Unit Tests - Balance** (2 hours)
  - [ ] Write tests for top-up service
  - [ ] Write tests for balance retrieval
  - [ ] Test validation rules (max amount, negative values)
  - [ ] Test authentication requirements
  - [ ] Commit: "Add unit tests for balance operations"

- [ ] **Code Review & Refactoring** (0.5 hours)
  - [ ] Review code quality
  - [ ] Refactor duplicated code
  - [ ] Update documentation
  - [ ] Commit: "Refactor balance module"

---

### Day 4: Transfer Functionality (8 hours)

#### Morning Session (4 hours)
- [ ] **Transfer Module Setup** (1 hour)
  - [ ] Create Transfer module, controller, and service
  - [ ] Set up DTOs for transfer operations
  - [ ] Define validation rules
  - [ ] Commit: "Create transfer module structure"

- [ ] **Transfer Logic Implementation** (3 hours)
  - [ ] Implement transfer service with database transaction
  - [ ] Validate sender has sufficient balance
  - [ ] Validate recipient exists
  - [ ] Deduct from sender, add to recipient (atomic operation)
  - [ ] Prevent negative balance
  - [ ] Create transaction records
  - [ ] Commit: "Implement transfer logic"

#### Afternoon Session (4 hours)
- [ ] **Transfer Endpoint Completion** (2 hours)
  - [ ] Add authentication guard
  - [ ] Implement comprehensive error handling
  - [ ] Test transfer scenarios (success, insufficient balance, user not found)
  - [ ] Test concurrent transfer handling
  - [ ] Optimize database queries
  - [ ] Commit: "Complete transfer endpoint with error handling"

- [ ] **Unit Tests - Transfer** (2 hours)
  - [ ] Write tests for successful transfers
  - [ ] Test insufficient balance scenarios
  - [ ] Test non-existent recipient
  - [ ] Test concurrent transactions
  - [ ] Test edge cases (self-transfer, zero amount)
  - [ ] Commit: "Add comprehensive unit tests for transfers"

---

### Day 5: Analytics & Reporting (8 hours)

#### Morning Session (4 hours)
- [ ] **Transaction Module Setup** (1 hour)
  - [ ] Create Transaction module, controller, and service
  - [ ] Set up DTOs for transaction queries
  - [ ] Plan database query optimization strategy
  - [ ] Commit: "Create transaction analytics module"

- [ ] **Top User Transactions Endpoint** (3 hours)
  - [ ] Implement query for user's transactions
  - [ ] Fetch both credits and debits
  - [ ] Sort by absolute value (descending)
  - [ ] Limit to top 10
  - [ ] Format debits as negative values
  - [ ] Handle case with no transactions (empty array)
  - [ ] Add proper database indexing
  - [ ] Test with sample data
  - [ ] Commit: "Implement top user transactions endpoint"

#### Afternoon Session (4 hours)
- [ ] **Top Transacting Users Endpoint** (3 hours)
  - [ ] Implement aggregation query for outbound transfers
  - [ ] Group by user and sum transaction values
  - [ ] Sort by total transacted value (descending)
  - [ ] Limit to top 10 users
  - [ ] Optimize query performance
  - [ ] Test with large datasets
  - [ ] Commit: "Implement top transacting users endpoint"

- [ ] **Unit Tests - Analytics** (1 hour)
  - [ ] Write tests for top user transactions
  - [ ] Write tests for top transacting users
  - [ ] Test empty result scenarios
  - [ ] Test sorting and limiting
  - [ ] Commit: "Add unit tests for analytics endpoints"

---

### Day 6: Testing & Documentation (8 hours)

#### Morning Session (4 hours)
- [ ] **Comprehensive Testing** (3 hours)
  - [ ] Review all existing unit tests
  - [ ] Add integration tests for critical flows
  - [ ] Test all endpoints with Postman/Thunder Client
  - [ ] Create test data seeds
  - [ ] Test error scenarios
  - [ ] Check test coverage (aim for >80%)
  - [ ] Fix any failing tests
  - [ ] Commit: "Enhance test coverage and fix bugs"

- [ ] **Code Quality Review** (1 hour)
  - [ ] Run ESLint and fix issues
  - [ ] Run Prettier for code formatting
  - [ ] Review code for clean code principles
  - [ ] Refactor complex functions
  - [ ] Remove console.logs and debug code
  - [ ] Commit: "Code quality improvements"

#### Afternoon Session (4 hours)
- [ ] **API Documentation** (2 hours)
  - [ ] Set up Swagger/OpenAPI documentation
  - [ ] Document all endpoints with examples
  - [ ] Add request/response schemas
  - [ ] Document authentication requirements
  - [ ] Add error response examples
  - [ ] Test documentation accuracy
  - [ ] Commit: "Add API documentation"

- [ ] **README Documentation** (2 hours)
  - [ ] Write comprehensive setup instructions
  - [ ] Document prerequisites
  - [ ] Add installation steps
  - [ ] Document environment variables
  - [ ] Add database migration instructions
  - [ ] Document how to run the application
  - [ ] Add testing instructions
  - [ ] Include API endpoint overview
  - [ ] Add troubleshooting section
  - [ ] Commit: "Complete README documentation"

---

### Day 7: Final Polish & Deployment (8 hours)

#### Morning Session (4 hours)
- [ ] **End-to-End Testing** (2 hours)
  - [ ] Create complete user flow test scenarios
  - [ ] Test registration → top-up → transfer → analytics flow
  - [ ] Verify all validation rules
  - [ ] Test concurrent user scenarios
  - [ ] Document any bugs found and fix them
  - [ ] Commit: "Fix bugs found in E2E testing"

- [ ] **Performance Optimization** (2 hours)
  - [ ] Review database queries for optimization
  - [ ] Add missing database indexes
  - [ ] Optimize transaction aggregation queries
  - [ ] Test with larger datasets
  - [ ] Profile application performance
  - [ ] Commit: "Performance optimizations"

#### Afternoon Session (4 hours)
- [ ] **Security Review** (1.5 hours)
  - [ ] Review authentication implementation
  - [ ] Check input validation on all endpoints
  - [ ] Verify no SQL injection vulnerabilities
  - [ ] Review error messages (no sensitive data leakage)
  - [ ] Test rate limiting (if implemented)
  - [ ] Commit: "Security enhancements"

- [ ] **Deployment Preparation** (1.5 hours)
  - [ ] Create production environment configuration
  - [ ] Set up deployment scripts
  - [ ] Create docker-compose file (optional)
  - [ ] Document deployment process
  - [ ] Prepare environment variables template
  - [ ] Commit: "Add deployment configuration"

- [ ] **Optional: Production Deployment** (1 hour)
  - [ ] Choose hosting platform (Railway, Render, Heroku, AWS)
  - [ ] Set up production database
  - [ ] Deploy application
  - [ ] Test deployed endpoints
  - [ ] Update README with live URL
  - [ ] Commit: "Deploy to production"

---

## Progress Tracking

### Completion Status
- [ ] Day 1: Project Setup & Architecture (0/13 tasks)
- [ ] Day 2: Authentication & User Management (0/9 tasks)
- [ ] Day 3: Balance Management (0/10 tasks)
- [ ] Day 4: Transfer Functionality (0/9 tasks)
- [ ] Day 5: Analytics & Reporting (0/7 tasks)
- [ ] Day 6: Testing & Documentation (0/8 tasks)
- [ ] Day 7: Final Polish & Deployment (0/7 tasks)

**Overall Progress**: 0/63 tasks completed (0%)

---

## Deliverables

1. **Source Code**
   - Complete NestJS application
   - Git repository with commit history
   - Pushed to remote Git repository

2. **Documentation**
   - README.md with setup instructions
   - API documentation
   - Database schema documentation

3. **Testing**
   - Unit tests for services and controllers
   - Test coverage report

4. **Optional**
   - Deployed application URL
   - Postman collection for API testing

---

## Daily Time Allocation

| Day | Focus Area | Estimated Hours | Priority |
|-----|-----------|----------------|----------|
| 1 | Setup & Architecture | 8 hours | Critical |
| 2 | Authentication & Users | 8 hours | Critical |
| 3 | Balance Management | 8 hours | Critical |
| 4 | Transfer System | 8 hours | Critical |
| 5 | Analytics & Reporting | 8 hours | High |
| 6 | Testing & Documentation | 8 hours | High |
| 7 | Polish & Deployment | 8 hours | Medium |

**Total Estimated Time**: 56 hours over 7 days

---

## Milestones & Checkpoints

### Milestone 1: Foundation Ready (End of Day 1)
**Success Criteria**:
- ✅ NestJS project running locally
- ✅ PostgreSQL database connected
- ✅ Prisma migrations working
- ✅ Code pushed to GitHub repository
- ✅ Basic project structure established

### Milestone 2: User System Complete (End of Day 2)
**Success Criteria**:
- ✅ Users can register successfully
- ✅ Authentication tokens generated
- ✅ Auth middleware protecting endpoints
- ✅ Unit tests passing for auth module
- ✅ Postman tests successful

### Milestone 3: Wallet Operations Ready (End of Day 3)
**Success Criteria**:
- ✅ Users can top-up balance
- ✅ Users can view their balance
- ✅ All validations working correctly
- ✅ Unit tests passing for balance module
- ✅ Transaction records created for top-ups

### Milestone 4: Transfer System Live (End of Day 4)
**Success Criteria**:
- ✅ Users can transfer funds successfully
- ✅ Balance validations working (no negative balances)
- ✅ Atomic database transactions implemented
- ✅ Unit tests passing for transfer module
- ✅ All critical features completed

### Milestone 5: Analytics Complete (End of Day 5)
**Success Criteria**:
- ✅ Top user transactions endpoint working
- ✅ Top transacting users endpoint working
- ✅ Query performance optimized
- ✅ Unit tests passing for analytics
- ✅ All functional requirements met

### Milestone 6: Production Ready (End of Day 6)
**Success Criteria**:
- ✅ Test coverage above 80%
- ✅ All endpoints documented
- ✅ README complete with setup instructions
- ✅ API documentation available
- ✅ Code quality standards met

### Milestone 7: Deployment Complete (End of Day 7)
**Success Criteria**:
- ✅ All bugs fixed
- ✅ Performance optimized
- ✅ Security review passed
- ✅ Application deployed (optional)
- ✅ Final documentation updated

---

## Git Commit Strategy
- Make frequent, meaningful commits
- Use descriptive commit messages
- Commit after each feature completion
- Maintain clean commit history for evaluation

---

## API Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/register` | POST | No | Register new user |
| `/balance/topup` | POST | Yes | Add funds to wallet |
| `/balance` | GET | Yes | Get current balance |
| `/transfer` | POST | Yes | Transfer to another user |
| `/transactions/user/top` | GET | Yes | Get user's top 10 transactions |
| `/transactions/top-users` | GET | Yes | Get top 10 users by transaction volume |

---

## Contact Information
**Company**: Insignia  
**Address**: Kedoya Center D1, Jl. Raya Perjuangan 1, Kebon Jeruk, Jakarta Barat 11530  
**Website**: www.insignia.co.id