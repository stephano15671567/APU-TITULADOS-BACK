const express = require('express');
const passport = require('passport');
const router = express.Router();
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  // El usuario está autenticado y puedes hacer algo con el req.user
  res.redirect('/dashboard');
});

/*router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  // Aquí puedes manejar la creación/actualización del usuario en tu base de datos
  // ...

  // Redirige al usuario a la página deseada en tu aplicación frontend
  res.redirect('http://localhost:3000/TituladosHome');
 // Asegúrate de usar la URL correcta de tu aplicación frontend
});

// ... (cualquier otra ruta que necesites)
*/
module.exports = router;

