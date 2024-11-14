export class EmailVerificationCodeModel {
  id: number;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt: Date | null;
}
