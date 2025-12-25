import { Router } from 'express';
import { 
    createEqub, 
    startEqub, 
    pauseEqub, 
    endEqub,
    getEqubs,
    getEqubById,
    getEqubsByCreator,
    syncEqubFromBlockchain,
    getEqubStats
} from '../controller/equbController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = Router();

// Equb lifecycle
router.post('/create', userAuth, createEqub);
router.post('/start', userAuth, startEqub);
router.post('/pause', userAuth, pauseEqub);
router.post('/end', userAuth, endEqub);

// Query equbs
router.get('/all', getEqubs);
router.get('/:equbId', getEqubById);
router.get('/creator/:userId', getEqubsByCreator);
router.get('/:equbId/stats', getEqubStats);

// Blockchain sync
router.post('/sync', userAuth, syncEqubFromBlockchain);

export default router;

//POST http://localhost:4000/api/equb/create
//POST http://localhost:4000/api/equb/start
//POST http://localhost:4000/api/equb/pause
//POST http://localhost:4000/api/equb/end
//GET http://localhost:4000/api/equb/all
//GET http://localhost:4000/api/equb/:equbId
//GET http://localhost:4000/api/equb/creator/:userId
//GET http://localhost:4000/api/equb/:equbId/stats
//POST http://localhost:4000/api/equb/sync
