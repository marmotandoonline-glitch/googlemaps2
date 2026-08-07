import { Router } from 'express';
import { connectWhatsApp, statusWhatsApp, logoutWhatsApp, sendMsgWhatsApp, queueMsgWhatsApp, approveMsgWhatsApp, cancelMsgWhatsApp, listWhatsAppAttempts } from '../controllers/whatsappController';

const router = Router();

router.post('/connect', connectWhatsApp);
router.get('/status', statusWhatsApp);
router.post('/logout', logoutWhatsApp);
router.post('/send', sendMsgWhatsApp);
router.post('/queue', queueMsgWhatsApp);
router.get('/attempts', listWhatsAppAttempts);
router.post('/attempts/:idempotencyKey/approve', approveMsgWhatsApp);
router.post('/attempts/:idempotencyKey/cancel', cancelMsgWhatsApp);

export const whatsappRouter = router;
