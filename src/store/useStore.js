import { create } from 'zustand';

const useSessionStore = create((set) => ({
  sessionId: null,
  duration: 10,
  ws: null,
  files: [],
  setDuration: (duration) => set({ duration }),
  setSessionId: (sessionId) => set({ sessionId }),
  setFiles: (files) => set({ files }),
  setWs: (ws) => set({ ws }),
  reset: () => set({ sessionId: null, duration: 10, ws: null, files: [] }),
}));

export default useSessionStore;