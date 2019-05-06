import { Router } from 'express';
import { allStats } from '../controllers/statistics';
const router: Router = Router();

router.route('/')
    .get(allStats)

export default router;