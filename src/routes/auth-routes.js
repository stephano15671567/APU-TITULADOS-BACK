import express from 'express';
import passport from 'passport';

const router = express.Router();
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send('Error al subir el archivo');
    }

    try {
      const userId = req.user.id; 
      const filePath = req.file.path;

      
      await db.query('INSERT INTO tesis (id_usuario_google, ruta_archivo) VALUES (?, ?)', [userId, filePath]);

      res.status(200).send('Archivo subido con éxito');
    } catch (error) {
      res.status(500).send('Error al guardar la información en la base de datos');
    }
  });
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('http://localhost:3000/TituladosHome'); 
});

export default router;
