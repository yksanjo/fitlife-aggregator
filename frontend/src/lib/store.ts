import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, DashboardSummary } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ isLoading: value }),
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  lastFetched: number | null;
  setSummary: (summary: DashboardSummary | null) => void;
  setLoading: (value: boolean) => void;
  invalidateCache: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  isLoading: false,
  lastFetched: null,
  setSummary: (summary) => set({ summary, lastFetched: Date.now() }),
  setLoading: (value) => set({ isLoading: value }),
  invalidateCache: () => set({ lastFetched: null }),
}));

interface UIState {
  sidebarOpen: boolean;
  selectedMetric: string;
  heatmapWeeks: number;
  setSidebarOpen: (value: boolean) => void;
  toggleSidebar: () => void;
  setSelectedMetric: (value: string) => void;
  setHeatmapWeeks: (value: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  selectedMetric: 'steps',
  heatmapWeeks: 26,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedMetric: (value) => set({ selectedMetric: value }),
  setHeatmapWeeks: (value) => set({ heatmapWeeks: value }),
}));
