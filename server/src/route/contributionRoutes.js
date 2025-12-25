import { Router } from 'express';
import {
    recordContribution,
    updateContributionStatus,
    getUserContributions,
    getEqubContributions,
    getContributionByTxHash,
    getRoundStats
} from '../controller/contributionController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = Router();

// Record and update contributions
router.post('/record', userAuth, recordContribution);
router.post('/update-status', updateContributionStatus);

// Query contributions
router.get('/user/:userId', getUserContributions);
router.get('/equb/:equbId', getEqubContributions);
router.get('/tx/:txHash', getContributionByTxHash);
router.get('/round/:equbId/:round', getRoundStats);

export default router;

//POST http://localhost:4000/api/contribution/record
//POST http://localhost:4000/api/contribution/update-status
//GET http://localhost:4000/api/contribution/user/:userId
//GET http://localhost:4000/api/contribution/equb/:equbId
//GET http://localhost:4000/api/contribution/tx/:txHash
//GET http://localhost:4000/api/contribution/round/:equbId/:round
