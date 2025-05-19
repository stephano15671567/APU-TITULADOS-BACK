import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { app } from './app.js';
import value from './const/const.js';

const main = (() => {
  const server = http.createServer(app).listen(value.RUN_PORT || 8080, () => {
    console.log(`HTTP Server activo en el puerto ${value.RUN_PORT || 8080}`);
  });
  server.timeout = 600000;
})();
