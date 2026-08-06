import { Router } from 'express';
import { getRankTrackerGrid } from '../controllers/rankTrackerController';

const router = Router();

router.get('/:leadId', getRankTrackerGrid);

export const rankTrackerRouter = router;
