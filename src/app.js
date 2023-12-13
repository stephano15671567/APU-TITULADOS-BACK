import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import fileUpload from 'express-fileupload'; 
import value from './const/const.js';


import './config/passport-setup.js';
import authRoutes from './routes/auth-routes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tituladosRoutes from './routes/tituladosRoutes.js';
import profesoresRoutes from './routes/profesoresRoutes.js';
import secretariasRoutes from './routes/secretariasRoutes.js';
import jefaturaRoutes from './routes/jefaturaRoutes.js';
const app = express();

const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
  methods: 'GET, PUT, POST, DELETE',
  origin: 'http://localhost:3000', 
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


app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit:true,
  responseOnLimit: "El archivo es demasiado grande",
}));
// Convertir __dirname a ES6 Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, value.STATIC_PATH)));

app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/api/titulados', tituladosRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/secretarias', secretariasRoutes);
app.use('/api/jefatura', jefaturaRoutes)
// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});






export default app;
