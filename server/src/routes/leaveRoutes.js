import { Router } from 'express';
import {
  getLeaveBalance, applyLeave, getMyLeaves, getAllLeaves, decideLeave,
} from '../controllers/leaveController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { applyLeaveSchema, leaveDecisionSchema } from '../validators/leaveValidators.js';
import { uploadDocument } from '../middleware/upload.js';

const router = Router();
router.use(authMiddleware);

router.get('/balance', getLeaveBalance);
router.get('/me', getMyLeaves);
router.post('/', (req, res, next) => {
  // Accept optional file attachment (sick leave cert)
  uploadDocument(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, validateRequest(applyLeaveSchema), applyLeave);

// Admin routes
router.get('/', roleMiddleware(['ADMIN']), getAllLeaves);
router.patch('/:id/decision', roleMiddleware(['ADMIN']), validateRequest(leaveDecisionSchema), decideLeave);

export default router;
