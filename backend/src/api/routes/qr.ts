import { Router } from 'express';
import * as passport from 'passport';
import { addQRCodeToUser, listUserQRCodes } from '../controllers/qrcodes';
const router: Router = Router();

router.route('/')
  .get(passport.authenticate('jwt', { session: false }), listUserQRCodes)
  .post(passport.authenticate('jwt', { session: false }), addQRCodeToUser)

export default router;