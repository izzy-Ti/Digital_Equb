import { Router } from 'express';
import {
    getSystemStats,
    getAllEqubsAdmin,
    getAllUsers,
    flagEqub,
    getRecentActivity,
    getUserDetails,
    updateUserRole
} from '../controller/adminController.js';
import userAuth from '../middleware/authMiddleware.js';

const router = Router();


router.get('/stats', userAuth, getSystemStats);
router.get('/activity', userAuth, getRecentActivity);
router.get('/equbs', userAuth, getAllEqubsAdmin);
router.post('/equb/flag', userAuth, flagEqub);
router.get('/users', userAuth, getAllUsers);
router.get('/user/:userId', userAuth, getUserDetails);
router.post('/user/role', userAuth, updateUserRole);

export default router;

//GET http://localhost:4000/api/admin/stats
//GET http://localhost:4000/api/admin/activity
//GET http://localhost:4000/api/admin/equbs
//POST http://localhost:4000/api/admin/equb/flag
//GET http://localhost:4000/api/admin/users
//GET http://localhost:4000/api/admin/user/:userId
//POST http://localhost:4000/api/admin/user/role
