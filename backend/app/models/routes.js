import express from 'express';
import analyzeNdaEndpoint from './nda/endpoints/analyze-nda.endpoint.js';

const router = express.Router();

router.post('/nda/analyze', analyzeNdaEndpoint);

router.get('/', (req, res) => {
  res.json({
    ok: true,
  });
});

export default router;
