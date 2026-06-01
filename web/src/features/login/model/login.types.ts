export type LoginActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResultDto = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt?: Date;
};
