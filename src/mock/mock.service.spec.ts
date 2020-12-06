import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../app.module';
import { UserRoles } from '../user/user.entity';
import { UserService } from '../user/user.service';

describe('Mock initial data', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userService = module.get<UserService>(UserService);
  });

  it('should create a user', async () => {
    const email = 'user@test.com';
    const user = await userService.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      const newUser = await userService.create({
        email,
        password: 'password',
      });
      console.log('new user', newUser);
      expect(newUser).toHaveProperty('id');
    }
  });

  it('should create an admin', async () => {
    const email = 'admin@test.com';
    const user = await userService.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      const newUser = await userService.create({
        email,
        password: 'password',
        roles: ['admin', 'user'] as UserRoles[],
      });
      console.log('new user', newUser);
      expect(newUser).toHaveProperty('id');
    }
  });
});
