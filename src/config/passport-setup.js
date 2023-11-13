import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import keys from './keys.js';
import db from '../database/connection.js'; // Importa tu conexión a la base de datos

passport.use(
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
