import { User } from '@/modules/users/domain/entities/user.entity.js';

export type CreateUserInput = {
  id: string;
  fullName: string;
  username: string | null;
};

export abstract class UserRepository {
  abstract create(input: CreateUserInput): Promise<void>;

  abstract findById(id: string): Promise<User | null>;
}
