import { Router } from 'express';
import {
  checkIn, checkOut, getMyAttendance, getTodayAttendance,
  getEmployeeAttendance, getTodayStatus,
} from '../controllers/attendanceController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', getMyAttendance);
router.get('/today-status', getTodayStatus);
router.get('/today', roleMiddleware(['ADMIN']), getTodayAttendance);
router.get('/:employeeId', roleMiddleware(['ADMIN']), getEmployeeAttendance);

export default router;
