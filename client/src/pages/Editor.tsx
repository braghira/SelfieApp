import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNoteContext } from "@/context/NoteContext";
import useNotes from "@/hooks/useNote";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
//import { marked } from 'marked';
import { useTimeMachineContext } from "@/context/TimeMachine";
import Loader from "@/components/Loader";
import UserFinder from "@/components/UserFinder";
import ReactMarkdown from "react-markdown";

interface NoteData {
  title: string;
  content: string;
  categories: string[];
  author: string;
  accessType: "private" | "public" | "restricted";
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
  const { currentDate } = useTimeMachineContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [initialFetch, setInitialFetch] = useState(false);

  const [noteData, setNoteData] = useState<NoteData>({
    title: "",
    content: "",
    categories: [],
    author: user?.name || "",
    accessType: "private",
    specificAccess: [],
    createdAt: currentDate,
    updatedAt: currentDate,
  });

  useEffect(() => {
    const fetchNote = async () => {
      if (!id || initialFetch) return;
      setLoading(true);
      try {
        const fetchedNotes = await fetchNotes();
        const note = fetchedNotes.find((note) => note._id === id);
        if (note) {
          setNoteData({
            ...note,
            createdAt: note.createdAt || new Date(),
            updatedAt: note.updatedAt as Date,
          });
          setInitialFetch(true);
        } else {
          setError("Nota non trovata.");
        }
      } catch (err) {
        setError("Errore nel caricamento della nota.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, fetchNotes, initialFetch, currentDate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
          updatedAt: currentDate,
        };
        await updateNote(updatedNoteData);
        dispatch({ type: "UPDATE_NOTE", payload: updatedNoteData });
      } else {
        const newNoteData: NoteData = {
          ...noteData,
          createdAt: currentDate,
          updatedAt: currentDate,
        };
        await addNote(newNoteData);
        dispatch({ type: "ADD_NOTE", payload: newNoteData });
      }
      setShowPopup(true);
    } catch (err) {
      setError("Errore nel salvataggio della nota.");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl mx-auto"
      >
        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Title
          </label>
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
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Content
          </label>
          <textarea
            name="content"
            value={noteData.content}
            onChange={handleChange}
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            rows={10}
            required
          ></textarea>
          <div className="text-sm text-gray-500 mt-2">
            You can use Markdown syntax in the content.
          </div>
        </div>

        {/* Anteprima Markdown */}
        {noteData.content && (
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Preview
            </label>
            <div className="p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              <ReactMarkdown>{noteData.content}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Categories
          </label>
          <input
            type="text"
            name="categories"
            value={noteData.categories.join(", ")}
            onChange={(e) =>
              setNoteData({
                ...noteData,
                categories: e.target.value.split(",").map((cat) => cat.trim()),
              })
            }
            className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
          />
        </div>

        <div className="mb-8">
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Author
          </label>
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
          <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Access Type
          </label>
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

        {noteData.accessType === "restricted" && (
          <div className="mb-8">
            <label className="block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Specific Access
            </label>
            <input
              type="text"
              name="specificAccess"
              value={noteData.specificAccess.join(", ")}
              onChange={(e) =>
                setNoteData({
                  ...noteData,
                  specificAccess: e.target.value
                    .split(",")
                    .map((username) => username.trim()),
                })
              }
              className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            />

            <UserFinder
              onUserSelect={(username: string) => {
                if (!noteData.specificAccess.includes(username)) {
                  setNoteData({
                    ...noteData,
                    specificAccess: [...noteData.specificAccess, username],
                  });
                }
              }}
            />

            <div className="mt-4">
              {noteData.specificAccess.map((user, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-lg mr-2 mb-2"
                >
                  {user}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="submit"
            className="hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            disabled={loading}
            aria-label={id ? "Update Note" : "Create Note"}
          >
            {id ? "Update Note" : "Create Note"}
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/notes")}
            className="ml-4 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 transition"
            aria-label="Torna alla Home Note"
          >
            Torna alla Home Note
          </Button>
        </div>
      </form>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <p className="text-lg text-gray-900 dark:text-gray-100">
              Nota salvata con successo!
            </p>
            <Button onClick={closePopup} className="mt-4">
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
