export class Field {
  constructor(
    public id: string,
    public name: string,
    public description: string | undefined,
    public tenantId: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
