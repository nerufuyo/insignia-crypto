import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { username } = registerDto;

    // Check if username already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Generate unique token
    const token = this.generateToken();

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        token,
        balance: 0,
      },
    });

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
