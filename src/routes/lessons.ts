import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// TODO: Implement lesson routes
// GET /v1/lessons
// GET /v1/lessons/:id
// POST /v1/lessons/:id/submit

router.get('/', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Lesson routes coming soon' });
});

export default router;
