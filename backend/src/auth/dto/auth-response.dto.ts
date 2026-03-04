export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
  user!: {
    _id: string;
    email: string;
    name: string;
    username: string;
    role: string;
    companyId?: string;
  };
}
