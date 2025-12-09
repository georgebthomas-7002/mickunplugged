// E.Q.U.I.P. 360 Assessment Context
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
  Dispatch,
} from 'react';
import type {
  UserProfile,
  AssessmentSession,
  AssessmentResponse,
  AssessmentResult,
  ScoreBreakdown,
  LeadershipFamilyCode,
  LeadershipTypeCode,
  Scenario,
  ScoreArray,
} from '@/types';
import { SCENARIOS } from '@/data/scenarios';
import {
  calculateScoreBreakdown,
  determineLeadershipFamily,
  determineLeadershipType,
} from '@/utils/scoring';
import { generateId } from '@/utils/helpers';

// ============================================
// STATE INTERFACE
// ============================================

interface AssessmentState {
  // User
  user: UserProfile | null;

  // Session
  session: AssessmentSession | null;

  // Scenarios
  scenarios: Scenario[];
  currentScenarioIndex: number;

  // Results
  result: AssessmentResult | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  showCoachMessage: boolean;
  lastCoachMessageProgress: number;
}

// ============================================
// ACTION TYPES
// ============================================

type AssessmentAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'START_ASSESSMENT' }
  | { type: 'RESUME_ASSESSMENT'; payload: AssessmentSession }
  | {
      type: 'ANSWER_SCENARIO';
      payload: {
        scenarioId: string;
        selectedChoice: 'A' | 'B' | 'C' | 'D';
        scores: ScoreArray;
      };
    }
  | { type: 'NEXT_SCENARIO' }
  | { type: 'PREVIOUS_SCENARIO' }
  | { type: 'GO_TO_SCENARIO'; payload: number }
  | { type: 'COMPLETE_ASSESSMENT' }
  | { type: 'CALCULATE_RESULTS' }
  | { type: 'SET_RESULT'; payload: AssessmentResult }
  | { type: 'RESET_ASSESSMENT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SHOW_COACH_MESSAGE'; payload: boolean }
  | { type: 'SET_LAST_COACH_PROGRESS'; payload: number };

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

const STORAGE_KEY = 'equip360_session';

