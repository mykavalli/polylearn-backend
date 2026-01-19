import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// TODO: Implement pet routes
// POST /v1/pet/create
// GET /v1/pet
// POST /v1/pet/add-exp

router.post('/create', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Pet routes coming soon' });
});

export default router;
