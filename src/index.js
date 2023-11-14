/* The code is importing the necessary modules and values for running a server in a JavaScript
application. */
import 'dotenv/config.js';
import app from './app.js';

import value from './const/const.js';


const main = (() => {
    const server = app.listen( value.RUN_PORT || 4000 ); //instancia 
    console.log("Server activo", value.RUN_PORT || 4000);
    server.timeout = 600000;
})();

