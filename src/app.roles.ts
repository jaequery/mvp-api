import { RolesBuilder } from 'nest-access-control';
export enum AppRoles {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
export const roles: RolesBuilder = new RolesBuilder();
roles
  .grant(AppRoles.USER)
  .createOwn('users')
  .readOwn('users')
  .updateOwn('users')
  .deleteOwn('users')
  .grant(AppRoles.ADMIN)
  .extend(AppRoles.USER)
  .readAny('users')
  .updateAny('users')
  .deleteAny('users');
