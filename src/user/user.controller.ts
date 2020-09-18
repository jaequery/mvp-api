import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  User,
  UserUpdateDto,
  UserLoginDto,
  UserCreateDto,
} from './user.entity';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, ACGuard)
  @UseRoles({
    resource: 'users',
    action: 'read',
    possession: 'own',
  })
  @ApiOperation({
    summary: 'Get users',
    description: 'Retrieve a list of users',
  })
  async findAll(@Body() data) {
    return this.userService.findAll(data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieves current logged-in user',
  })
  currentUser(@Req() request) {
    const user = request.user;
    if (!user) throw new UnauthorizedException();
    return user;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ACGuard)
  @UseRoles({
    resource: 'users',
    action: 'read',
    possession: 'own',
  })
  @ApiOperation({
    summary: 'Get user',
    description: 'Retrieves a user record by id',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a user record',
  })
  async create(@Body() dto: UserCreateDto): Promise<User> {
    return await this.userService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user', description: 'Update a user record' })
  async update(
    @Param('id') id: number,
    @Body() dto: UserUpdateDto,
  ): Promise<User> {
    return await this.userService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user record' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.remove(id);
  }
}
