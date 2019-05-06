import { Router } from 'express';
import { requestTokenUsingUsernamePassword, logout} from '../controllers/auth';
const router: Router = Router();

router.route('/login')
    .post(requestTokenUsingUsernamePassword);

export default router;