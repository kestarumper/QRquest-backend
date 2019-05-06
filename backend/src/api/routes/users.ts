import { Router } from 'express';
import { scoreboard, listUser, addUser, deleteUser, updateUser } from '../controllers/users';
import * as passport from 'passport';
const router: Router = Router();

router.route('/')
    .get(passport.authenticate('jwt', { session: false }), listUser)
    .put(passport.authenticate('jwt', { session: false }), updateUser)
    .delete(passport.authenticate('jwt', { session: false }), deleteUser)

router.route('/scoreboard')
    .get(scoreboard);

export default router;