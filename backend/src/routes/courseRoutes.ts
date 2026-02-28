import { Router } from 'express';
import { getCourses, createCourse } from '../controllers/courseController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protected routes Require auth

router.get('/', getCourses);
router.post('/', createCourse);

export default router;
