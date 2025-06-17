const mongoose = require('mongoose');
const {DB_URI} = require('./config');

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('conexion exitosa');
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        process.exit(1);
    }
};

module.exports  = connectDB;