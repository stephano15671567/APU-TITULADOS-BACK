import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import fileUpload from 'express-fileupload'; // Importar una sola vez
import value from './const/const.js';
// import db from './database/connection.js'; // Esta línea puede ser innecesaria si no usas 'db' aquí.

import './config/passport-setup.js';
import authRoutes from './routes/auth-routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import tituladosRoutes from './routes/tituladosRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
  methods: 'GET, PUT, POST, DELETE',
  origin: 'http://localhost:3000', // Asegúrate de que esta es la URL de tu frontend
};

app.set('env', value.NODE_ENV);
app.set('port', value.RUN_PORT);

app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '500MB' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: value.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Debes usar fileUpload antes de las rutas que necesitan procesar archivos subidos
app.use(fileUpload());

// Convertir __dirname a ES6 Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, value.STATIC_PATH)));

app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes); // Asegúrate de que este es el endpoint correcto.
app.use('/api/titulados', tituladosRoutes);

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
