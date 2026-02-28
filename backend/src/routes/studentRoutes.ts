import { Router } from 'express';
import { getStudents, createStudent, scanStudents } from '../controllers/studentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = Router();

router.use(authenticateToken);

router.get('/', getStudents);
router.post('/', createStudent);
router.post('/scan', upload.single('image'), scanStudents);


export default router;
