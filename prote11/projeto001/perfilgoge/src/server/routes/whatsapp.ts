import { Router } from 'express';
import { connectWhatsApp, statusWhatsApp, logoutWhatsApp, sendMsgWhatsApp } from '../controllers/whatsappController';

const router = Router();

router.post('/connect', connectWhatsApp);
router.get('/status', statusWhatsApp);
router.post('/logout', logoutWhatsApp);
router.post('/send', sendMsgWhatsApp);

export const whatsappRouter = router;
