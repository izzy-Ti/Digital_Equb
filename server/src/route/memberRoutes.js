import { Router } from 'express';
import {
    joinEqub,
    leaveEqub,
    getEqubMembers,
    getUserEqubs,
    checkMembership
} from '../controller/memberController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = Router();

// Membership actions
router.post('/join', userAuth, joinEqub);
router.post('/leave', userAuth, leaveEqub);

// Query members
router.get('/equb/:equbId', getEqubMembers);
router.get('/user/:userId', getUserEqubs);
router.get('/check/:equbId/:userId', checkMembership);

export default router;

//POST http://localhost:4000/api/member/join
//POST http://localhost:4000/api/member/leave
//GET http://localhost:4000/api/member/equb/:equbId
//GET http://localhost:4000/api/member/user/:userId
//GET http://localhost:4000/api/member/check/:equbId/:userId
