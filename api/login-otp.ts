import { handleLoginOtp } from '../server/otpRoutes.js';

export default async function handler(req: any, res: any) {
  return handleLoginOtp(req, res);
}
