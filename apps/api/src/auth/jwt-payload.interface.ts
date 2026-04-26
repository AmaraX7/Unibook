// jwt-payload.interface.ts
import { PersonRole } from '../persons/entities/person.entity';

export interface JwtPayload {
  sub: number;
  email: string;
  role: PersonRole;
  companyId: number | null;
}