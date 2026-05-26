import { handleVerifyOtp } from '../server/otpRoutes.js';

export default async function handler(req: any, res: any) {
  return handleVerifyOtp(req, res);
}
