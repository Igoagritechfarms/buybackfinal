import { handleSignup } from '../server/otpRoutes.js';

export default async function handler(req: any, res: any) {
  return handleSignup(req, res);
}
