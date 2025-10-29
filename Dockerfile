# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code (tsconfig, nest-cli.json, src)
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Set a dummy DATABASE_URL for build time (Prisma needs it to generate client)
# The real DATABASE_URL will be provided at runtime by Railway
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Verify dist folder was created
RUN ls -la dist/

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run migrations and start application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
