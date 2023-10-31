import cors from "cors";
import path from "path";
import morgan from "morgan";
import express from "express";
import passport from "passport";
import session from "express-session";

import value from "./const/const.js";
import "./database/connection.js";
import authRoutes from "./routes/auth-routes.js"; // Asegúrate de que la ruta sea correcta
import "./config/passport-setup.js"; // Asegúrate de que la ruta sea correcta

const app = express(); 

const corsOptions = {
  credentials: true,  // Cambié 'credentiasl' por 'credentials'
  optionSuccessStatus: 200,
  methods: "GET, PUT, POST, DELETE",
  origin: "http://localhost:3000",  // Cambia esto a tu URL del frontend en producción
};

app.set("env", value.NODE_ENV);
app.set("port", value.RUN_PORT);

app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "500MB" }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: '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',  // Cambia 'tu_secreto' por tu clave secreta real
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(path.resolve(), value.STATIC_PATH)));

// Usar rutas de autenticación
app.use("/auth", authRoutes);

export default app;
