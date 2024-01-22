
import 'dotenv/config';
import express, { response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import value from './const/const.js';
import uploadRoutes from './routes/uploadRoutes.js';
import profesoresRoutes from './routes/profesoresRoutes.js';
import alumnosRoutes from './routes/alumnosRoutes.js';
import asignacionesRoutes from './routes/asignacionesRoutes.js';
import secretariasRoutes from './routes/secretariaRoutes.js';
import archivosRoutes from './routes/archivosRoutes.js';
import fileUpload from 'express-fileupload';


const app = express();

const corsOptions = {
  credentials: true,
  optionSuccessStatus: 200,
  methods: "GET, PUT, POST, DELETE",
  origin: [
    "https://titulados.administracionpublica-uv.cl",
    "http://localhost:3000",
  ],
};

app.set("env", value.NODE_ENV);
app.set("port", value.RUN_PORT);
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 500 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: "El archivo es demasiado grande",
}
));
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "500MB" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: value.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//endpoints
app.use('/upload', uploadRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/secretarias', secretariasRoutes);
app.use('/api/archivos', archivosRoutes)


export default app;
