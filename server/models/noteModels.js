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
        default: [] 
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
        type: [String],
        required: function() { return this.accessType === 'restricted'; }
    },
}, { timestamps: true }); 

module.exports = mongoose.model('Note', noteSchema);
