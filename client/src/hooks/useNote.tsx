import useAxiosPrivate from './useAxiosPrivate';
import { NoteType, client_log } from '@/lib/utils';
import { isAxiosError } from 'axios';
import { useNoteContext } from "@/context/NoteContext"; // Assumendo che tu abbia un NotesContext
import { useTimeMachineContext } from '@/context/TimeMachine';

interface UseNotesReturn {
  addNote: (note: NoteType) => void;
  updateNote: (note: NoteType) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => void;
  deleteAllNotes: () => void;
  fetchNotes: () => Promise<NoteType[]>;
}

const useNotes = (): UseNotesReturn => {
  const private_api = useAxiosPrivate();
  const { dispatch } = useNoteContext(); // Dispatcher del contesto
  const { currentDate } = useTimeMachineContext();

  // Funzione per recuperare le note dal server
  const fetchNotes = async (): Promise<NoteType[]> => {
    try {
      const response = await private_api.get('/api/notes');
      const notes = response.data;
      dispatch({ type: 'SET_NOTES', payload: notes }); // Aggiorna lo stato globale delle note
      return notes;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('An error occurred while fetching notes:', error.message);
      } else {
        console.error('Uncaught error');
      }
      return [];
    }
  };

  // Aggiungi una nuova nota
  const addNote = async (note: NoteType) => {
    try {
      const response = await private_api.post('/api/notes', note);
      dispatch({ type: 'ADD_NOTE', payload: response.data }); // Aggiorna lo stato con la nuova nota aggiunta
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('An error occurred while adding note:', error.message);
      } else {
        console.error('Uncaught error');
      }
    }
  };

  // Aggiorna una nota esistente
  const updateNote = async (updatedNote: NoteType) => {
    try {
      const response = await private_api.patch(`/api/notes/${updatedNote._id}`, updatedNote);
      dispatch({ type: 'UPDATE_NOTE', payload: response.data }); // Aggiorna lo stato con la nota modificata
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('An error occurred while updating note:', error.message);
      } else {
        console.error('Uncaught error');
      }
    }
  };

  // Elimina una nota creata dall'utente corrente
  const deleteNote = async (id: string) => {
    try {
      await private_api.delete(`/api/notes/${id}`);
      dispatch({ type: 'DELETE_NOTE', payload: id }); // Aggiorna lo stato rimuovendo la nota eliminata
      await fetchNotes(); // Ricarica le note 
      client_log(`Note with ID ${id} successfully deleted`);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          client_log(`Unauthorized: You are not the author or lack permission for note with ID ${id}`);
        } else {
          client_log(`Error during deletion of note ${id}: ${error.message}`);
        }
      } else {
        client_log(`Uncaught error during deletion of note ${id}`);
      }
    }
  };

  const duplicateNote = async (id: string) => {
    try {
      const response = await private_api.post(`/api/notes/${id}/duplicate`, { currentDate });

      // Supponendo che la risposta contenga la nuova nota duplicata
      dispatch({ type: 'DUPLICATE_NOTE', payload: response.data });
      await fetchNotes(); // Ricarica le note 
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('An error occurred while duplicating note:', error.message);
      } else {
        console.error('Uncaught error during note duplication');
      }
    }
  };
  

  // Elimina tutte le note create dall'utente corrente
  const deleteAllNotes = async () => {
    try {
      await private_api.delete('/api/notes');
      dispatch({ type: 'DELETE_ALL_NOTES' }); // Aggiorna lo stato rimuovendo tutte le note
      await fetchNotes(); // Ricarica le note 
      client_log('All notes successfully deleted');
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 403) {
          client_log('Unauthorized: You can only delete your own notes.');
        } else {
          client_log(`Error during deletion of all notes: ${error.message}`);
        }
      } else {
        client_log('Uncaught error during deletion of all notes');
      }
    }
  };

  return {
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    deleteAllNotes,
    fetchNotes,
  };
};

export default useNotes;
