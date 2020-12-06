import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum UserRoles {
  admin = 'admin',
  user = 'user',
}

export enum UserProvider {
  facebook = 'facebook',
  google = 'google',
  email = 'email',
}

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: UserProvider.email })
  @IsNotEmpty()
  provider: UserProvider;

  @Column('jsonb', { default: [UserRoles.user] })
  roles: UserRoles;

  @Column()
  email: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  street1?: string;

  @Column({ nullable: true })
  street2?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zip?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  picture?: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date;

  @Column('timestamptz', { nullable: true })
  @IsOptional()
  lastLoginAt?: Date;
}

export class UserRegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  provider?: UserProvider;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  street1?: string;

  @IsOptional()
  street2?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  zip?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  picture?: string;
}

export class UserUpdateDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;

  firstName?: string;
  lastName?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  picture?: string;
  lastLoginAt?: Date;
}

export class UserLoginLocalDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
export class UserForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UserResetPasswordDto {
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class UserTokenDto {
  user: User;
  accessToken: string;
  expiresIn: string;
  oauth?: { accessToken: string; provider: string };
}
export class UserOauthProfile {
  provider: UserProvider;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}
