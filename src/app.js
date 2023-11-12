import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import value from './const/const.js';
import db from './database/connection.js'; // Asegúrate de que este archivo exporte la conexión a la base de datos
import './config/passport-setup.js';

// Rutas
import authRoutes from './routes/auth-routes.js';
import uploadRoutes from './routes/uploadRoutes.js';
// Importar la ruta de titulados que vamos a crear
import tituladosRoutes from './routes/tituladosRoutes.js';

const app = express();

// Opciones de CORS
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
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(path.resolve(), value.STATIC_PATH)));

// Usar las rutas importadas
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/api', tituladosRoutes); // Esta es la nueva línea para las rutas de los titulados

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
