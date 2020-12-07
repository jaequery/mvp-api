import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import {
  User,
  UserRegisterDto,
  UserTokenDto,
  UserUpdateDto,
} from './user.entity';
import { UserService } from './user.service';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  // @Roles('admin')
  @ApiOperation({
    summary: 'Get users',
    description: 'Retrieve a list of users',
  })
  async findAll(@Body() data) {
    return this.userService.findAll(data);
  }

  @Roles('admin', '$owner')
  @Get(':id([0-9]+|me)')
  public async findById(@Param('id') id: number | string, @Req() req) {
    id = id === 'me' ? req.user.id : id;
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a user record',
  })
  async create(@Body() dto: UserRegisterDto): Promise<User> {
    return await this.userService.create(dto);
  }

  @Patch(':id([0-9]+|me)')
  @Roles('admin', '$owner')
  @ApiOperation({ summary: 'Update user', description: 'Update a user record' })
  async update(
    @Param('id') id: number | string,
    @Body() dto: UserUpdateDto,
    @Req() req,
  ): Promise<User> {
    id = id === 'me' ? req.user.id : id;
    return this.userService.update(id as number, dto);
  }

  @Delete(':id([0-9]+|me)')
  @Roles('admin', '$owner')
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user record' })
  async remove(@Param('id') id: number | string, @Req() req) {
    id = id === 'me' ? req.user.id : id;
    return await this.userService.remove(id as number);
  }
}
