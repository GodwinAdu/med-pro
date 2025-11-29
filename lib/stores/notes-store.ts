import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Note {
  id: string
  title: string
  content: string
  timestamp: string
}

interface NotesStore {
  notes: Note[]
  addNote: (title: string, content: string) => void
  deleteNote: (id: string) => void
  clearNotes: () => void
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (title: string, content: string) =>
        set((state) => {
          const note: Note = {
            id: Date.now().toString(),
            title: title.trim() || 'Clinical Note',
            content: content.trim(),
            timestamp: new Date().toLocaleString()
          }
          return { notes: [note, ...state.notes] }
        }),
      deleteNote: (id: string) =>
        set((state) => ({
          notes: state.notes.filter(note => note.id !== id)
        })),
      clearNotes: () => set({ notes: [] })
    }),
    {
      name: 'medpro-notes'
    }
  )
)