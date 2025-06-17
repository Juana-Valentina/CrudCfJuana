require ('dotenv').config();
module.exports ={
    secret: process.env.AUTH_SECRET  || "tusecretoparalostokens",
    jwtExpiration: 86400, // 24 horas en segundos
   saltRounds: process.env.SALT_ROUNDS || 8, // Número de rondas para el hash de la contraseña 
};

