import { Router } from 'express';
import google from '../../controllers/authentication/authenticationGoogleController.js';

const router = Router();

router.get('/google', google.googleAuth);
router.get('/google-redirect', google.googleRedirect);

export default router;
