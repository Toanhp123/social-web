export type RegisterActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export type RegisterRequestDto = {
  fullName: string;
  email: string;
  password: string;
  username?: string;
};

export type RegisterResultDto = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt?: Date;
};
