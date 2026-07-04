import { Router } from 'express';
import {
  createEmployee, listEmployees, getMyProfile, getEmployee,
  updateMyProfile, updateEmployee, uploadAvatar, uploadResume,
  addSkill, removeSkill, addCertification, removeCertification,
} from '../controllers/employeeController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createEmployeeSchema } from '../validators/employeeValidators.js';
import { uploadImage, uploadDocument } from '../middleware/upload.js';

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

// Document uploads
router.post('/:id/documents/profile-picture', (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadAvatar);

router.post('/:id/documents/resume', (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, uploadResume);

export default router;
