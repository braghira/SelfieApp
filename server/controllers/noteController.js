const mongoose = require('mongoose');
const { Note } = require('../models/noteModels');

// Recupera tutte le note, filtrando in base all'accesso
const getNotes = async (req, res) => {
  const { user } = req;

  try {
    const notes = await Note.find({
      $or: [
        { accessType: "public" },
        { author: user.username },
        { accessType: "restricted", specificAccess: { $in: [user.username] } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Recupera una singola nota, verificando i permessi
const getNote = async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such note" });
  }

  try {
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ error: "No such note" });
    }

    // Controlla i permessi di accesso
    if (
      (note.accessType === "private" && note.author !== user.username) ||
      (note.accessType === "restricted" && !note.specificAccess.includes(user.username))
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crea una nuova nota
const createNote = async (req, res) => {
  const { title, content, categories, accessType, specificAccess, createdAt, updatedAt } = req.body;
  const { user } = req;

  try {
    const newNote = new Note({
      title,
      content,
      categories: categories || [],
      author: user.username,
      accessType: accessType || 'private',
      specificAccess: accessType === 'restricted' ? specificAccess : undefined,
      createdAt: createdAt ? new Date(createdAt) : Date.now(),
      updatedAt: updatedAt ? new Date(updatedAt) : Date.now(),
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Aggiorna una nota solo se l'autore è lo stesso utente
const updateNote = async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such note" });
  }

  try {
    // Prepara i dati da aggiornare, usando updatedAt dal body o Date.now() se non presente
    const updatedData = {
      ...req.body,
      updatedAt: req.body.updatedAt ? new Date(req.body.updatedAt) : Date.now(),
    };

    // Aggiorna la nota solo se l'autore corrisponde
    const note = await Note.findOneAndUpdate(
      { _id: id, author: user.username },
      updatedData,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "No such note or unauthorized" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Duplica una nota
const duplicateNote = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const { currentDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such note" });
  }

  try {
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ error: "No such note" });
    }

    // Verifica i permessi di accesso
    if (
      (note.accessType === "private" && note.author !== user.username) ||
      (note.accessType === "restricted" && note.author !== user.username && !note.specificAccess.includes(user.username))
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const duplicatedNote = new Note({
      ...note.toObject(),
      _id: undefined,
      title: `Copy of ${note.title}`,
      createdAt: currentDate ? new Date(currentDate) : Date.now(),
      updatedAt: currentDate ? new Date(currentDate) : Date.now(),
      author: user.username,
    });

    const savedNote = await duplicatedNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Elimina una nota solo se l'autore è lo stesso utente
const deleteNote = async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such note" });
  }

  try {
    const note = await Note.findOneAndDelete({ _id: id, author: user.username });

    if (!note) {
      return res.status(404).json({ error: "No such note or unauthorized" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//elimina tutte le note che hai creato
const deleteAllNotes = async (req, res) => {
  const { user } = req;

  try {
    await Note.deleteMany({ author: user.username });
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
  deleteAllNotes,
};
