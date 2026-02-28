import { Router } from 'express';
import { askGuIA } from '../controllers/ragController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/ask', askGuIA);

export default router;
