import { Router } from 'express';
import { getCompany, updateCompany } from '../controllers/companyController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();
router.use(authMiddleware);

router.get('/', getCompany);
router.patch('/', roleMiddleware(['ADMIN']), (req, res, next) => {
  uploadImage(req, res, (err) => { if (err) return next(err); next(); });
}, updateCompany);

export default router;
