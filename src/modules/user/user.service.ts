import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { username, password } = registerDto;

    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Generate unique token
    const token = this.generateToken();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        token,
        balance: 0,
      },
    });

    return {
      token: user.token,
    };
  }

  async login(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { username, password } = registerDto;

    // Find existing user
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      token: user.token,
    };
  }

  async findByToken(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { token },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}
