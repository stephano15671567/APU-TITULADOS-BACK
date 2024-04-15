import dotenv from 'dotenv';
import { app, options } from './app.js'; // Import app and options together
import https from 'https'; // Import HTTPS module
import value from './const/const.js';

dotenv.config();

const main = (() => {
    // Create and start HTTPS server
    const server = https.createServer(options, app).listen(value.RUN_PORT || 8443, () => { 
        console.log(`HTTPS Server activo en el puerto ${value.RUN_PORT || 8443}`);
    });
    server.timeout = 600000; // Set a long timeout for all connections
})();
