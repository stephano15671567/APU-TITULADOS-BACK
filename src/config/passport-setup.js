import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import keys from './keys.js'; // Asegúrate de que este archivo exporte tus API keys correctamente
import pool from '../database/connection.js'; // Asegúrate de que este archivo exporte tu pool de conexión

passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: '/auth/google/redirect'
}, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    try {
        // Primero, intentamos encontrar al usuario en 'usuarios_google'.
        const [userRows] = await pool.query('SELECT * FROM usuarios_google WHERE google_id = ?', [profile.id]);
        let user = userRows[0];
        if (!user) {
            // Si no existe, lo insertamos en 'usuarios_google'.
            const [insertResult] = await pool.query('INSERT INTO usuarios_google (google_id, google_email) VALUES (?, ?)', [profile.id, email]);
            user = { id: insertResult.insertId, google_id: profile.id, google_email: email };
        }
        // Luego, buscamos al usuario en 'alumnos_titulados' usando el email.
        const [alumnoRows] = await pool.query('SELECT * FROM alumnos_titulados WHERE mail = ?', [email]);
        // Si encontramos un registro, actualizamos 'usuarios_google' con el ID de 'alumnos_titulados'.
        if (alumnoRows.length) {
            const alumno = alumnoRows[0];
            await pool.query('UPDATE usuarios_google SET id_alumno_titulado = ? WHERE id = ?', [alumno.id, user.id]);
            // Agregamos el ID de alumno titulado al objeto de usuario.
            user.id_alumno_titulado = alumno.id;
        }
        // Finalmente, pasamos el objeto de usuario a `done` para ser utilizado en la sesión de Passport.
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios_google WHERE id = ?', [id]);
    if (rows.length) {
      done(null, rows[0]);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (err) {
    done(err, null);
  }
});



/*passport.use(
  new GoogleStrategy(
    {
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: '/auth/google/redirect'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await db.query('SELECT * FROM usuarios_google WHERE google_id = ?', [profile.id]);
        if (rows.length > 0) {
          done(null, rows[0]);
        } else {
          const newUser = {
            google_id: profile.id,
            google_token: accessToken,
            google_email: profile.emails[0].value,
            google_name: profile.displayName
          };
          const [result] = await db.query('INSERT INTO usuarios_google SET ?', newUser);
          newUser.id = result.insertId;
          done(null, newUser);
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios_google WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});
*/