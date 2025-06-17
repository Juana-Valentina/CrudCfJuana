const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

console.log('[AuthJWT] Middleware de autenticación inicializado');

/**
 * Middleware para verificar tokens JWT
 * Versión simplificada y corregida
 */
const verifyToken = (req, res, next) => {
    // 1. Extraer token de múltiples fuentes posibles
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : req.headers['x-access-token'];

    // Debug: Mostrar información de la solicitud (solo desarrollo)
    if (process.env.NODE_ENV === 'development') {
        console.log('\n[AuthJWT] Solicitud recibida:', {
            method: req.method,
            path: req.originalUrl,
            tokenReceived: token ? `***${token.slice(-8)}` : 'NO RECIBIDO'
        });
    }

    // 2. Validar presencia del token
    if (!token) {
        console.error('[AuthJWT] Error: Token no proporcionado');
        return res.status(401).json({
            success: false,
            message: 'Autenticación requerida',
            solution: 'Incluye el token: Authorization: Bearer [tu_token]'
        });
    }

    // 3. Verificar token
    try {
        const decoded = jwt.verify(token, config.secret);
        
        // Adjuntar datos de usuario al request
        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        };

        console.log(`[AuthJWT] Usuario autenticado: ${decoded.email} (${decoded.role})`);
        next();

    } catch (error) {
        // Manejo específico de errores
        let errorMessage = 'Token inválido';
        
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'Token expirado';
            console.error('[AuthJWT] Token expirado:', error.expiredAt);
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Token malformado';
        }

        console.error('[AuthJWT] Error de autenticación:', errorMessage);
        return res.status(401).json({
            success: false,
            message: `Error de autenticación: ${errorMessage}`,
            error: error.name
        });
    }
};

// Validación de exportación
if (typeof verifyToken !== 'function') {
    console.error('[AuthJWT] Error crítico: verifyToken no es una función');
    throw new Error('Configuración inválida del middleware');
}

module.exports = {
    verifyToken
};