import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  UserResetPasswordDto,
  UserForgotPasswordDto,
  UserLoginLocalDto,
  UserTokenDto,
} from '../user/user.entity';
import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({
    summary: 'Authenticate login',
    description: 'Authenticate user by email and password',
  })
  async login(
    @Body() userLoginDto: UserLoginLocalDto,
    @Req() req,
  ): Promise<UserTokenDto> {
    console.log('req', req.user);
    return req.user;
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password request',
    description:
      'Initiate reset password and sends out a reset password email to the user',
  })
  async forgotPassword(@Body() userForgotPassword: UserForgotPasswordDto) {
    return this.authService.forgotPassword(userForgotPassword);
  }

  @Roles('$authenticated')
  @Post('reset-password')
  @ApiOperation({
    summary: 'Choose a user password',
    description: 'Sets user password with a new one',
  })
  async resetPassword(
    @Body() userResetPassword: UserResetPasswordDto,
    @Req() req,
  ) {
    return this.authService.resetPassword(req.user, userResetPassword);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req): Promise<void> {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const userToken = await this.authService.validateOauth(req.user);
    try {
      res.redirect(
        `${process.env.WEB_SSO_SUCCESS_URL}?accessToken=${userToken.accessToken}&oauthToken=${req.user.accessToken}`,
      );
    } catch (err) {
      res.redirect(`${process.env.WEB_SSO_FAIL_URL}`);
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req): Promise<void> {
    return;
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req, @Res() res) {
    const userToken = await this.authService.validateOauth(req.user);
    try {
      res.redirect(
        `${process.env.WEB_SSO_SUCCESS_URL}?accessToken=${userToken.accessToken}&oauthToken=${req.user.accessToken}`,
      );
    } catch (err) {
      res.redirect(`${process.env.WEB_SSO_FAIL_URL}`);
    }
  }
}
