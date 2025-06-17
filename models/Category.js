const mongoose = require('mongoose');

// Esquema de categoría con validaciones
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es obligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    description: {
        type: String, 
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        maxlength: [200, 'La descripción no puede exceder 200 caracteres']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Campo requerido para solucionar el error
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Asegúrate que coincida con tu modelo User
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true,
    versionKey: false,
    strictPopulate: false // Permite populate incluso si los campos no existen
});

// Middleware para manejo de índices únicos (se mantiene igual)
categorySchema.pre('save', async function(next) {
    try {
        const collection = this.constructor.collection;
        const indexes = await collection.indexes();
        const problematicIndex = indexes.find(index => index.name === 'name_1');
        
        if (problematicIndex) {
            await collection.dropIndex('name_1');
            console.log('Índice único eliminado para recreación');
        }
        
        await collection.createIndex({ name: 1 }, { 
            unique: true,
            name: 'name_1',
            collation: { locale: 'es', strength: 2 }
        });
        
    } catch (err) {
        if (!err.message.includes('index not found')) {
            console.error('Error en pre-save:', err);
            return next(err);
        }
    }
    next();
});

// Método estático mejorado
categorySchema.statics.findByName = async function(name) {
    return this.findOne({ name: new RegExp(`^${name}$`, 'i') })
               .populate('createdBy', 'name email role');
};

// Middleware para limpieza antes de eliminar
categorySchema.pre('remove', async function(next) {
    try {
        console.log(`Eliminando categoría "${this.name}"`);
        // Ejemplo: Limpiar referencias en productos relacionados
        // await mongoose.model('Product').updateMany(
        //     { category: this._id },
        //     { $unset: { category: 1 } }
        // );
        next();
    } catch (err) {
        next(err);
    }
});

// Exportar modelo
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;