function saveToLocalStorage(state: AssessmentState) {
  try {
    const dataToSave = {
      user: state.user,
      session: state.session,
      currentScenarioIndex: state.currentScenarioIndex,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage(): Partial<AssessmentState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return null;
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
}

// ============================================
// INITIAL STATE
// ============================================

const savedState = loadFromLocalStorage();

const initialState: AssessmentState = {
  user: savedState?.user || null,
  session: savedState?.session || null,
  scenarios: SCENARIOS,
  currentScenarioIndex: savedState?.currentScenarioIndex || 0,
  result: null,
  isLoading: false,
  error: null,
  showCoachMessage: false,
  lastCoachMessageProgress: -1,
};

// ============================================
// REDUCER
// ============================================

function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction
): AssessmentState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'START_ASSESSMENT':
      if (!state.user) return state;
      return {
        ...state,
        session: {
          id: generateId(),
          userId: state.user.id,
          status: 'in_progress',
          currentScenarioIndex: 0,
          responses: [],
          startedAt: new Date(),
        },
        currentScenarioIndex: 0,
        result: null,
      };

    case 'RESUME_ASSESSMENT':
      return {
        ...state,
        session: action.payload,
        currentScenarioIndex: action.payload.currentScenarioIndex,
      };

    case 'ANSWER_SCENARIO':
      if (!state.session) return state;

      const newResponse: AssessmentResponse = {
        scenarioId: action.payload.scenarioId,
        selectedChoice: action.payload.selectedChoice,
        scores: action.payload.scores,
        timestamp: new Date(),
      };

      // Check if this scenario was already answered
      const existingIndex = state.session.responses.findIndex(
        (r) => r.scenarioId === action.payload.scenarioId
      );

      const updatedResponses =
        existingIndex >= 0
          ? state.session.responses.map((r, i) =>
              i === existingIndex ? newResponse : r
            )
          : [...state.session.responses, newResponse];

      return {
        ...state,
        session: {
          ...state.session,
          responses: updatedResponses,
          lastSavedAt: new Date(),
        },
      };

    case 'NEXT_SCENARIO':
      const nextIndex = Math.min(
        state.currentScenarioIndex + 1,
        state.scenarios.length - 1
      );
      return {
        ...state,
        currentScenarioIndex: nextIndex,
        session: state.session
          ? { ...state.session, currentScenarioIndex: nextIndex }
          : null,
      };

    case 'PREVIOUS_SCENARIO':
      const prevIndex = Math.max(state.currentScenarioIndex - 1, 0);
      return {
        ...state,
        currentScenarioIndex: prevIndex,
        session: state.session
          ? { ...state.session, currentScenarioIndex: prevIndex }
          : null,
      };

    case 'GO_TO_SCENARIO':
      const targetIndex = Math.max(
        0,
        Math.min(action.payload, state.scenarios.length - 1)
      );
      return {
        ...state,
        currentScenarioIndex: targetIndex,
        session: state.session
          ? { ...state.session, currentScenarioIndex: targetIndex }
          : null,
      };

    case 'COMPLETE_ASSESSMENT':
      if (!state.session) return state;
      clearLocalStorage();
      return {
        ...state,
        session: {
          ...state.session,
          status: 'completed',
          completedAt: new Date(),
        },
      };

    case 'SET_RESULT':
      return {
        ...state,
        result: action.payload,
      };

    case 'RESET_ASSESSMENT':
      clearLocalStorage();
      return {
        ...initialState,
        scenarios: SCENARIOS,
        user: null,
        session: null,
        currentScenarioIndex: 0,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SHOW_COACH_MESSAGE':
      return { ...state, showCoachMessage: action.payload };

    case 'SET_LAST_COACH_PROGRESS':
      return { ...state, lastCoachMessageProgress: action.payload };

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface AssessmentContextType {
  state: AssessmentState;
  dispatch: Dispatch<AssessmentAction>;
  // Helper functions
  registerUser: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  startAssessment: () => void;
  answerScenario: (
    scenarioId: string,
    selectedChoice: 'A' | 'B' | 'C' | 'D',
    scores: ScoreArray
  ) => void;
  nextScenario: () => void;
  previousScenario: () => void;
  goToScenario: (index: number) => void;
  completeAssessment: () => void;
  calculateResults: () => AssessmentResult | null;
  resetAssessment: () => void;
  getCurrentScenario: () => Scenario | null;
  getProgress: () => number;
  getResponseForScenario: (scenarioId: string) => AssessmentResponse | undefined;
  isScenarioAnswered: (scenarioId: string) => boolean;
  canProceed: () => boolean;
  hasSavedProgress: () => boolean;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined
);

// ============================================
// PROVIDER
// ============================================

interface AssessmentProviderProps {
  children: ReactNode;
}

export function AssessmentProvider({ children }: AssessmentProviderProps) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.session && state.session.status === 'in_progress') {
      saveToLocalStorage(state);
    }
  }, [state.user, state.session, state.currentScenarioIndex]);

  // Register user
  const registerUser = useCallback(
    (profile: Omit<UserProfile, 'id' | 'createdAt'>) => {
      const user: UserProfile = {
        ...profile,
        id: generateId(),
        createdAt: new Date(),
      };
      dispatch({ type: 'SET_USER', payload: user });
    },
    []
  );

  // Start assessment
  const startAssessment = useCallback(() => {
    dispatch({ type: 'START_ASSESSMENT' });
  }, []);

  // Answer scenario
  const answerScenario = useCallback(
    (
      scenarioId: string,
      selectedChoice: 'A' | 'B' | 'C' | 'D',
      scores: ScoreArray
    ) => {
      dispatch({
        type: 'ANSWER_SCENARIO',
        payload: { scenarioId, selectedChoice, scores },
      });
    },
    []
  );

  // Navigation
  const nextScenario = useCallback(() => {
    dispatch({ type: 'NEXT_SCENARIO' });
  }, []);

  const previousScenario = useCallback(() => {
    dispatch({ type: 'PREVIOUS_SCENARIO' });
  }, []);

  const goToScenario = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_SCENARIO', payload: index });
  }, []);

  // Complete assessment
  const completeAssessment = useCallback(() => {
    dispatch({ type: 'COMPLETE_ASSESSMENT' });
  }, []);

  // Calculate results
  const calculateResults = useCallback((): AssessmentResult | null => {
    if (!state.session || !state.user) return null;

    const scores: ScoreBreakdown = calculateScoreBreakdown(
      state.session.responses
    );
    const leadershipFamily: LeadershipFamilyCode =
      determineLeadershipFamily(scores);
    const leadershipType: LeadershipTypeCode = determineLeadershipType(
      scores,
      leadershipFamily
    );

    const result: AssessmentResult = {
      id: generateId(),
      sessionId: state.session.id,
      userId: state.user.id,
      scores,
      leadershipFamily,
      leadershipType,
      completedAt: new Date(),
    };

    dispatch({ type: 'SET_RESULT', payload: result });
    return result;
  }, [state.session, state.user]);

  // Reset
  const resetAssessment = useCallback(() => {
    dispatch({ type: 'RESET_ASSESSMENT' });
  }, []);

  // Get current scenario
  const getCurrentScenario = useCallback((): Scenario | null => {
    return state.scenarios[state.currentScenarioIndex] || null;
  }, [state.scenarios, state.currentScenarioIndex]);

  // Get progress percentage
  const getProgress = useCallback((): number => {
    if (!state.session) return 0;
    return Math.round(
      (state.session.responses.length / state.scenarios.length) * 100
    );
  }, [state.session, state.scenarios.length]);

  // Get response for a specific scenario
  const getResponseForScenario = useCallback(
    (scenarioId: string): AssessmentResponse | undefined => {
      return state.session?.responses.find((r) => r.scenarioId === scenarioId);
    },
    [state.session]
  );

  // Check if scenario is answered
  const isScenarioAnswered = useCallback(
    (scenarioId: string): boolean => {
      return state.session?.responses.some((r) => r.scenarioId === scenarioId) || false;
    },
    [state.session]
  );

  // Check if can proceed (current scenario is answered)
  const canProceed = useCallback((): boolean => {
    const currentScenario = getCurrentScenario();
    if (!currentScenario) return false;
    return isScenarioAnswered(currentScenario.id);
  }, [getCurrentScenario, isScenarioAnswered]);

  // Check if there's saved progress
  const hasSavedProgress = useCallback((): boolean => {
    return !!(state.session && state.session.status === 'in_progress' && state.session.responses.length > 0);
  }, [state.session]);

  const value: AssessmentContextType = {
    state,
    dispatch,
    registerUser,
    startAssessment,
    answerScenario,
    nextScenario,
    previousScenario,
    goToScenario,
    completeAssessment,
    calculateResults,
    resetAssessment,
    getCurrentScenario,
    getProgress,
    getResponseForScenario,
    isScenarioAnswered,
    canProceed,
    hasSavedProgress,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
