import { handleLogin } from '../server/otpRoutes.js';

export default async function handler(req: any, res: any) {
  return handleLogin(req, res);
}
