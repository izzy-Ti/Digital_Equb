import { Router } from 'express';
import {
    recordWinner,
    updateWinnerStatus,
    getEqubWinners,
    getCurrentWinner,
    getUserWinnings,
    getWinnerByRound,
    getEligibleMembers
} from '../controller/winnerController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = Router();

// Record and update winners
router.post('/record', userAuth, recordWinner);
router.post('/update-status', updateWinnerStatus);

// Query winners
router.get('/equb/:equbId', getEqubWinners);
router.get('/equb/:equbId/current', getCurrentWinner);
router.get('/user/:userId', getUserWinnings);
router.get('/equb/:equbId/round/:round', getWinnerByRound);
router.get('/equb/:equbId/eligible', getEligibleMembers);

export default router;

//POST http://localhost:4000/api/winner/record
//POST http://localhost:4000/api/winner/update-status
//GET http://localhost:4000/api/winner/equb/:equbId
//GET http://localhost:4000/api/winner/equb/:equbId/current
//GET http://localhost:4000/api/winner/user/:userId
//GET http://localhost:4000/api/winner/equb/:equbId/round/:round
//GET http://localhost:4000/api/winner/equb/:equbId/eligible
