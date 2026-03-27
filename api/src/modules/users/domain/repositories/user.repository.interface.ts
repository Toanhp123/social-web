import { User } from '../entities/user.entity.js';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
}
