import { useState } from 'react';
import { Trash2, Copy, Edit, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';
import { useNoteContext } from '@/context/NoteContext';
import useNotes from '@/hooks/useNote';
import { useAuth } from "@/context/AuthContext";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
  author: string; // Nuova proprietà per l'autore
}

export default function NoteCard({
  id,
  title,
  content,
  categories,
  createdAt,
  updatedAt,
  author, // Destrutturazione della nuova proprietà
}: NoteCardProps) {
  const { user } = useAuth();
  const { dispatch } = useNoteContext();
  const { deleteNote, duplicateNote } = useNotes();

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const previewContent = content.length > 200 ? `${content.slice(0, 200)}...` : content;

  const handleEdit = () => {
    if (user) {
      window.location.href = `/editor/${id}`;
    } else {
      console.warn('Utente non autorizzato a modificare la nota.');
    }
  };

  const handleDelete = async () => {
    if (user) {
      await deleteNote(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } else {
      console.warn('Utente non autorizzato a eliminare la nota.');
    }
  };

  const handleDuplicate = async () => {
    if (user) {
      const duplicatedNote = await duplicateNote(id);
      if (typeof duplicatedNote !== 'undefined') {
        dispatch({ type: 'ADD_NOTE', payload: duplicatedNote });
      }
    } else {
      console.warn('Utente non autorizzato a duplicare la nota.');
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content).then(
      () => console.log('Nota copiata negli appunti'),
      (err) => console.error('Errore nella copia del testo:', err)
    );
  };

  const handleSeeMore = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <Card className="note-card max-w-full w-full p-4">
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <CardTitle className="text-primary">{title}</CardTitle>
          {user && (
            <div className="flex space-x-2 mt-2 md:mt-0 justify-center">
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Edit className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCopyContent}>
                <Copy className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDuplicate}>
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-col gap-3">
          <div className="text-gray-600 dark:text-white mb-2">
            {previewContent}
            {content.length > 200 && (
              <span
                onClick={handleSeeMore}
                className="font-bold italic cursor-pointer ml-1 text-red-600 dark:text-red-400"
              >
                see more
              </span>
            )}
          </div>
          <div>
            Categories: <span className="font-semibold">{categories.join(', ')}</span>
          </div>
          <div>
            Created: <span className="font-semibold">{format(new Date(createdAt), 'dd/MM/yyyy')}</span>
          </div>
          <div>
            Updated: <span className="font-semibold">{format(new Date(updatedAt), 'dd/MM/yyyy')}</span>
          </div>
          <div>
            Author: <span className="font-semibold">{author}</span> {/* Aggiunta per visualizzare l'autore */}
          </div>
        </CardContent>
      </Card>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-lg w-full relative h-3/4 overflow-y-auto">
            <Button
              onClick={closePopup}
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
            >
              <X className="h-6 w-6" />
            </Button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              {title}
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              {content}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Author:</strong> {author}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

