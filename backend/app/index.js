import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import config from 'config';
import routes from './models/routes.js';
import path from 'path';
import url from 'url';

const app = express();

const init = () => {
  app.use(bodyParser.json());
  app.use(cors());
  app.use(fileUpload());
  app.use(express.static('frontend/static'));

  app.use('/api/', routes);

  app.get('/', (req, res) => {
    res.sendFile('./frontend/index.html', { root: './' });
  });

  app.get('/file', async (req, res) => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const NDA_MOCK_PATH = path.join(__dirname, '../mock/One-Page NDA.pdf');
    res.sendFile(NDA_MOCK_PATH);
  });

  app.listen(config.port, () => {
    console.log(`API listening on port http://localhost:${config.port}`);
  });
}

init();
