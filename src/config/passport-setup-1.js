import passport1 from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import mysql2 from 'mysql2/promise';
import db from '../database/connection.js'; // Asegúrate de que la ruta sea correcta

async function getUserById(id) {
    const connection = await mysql2.createConnection(db);
    const [rows] = await connection.query('SELECT * FROM guias WHERE id = ?', [id]); // Asegúrate de que la tabla y columna sean correctas
    await connection.end();

    return rows.length > 0 ? rows[0] : null;
}

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET, // La clave secreta para decodificar el JWT
};

passport1.use(new JwtStrategy(options, async (jwt_payload, done) => {
    try {
        const user = await getUserById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

export default passport1;

