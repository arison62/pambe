import { TypeRole } from 'src/common/entities/utilisateur.entity';

export type User = {
  email: string;
  id: number;
  role: TypeRole;
};
