const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    categories: {
        type: [String],
        default: [] // Può essere una lista vuota se l'utente non specifica categorie
    },
    author: {
        type: String,
        required: true
    },
    accessType: {
        type: String,
        enum: ['public', 'restricted', 'private'],
        default: 'private'
    },
    specificAccess: {
        type: [String], // Utenti specifici che hanno accesso (email, ID, ecc.)
        required: function() { return this.accessType === 'restricted'; }
    },
}, { timestamps: true }); // timestamps aggiunge campi createdAt e updatedAt

module.exports = mongoose.model('Note', noteSchema);
