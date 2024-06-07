import dotenv from 'dotenv';
import http from 'http'; // Import HTTP module
import { app } from './app.js'; // Import only app
import value from './const/const.js';

dotenv.config();

const main = (() => {
    // Create and start HTTP server
    const server = http.createServer(app).listen(value.RUN_PORT || 8080, () => {
        console.log(`HTTP Server activo en el puerto ${value.RUN_PORT || 8080}`);
    });
    server.timeout = 600000; // Set a long timeout for all connections
})();
