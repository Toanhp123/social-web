export type JwtUser = {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
};
