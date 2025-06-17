// utils/role.Validation.js
function validatePermissions(userRole, allowedRoles) {
    if (!userRole) {
        const error = new Error('Acceso denegado: Rol no definido');
        error.status = 403;
        throw error;
    }
    
    if (!allowedRoles.includes(userRole)) {
        const error = new Error(`Acceso denegado: Rol ${userRole} no tiene permisos suficientes`);
        error.status = 403;
        throw error;
    }
}

module.exports = { validatePermissions };