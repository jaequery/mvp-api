import * as bcrypt from 'bcrypt';
import {
  User,
  UserChoosePasswordDto,
  UserLoginOauthDto,
  UserSource,
} from './../user/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  UserLoginLocalDto,
  UserForgotPasswordDto,
  UserTokenDto,
} from '../user/user.entity';
import { UserService } from '../user/user.service';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(userLoginDto: UserLoginLocalDto): Promise<UserTokenDto> {
    const user = await this.userService.findOne({
      where: { email: userLoginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const isValid = await bcrypt.compare(userLoginDto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.generateJwt(user);
    const loggedInUser = await this.userService.loggedIn(user);
    return {
      user: loggedInUser,
      accessToken,
      expiresIn: process.env.JWT_EXPIRATION,
    };
  }

  async validateOauth(req): Promise<UserTokenDto> {
    if (!req.user) {
      throw new InternalServerErrorException('error during google sso');
    }

    let user = await this.userService.findOne({
      where: { email: req.user.email },
    });

    if (!user) {
      const dto = new UserLoginOauthDto();
      dto.source = UserSource.google;
      dto.email = req.user.email;
      dto.firstName = req.user.firstName;
      dto.lastName = req.user.lastName;
      dto.picture = req.user.picture;
      user = await this.userService.create(dto);
    }

    const accessToken = await this.generateJwt(user);
    user = await this.userService.loggedIn(user);
    return {
      user,
      accessToken,
      expiresIn: process.env.JWT_EXPIRATION,
    };
  }

  async forgotPassword(
    userForgotPasswordDto: UserForgotPasswordDto,
  ): Promise<void> {
    const user = await this.userService.findByEmail(
      userForgotPasswordDto.email,
    );
    if (!user) throw new NotFoundException();
    if (user) {
      const accessToken = await this.generateJwt(user);
      const res = await this.sendResetPasswordEmail(user, accessToken);
      Logger.log(`forgot password: ${JSON.stringify(res)}`);
    }
  }

  async choosePassword(
    userChoosePasswordDto: UserChoosePasswordDto,
  ): Promise<User> {
    Logger.log('choosing password');
    const user = await this.userService.findOne({
      where: { accessToken: userChoosePasswordDto.accessToken },
    });
    if (!user) throw new NotFoundException();
    return await this.userService.update(user.id, {
      password: userChoosePasswordDto.password,
    });
  }

  async sendResetPasswordEmail(user: User, accessToken: string): Promise<any> {
    return this.mailerService.sendMail({
      to: user.email,
      subject: 'Forgot Password',
      text: `Forgot your password? Click here to reset it: ${process.env.WEB_EMAIL_RESET_PASWORD_URL}?accessToken=${accessToken}`,
      html: `Click here to reset your password: <a href="${process.env.WEB_EMAIL_RESET_PASWORD_URL}?accessToken=${accessToken}">Reset Password</b>`,
    });
  }

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.sign({ sub: user.id });
  }
}
