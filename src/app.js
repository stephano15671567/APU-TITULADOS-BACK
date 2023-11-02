import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import value from './const/const.js';
import './database/connection.js';
import authRoutes from './routes/auth-routes.js';
import uploadRoutes from './routes/uploadRoutes.js'; // Importa las rutas de subida de archivos
import './config/passport-setup.js';

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
  secret: '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',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(path.resolve(), value.STATIC_PATH)));

app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes); // Usa las rutas de subida de archivos

export default app;
