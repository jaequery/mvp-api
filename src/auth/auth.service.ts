import * as bcrypt from 'bcrypt';
import {
  User,
  UserResetPasswordDto,
  UserOauthProfile,
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
  UserRegisterDto,
  UserForgotPasswordDto,
  UserTokenDto,
} from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(dto: UserLoginLocalDto): Promise<UserTokenDto> {
    // set all emails to lowercase
    dto.email = dto.email.toLowerCase();

    const user = await this.userService.findOne({
      where: { email: dto.email },
    });
    const userPw = await this.userService.findOne({
      where: { email: dto.email },
      select: ['password'],
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isValid = await bcrypt.compare(dto.password, userPw.password);

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

  async validateOauth(oauthUser): Promise<UserTokenDto> {
    if (!oauthUser) {
      throw new InternalServerErrorException(
        `error during ${oauthUser.provider} sso`,
      );
    }

    // set email to lowercase
    oauthUser.email = oauthUser.email.toLowerCase();

    let user = await this.userService.findOne({
      where: { email: oauthUser.email },
    });

    if (!user) {
      const dto = new UserRegisterDto();
      dto.provider = oauthUser.provider;
      dto.email = oauthUser.email;
      dto.firstName = oauthUser.firstName;
      dto.lastName = oauthUser.lastName;
      dto.picture = oauthUser.picture;
      user = await this.userService.create(dto);
    }

    const accessToken = await this.generateJwt(user);
    user = await this.userService.loggedIn(user);
    return {
      user,
      accessToken,
      expiresIn: process.env.JWT_EXPIRATION,
      oauth: {
        accessToken: oauthUser.accessToken,
        provider: oauthUser.provider,
      },
    };
  }

  async forgotPassword(
    userForgotPasswordDto: UserForgotPasswordDto,
  ): Promise<void> {
    // set email to lowercase
    userForgotPasswordDto.email = userForgotPasswordDto.email.toLowerCase();

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

  async resetPassword(
    user,
    userResetPasswordDto: UserResetPasswordDto,
  ): Promise<User> {
    Logger.log('choosing password');
    if (!user) throw new NotFoundException();
    return await this.userService.update(user.id, {
      password: userResetPasswordDto.password,
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
