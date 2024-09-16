const mongoose = require('mongoose');
const Note = require('../models/noteModels');

// Recupera tutte le note
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({}).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Recupera una singola nota
const getNote = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such note' });
    }

    try {
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({ error: 'No such note' });
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crea una nuova nota
const createNote = async (req, res) => {
    const { title, content, categories, author, accessType, specificAccess, createdAt, updatedAt } = req.body;

    try {
        const newNote = new Note({
            title,
            content,
            categories: categories || [],
            author,
            accessType: accessType || 'private',
            specificAccess: specificAccess || [],
            createdAt: createdAt ? new Date(createdAt) : Date.now(),  // Usa la data fornita dal client o la data di sistema
            updatedAt: updatedAt ? new Date(updatedAt) : Date.now(),  // Usa la data fornita dal client o la data di sistema
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Duplica una nota
const duplicateNote = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such note' });
    }

    try {
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({ error: 'No such note' });
        }

        const duplicatedNote = new Note({
            ...note.toObject(),
            _id: undefined, // Genera un nuovo ID
            title: `Copy of ${note.title}`, // Modifica il titolo per differenziare
            createdAt: Date.now(), // Imposta una nuova data di creazione
            updatedAt: Date.now()  // Imposta una nuova data di aggiornamento
        });

        const savedNote = await duplicatedNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Aggiorna una nota
const updateNote = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such note' });
    }

    try {
        const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ error: 'No such note' });
        }
        res.status(200).json(updatedNote);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Elimina una nota
const deleteNote = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such note' });
    }

    try {
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ error: 'No such note' });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Elimina tutte le note
const deleteAllNotes = async (req, res) => {
    try {
        await Note.deleteMany({});
        res.status(204).end(); // No Content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    deleteAllNotes
};
