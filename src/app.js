import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import fileUpload from 'express-fileupload';

import uploadRoutes from './routes/uploadRoutes.js';
import profesoresRoutes from './routes/profesoresRoutes.js';
import alumnosRoutes from './routes/alumnosRoutes.js';
import asignacionesRoutes from './routes/asignacionesRoutes.js';
import secretariasRoutes from './routes/secretariaRoutes.js';
import notasRoutes from './routes/notasRoutes.js';
import archivosRoutes from './routes/archivosRoutes.js';
import correosRoutes from './routes/correosRoutes.js';
import stateRoutes from './routes/statesRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import value from './const/const.js';

const app = express();

const corsOptions = {
  origin: [
    "https://titulados.administracionpublica-uv.cl",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '500MB' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: value.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 500 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: "El archivo es demasiado grande"
}));

// Rutas
app.use('/api/report', reportRoutes);
app.use('/api/notas', notasRoutes);
app.use('/upload', uploadRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/secretarias', secretariasRoutes);
app.use('/api/archivos', archivosRoutes);
app.use('/api/correo_send', correosRoutes);
app.use('/api/states', stateRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export { app };
