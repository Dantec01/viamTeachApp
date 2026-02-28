import { Router } from 'express';
import { getObservations, createObservation, updateObservation, createObservationAudio } from '../controllers/observationController';
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

router.get('/', getObservations);
router.post('/', createObservation);
router.post('/audio', upload.single('audio'), createObservationAudio);
router.put('/:id', updateObservation);

export default router;
