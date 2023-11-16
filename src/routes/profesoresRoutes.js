
const express = require('express');
const router = express.Router();
const profesoresController = require('../controllers/profesoresController');

// Endpoint to get all 'profesores_guias'
router.get('/profesores-guias', profesoresController.getProfesoresGuias);

// Endpoint to get all 'profesores_informantes'
router.get('/profesores-informantes', profesoresController.getProfesoresInformantes);

// Endpoint to update the assigned 'profesor_guia' and 'profesor_informante' for a 'titulado'
router.post('/update-profesor', profesoresController.updateProfesorAsignado);

module.exports = router;
