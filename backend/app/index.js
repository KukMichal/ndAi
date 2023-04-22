import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import config from 'config';
import routes from './models/routes.js';

const app = express();

const init = () => {
  app.use(bodyParser.json());
  app.use(cors());
  app.use(fileUpload());

  app.use('/api/', routes);

  app.get('/', (req, res) => {
    res.sendFile('./frontend/index.html', { root: '../' });
  });
  app.listen(config.port, () => {
    console.log(`API listening on port http://localhost:${config.port}`);
  });
}

init();
