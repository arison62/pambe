import { TypeRole } from 'src/entities/utilisateur.entity';

export type User = {
  email: string;
  id: number;
  role: TypeRole;
};
