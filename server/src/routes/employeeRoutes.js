import { Router } from 'express';
import {
  createEmployee, listEmployees, getMyProfile, getEmployee,
  updateMyProfile, updateEmployee, uploadAvatar,
  addSkill, removeSkill, addCertification, removeCertification,
} from '../controllers/employeeController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createEmployeeSchema } from '../validators/employeeValidators.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

// All employee routes require auth
router.use(authMiddleware);

// Own profile (any authenticated user)
router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);

// Admin: list and create
router.get('/', roleMiddleware(['ADMIN']), listEmployees);
router.post('/', roleMiddleware(['ADMIN']), validateRequest(createEmployeeSchema), createEmployee);

// Admin: specific employee
router.get('/:id', roleMiddleware(['ADMIN']), getEmployee);
router.patch('/:id', roleMiddleware(['ADMIN']), updateEmployee);

// Skills (owner or admin)
router.post('/:id/skills', addSkill);
router.delete('/:id/skills/:skillId', removeSkill);

// Certifications (owner or admin)
router.post('/:id/certifications', addCertification);
router.delete('/:id/certifications/:certId', removeCertification);

// Profile picture upload
router.post('/:id/documents/profile-picture', (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadAvatar);

export default router;
