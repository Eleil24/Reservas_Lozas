import { Role } from '../value-objects/role';

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: Role,
    public tenantId: string | undefined, // Puede ser null para Super Admins
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
