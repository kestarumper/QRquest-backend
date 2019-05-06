import { Router } from 'express';
import qr from './qr';
import users from './users';
import statistics from './statistics';
const router = Router();

router.use('/qrcode', qr);
router.use('/user', users);
router.use('/stats', statistics);

export default router;