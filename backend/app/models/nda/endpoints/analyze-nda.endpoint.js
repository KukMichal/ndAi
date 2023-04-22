import path from 'path';
import { fileURLToPath } from 'url';

import { analyze } from '../logic/analyze-nda.logic.js';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const NDA_MOCK_PATH = path.join(__dirname, '../../../../mock/nda2.pdf');

export default async function analyzeNdaEndpoint (req, res) {
  console.log("Analyzing NDA:", req.body);

  try {
    if (!req.files?.nda) {
      throw new Error('File was not provided.');
    }
    const input = {
      file: req.files.nda,
      input: req.body,
    };

    const queryRes = await analyze(input);
    res.json(queryRes);
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
}
