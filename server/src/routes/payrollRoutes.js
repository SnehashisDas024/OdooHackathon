import { Router } from 'express';
import { getMyPayroll, getEmployeePayroll, updatePayroll } from '../controllers/payrollController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updatePayrollSchema } from '../validators/payrollValidators.js';

const router = Router();
router.use(authMiddleware);

router.get('/me', getMyPayroll);
router.get('/:employeeId', roleMiddleware(['ADMIN']), getEmployeePayroll);
router.put('/:employeeId', roleMiddleware(['ADMIN']), validateRequest(updatePayrollSchema), updatePayroll);

export default router;
