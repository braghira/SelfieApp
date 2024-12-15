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
    default: 'private' // Di default le note sono private
  },
  specificAccess: {
    type: [String], // Usernames degli utenti che possono accedere (solo per 'restricted')
    required: function () {
      return this.accessType === 'restricted';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

const Note = mongoose.model('Note', noteSchema);

module.exports = { Note };
