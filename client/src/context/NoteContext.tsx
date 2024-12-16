import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
} from "react";
import { NoteType } from "@/lib/utils";


// Tipi per le azioni
type ActionType =
  | { type: 'SET_NOTES'; payload: NoteType[] }
  | { type: "ADD_NOTE"; payload: NoteType }
  | { type: "UPDATE_NOTE"; payload: NoteType }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "DUPLICATE_NOTE"; payload: { id: string; currentDate: Date }}
  | { type: "DELETE_ALL_NOTES" };

// Tipo per lo stato del contesto delle note
type NoteStateType = NoteType[];

// Tipo per il contesto
type NoteContextType = {
  notes: NoteStateType;
  dispatch: React.Dispatch<ActionType>;
};
// Reducer per gestire lo stato delle note
function noteReducer(state: NoteStateType, action: ActionType): NoteStateType {
  switch (action.type) {
    case 'SET_NOTES':
      return action.payload; // Inizializza lo stato con le note
    case "ADD_NOTE":
      return [...state, action.payload];
    case "UPDATE_NOTE":
      return state.map((note) =>
        note._id === action.payload._id ? action.payload : note
      );
    case "DELETE_NOTE":
      return state.filter((note) => note._id !== action.payload);
      case "DUPLICATE_NOTE": {
        const { id, currentDate } = action.payload;
        const noteToDuplicate = state.find((note) => note._id === id);
        if (noteToDuplicate) {
          const duplicatedNote = {
            ...noteToDuplicate,
            _id: `${Date.now()}`, 
            title: `Copy of ${noteToDuplicate.title}`,
            createdAt: currentDate,
            updatedAt: currentDate,
          };
          return [...state, duplicatedNote];
        }
        return state;
      }
    case "DELETE_ALL_NOTES":
      return [];
    default:
      return state;
  }
}

// Imposta un valore predefinito per il contesto
const defaultContextValue: NoteContextType = {
  notes: [],
  dispatch: () => {}, // Funzione vuota di default
};

const NoteContext = createContext<NoteContextType>(defaultContextValue);

export function useNoteContext() {
  const context = useContext(NoteContext);

  if (!context) {
    throw new Error("useNoteContext must be used within a NoteProvider");
  }

  return context;
}

export function NoteProvider({ children }: PropsWithChildren) {
  const [notes, dispatch] = useReducer(noteReducer, []);

  return (
    <NoteContext.Provider value={{ notes, dispatch }}>
      {children}
    </NoteContext.Provider>
  );
}
