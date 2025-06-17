const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const verifySignUp = require('../middlewares/verifySignUp');

//Importacion de verificacion
let verifytoken;
try {
     const authJwt = require('../middlewares/authJwt');
     verifytoken = authJwt.verifyToken;
     console.log ('[AuthRoutes] verifyToken importado correctamente',typeof verifytoken);
} catch (error) {
    console.error('[AuthRoutes] Error al importar verifyToken:', error);
    throw error;

}

//Middleware de diagnsotico
router.use((req, res, next) => {
    console.log('\n[AuthRoutes] peticion recibida:', {
        method: req.method,
        path: req.path,
        Headers: {
            Authorization: req.headers.authorization ? 
                '***': 'NO',
                'X-accesss-token': req.headers
                ['x access-token'] ? '***' : 'No'
        }
    });
    next();
});

//Rutas de login (sin proteccion)
router.post('/signin', authController.signin);

//Ruta de registro 
router.post('/signup',
    (req, _res, next) => {
        console.log('[AuthRoutes] middleware de verificacion de registro');
        next();
    },
    verifySignUp.checkduplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    authController.signup
);

//Verificaion final de token
console.log('[AuthRoutes] Rutas configuaradas:', router.stack.map(layer => {
    return {
        path: layer.route?.path,
        method: layer.route?.methods

    };
}));

module.exports = router;