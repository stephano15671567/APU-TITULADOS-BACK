
const db = require('../database/connection.js');

// Get all 'profesores_guias'
exports.getProfesoresGuias = async (req, res) => {
    try {
        const profesoresGuias = await db.query('SELECT * FROM profesores_guias');
        res.json(profesoresGuias);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Get all 'profesores_informantes'
exports.getProfesoresInformantes = async (req, res) => {
    try {
        const profesoresInformantes = await db.query('SELECT * FROM informantes');
        res.json(profesoresInformantes);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Update the assigned 'profesor_guia' and 'profesor_informante' for a 'titulado'
exports.updateProfesorAsignado = async (req, res) => {
    const { tituladoId, profesorGuiaId, profesorInformanteId } = req.body;
    try {
        await db.query('UPDATE alumnos_titulados SET profesor_guia = ?, profesor_informante = ? WHERE id = ?', 
        [profesorGuiaId, profesorInformanteId, tituladoId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).send('Server error');
    }
};
