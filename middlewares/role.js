const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado y tenga rol
        if (!req.user || !req.user.role) {
            console.error(`Intento de acceso no autorizado a ${req.path}`);
            return res.status(401).json({
                success: false,
                message: 'Acceso no autorizado: usuario no autenticado'
            });
        }

        // Verificar que el rol del usuario esté permitido
        if (!allowedRoles.includes(req.user.role)) {
            console.log(`Acceso denegado para ${req.user.email} (${req.user.role}) en ruta ${req.path}`);
            return res.status(403).json({
                success: false,
                message: `Acceso denegado: Rol ${req.user.role} no tiene permisos para esta acción`,
                requiredRoles: allowedRoles
            });
        }

        next();
    };
};

// Funciones específicas por rol
const isAdmin = checkRole('admin');
const isCoordinador = checkRole('coordinador');
const isAuxiliar = checkRole('auxiliar');

// Funciones combinadas para permisos comunes
const canCreate = checkRole('admin', 'coordinador');
const canEdit = checkRole('admin', 'coordinador');
const canDelete = checkRole('admin');
const canView = checkRole('admin', 'coordinador', 'auxiliar');

module.exports = {
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar,
    canCreate,
    canEdit,
    canDelete,
    canView
};