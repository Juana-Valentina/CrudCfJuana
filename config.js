module.exports = {
    // 1.configuracion de JJWT
    SECRET: process.env.JWT_SECRET ||
    'Tu_clave_secreto_para_desarrollo',
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || '24H',

    // 2.configuracion de base de datos
    DB: {
        URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/CrudCfJuana',
        OPTIONS:{
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // 3. Roles del sistema ( deben coincidir con tu implementacion).
    ROLES: {
        ADMIN: 'admin',
        COORDINADOR: 'coordinador',
        AUXILIAR: 'auxiliar'
    }
};