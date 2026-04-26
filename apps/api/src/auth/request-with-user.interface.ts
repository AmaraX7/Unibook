import { Request } from 'express';
import { PersonRole } from '../persons/entities/person.entity';  // ← cambiado

export interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    role: PersonRole;
    companyId: number | null;
  };
}