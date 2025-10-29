import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('User')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with a unique username and returns an authentication token',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Username already exists',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.userService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login existing user',
    description:
      'Authenticates an existing user and returns their authentication token',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async login(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.userService.login(registerDto);
  }
}
