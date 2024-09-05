import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNoteContext } from '@/context/NoteContext';
import useNotes from '@/hooks/useNote';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { marked } from 'marked'; 

interface NoteData {
  title: string;
  content: string;
  categories: string[];
  author: string;
  accessType: 'private' | 'public' | 'restricted';
  specificAccess: string[];
  createdAt: Date;
  updatedAt: Date;
  _id?: string;
}

function NoteEditor() {
  const { dispatch } = useNoteContext();
  const { addNote, updateNote, fetchNotes } = useNotes(); 
  const { id } = useParams(); 
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [initialFetch, setInitialFetch] = useState(false);
  const [noteData, setNoteData] = useState<NoteData>({
    title: '',
    content: '',
    categories: [],
    author: user?.name || '',
    accessType: 'private',
    specificAccess: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    const fetchNote = async () => {
      if (!id || initialFetch) return;
      setLoading(true);
      try {
        const fetchedNotes = await fetchNotes();
        const note = fetchedNotes.find((note) => note._id === id);
        if (note) {
          setNoteData(note);
          setInitialFetch(true);
        } else {
          setError('Nota non trovata.');
        }
      } catch (err) {
        setError('Errore nel caricamento della nota.');
        console.error('Errore fetching nota:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, fetchNotes, initialFetch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setNoteData({
      ...noteData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const updatedNoteData: NoteData = {
          ...noteData,
          updatedAt: new Date(),
        };
        await updateNote(updatedNoteData);
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNoteData });
      } else {
        const newNoteData: NoteData = {
          ...noteData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await addNote(newNoteData);
        dispatch({ type: 'ADD_NOTE', payload: newNoteData });
      }
      setShowPopup(true);
    } catch (err) {
      setError('Errore nel salvataggio della nota.');
      console.error('Errore nel salvataggio della nota:', err);
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const containsMarkdown = (text: string) => {
    return /[#*_-]/.test(text);
  };

  const renderMarkdown = (markdown: string) => {
    return { __html: marked(markdown) };
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl mx-auto">
        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Title</label>
          <input
            type="text"
            name="title"
            value={noteData.title}
            onChange={handleChange}
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Content</label>
          <textarea
            name="content"
            value={noteData.content}
            onChange={handleChange}
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            rows={10}
            required
          ></textarea>
          <div className="text-sm text-gray-500 mt-2">You can use Markdown syntax in the content.</div>
        </div>

        {containsMarkdown(noteData.content) && (
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Preview</label>
            <div 
              className="p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              dangerouslySetInnerHTML={renderMarkdown(noteData.content)} 
            />
          </div>
        )}

        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Categories</label>
          <input
            type="text"
            name="categories"
            value={noteData.categories.join(', ')}
            onChange={(e) =>
              setNoteData({
                ...noteData,
                categories: e.target.value.split(',').map((cat) => cat.trim()),
              })
            }
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
          />
        </div>

        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Author</label>
          <input
            type="text"
            name="author"
            value={noteData.author}
            onChange={handleChange}
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            required
            disabled 
          />
        </div>

        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Access Type</label>
          <select
            name="accessType"
            value={noteData.accessType}
            onChange={handleChange}
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        {noteData.accessType === 'restricted' && (
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Specific Access</label>
            <input
              type="text"
              name="specificAccess"
              value={noteData.specificAccess.join(', ')}
              onChange={(e) =>
                setNoteData({
                  ...noteData,
                  specificAccess: e.target.value.split(',').map((acc) => acc.trim()),
                })
              }
              className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            />
          </div>
        )}

        <Button
          type="submit"
          className="hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 transition"
          disabled={loading}
          aria-label={id ? 'Update Note' : 'Create Note'}  // Aggiungi aria-label qui
        >
          {id ? 'Update Note' : 'Create Note'}
        </Button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {id ? 'Nota aggiornata' : 'Nota creata'} con successo!
            </h2>
            <Button
              onClick={closePopup}
              className="hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 transition"
              aria-label="OK"  // Aggiungi aria-label qui
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
