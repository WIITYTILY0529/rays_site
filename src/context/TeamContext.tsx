import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { TEAMS, DEFAULT_TEAM, type TeamConfig } from '../services/teamConfig';

const STORAGE_KEY = 'selectedTeam';

interface TeamContextValue {
  team: TeamConfig;
  teamKey: string;
  setTeamKey: (key: string) => void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

function getInitialTeamKey(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && TEAMS[stored]) return stored;
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_TEAM;
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamKey, setTeamKeyState] = useState(getInitialTeamKey);
  const team = TEAMS[teamKey] ?? TEAMS[DEFAULT_TEAM];

  const setTeamKey = (key: string) => {
    setTeamKeyState(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // localStorage unavailable
    }
  };

  // Sync if localStorage changes in another tab
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && TEAMS[e.newValue]) {
        setTeamKeyState(e.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <TeamContext.Provider value={{ team, teamKey, setTeamKey }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}
