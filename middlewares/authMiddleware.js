const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (error) {
        // ESTA LÍNEA ES NUEVA: Imprimirá el error real en tu terminal
        console.log("Error al verificar el token:", error.message); 
        return res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
        }
        next();
    };
};

module.exports = { verificarToken, verificarRol };