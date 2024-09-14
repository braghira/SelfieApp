const express = require('express');
const { requireAuth } = require('../middleware/authentication');
const {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    deleteAllNotes
} = require('../controllers/noteController');

const router = express.Router();

// Proteggi queste rotte con il nostro middleware di autenticazione
router.use(requireAuth);

// GET tutte le note
router.get('/', getNotes);

// GET una singola nota
router.get('/:id', getNote);

// POST una nuova nota
router.post('/', createNote);

// PATCH per aggiornare una nota
router.patch('/:id', updateNote);

// DELETE una nota
router.delete('/:id', deleteNote);

// POST per duplicare una nota
router.post('/:id/duplicate', duplicateNote); // Nuovo endpoint per duplicare una nota

// DELETE tutte le note
router.delete('/', deleteAllNotes); // Nuovo endpoint per eliminare tutte le note

module.exports = router;
