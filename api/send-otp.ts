import { handleSendOtp } from '../server/otpRoutes.js';

export default async function handler(req: any, res: any) {
  return handleSendOtp(req, res);
}
