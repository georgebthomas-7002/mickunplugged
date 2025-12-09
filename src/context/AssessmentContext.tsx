import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';
import type { Assessment, AssessmentResponse, Answer } from '@/types';

// State interface
interface AssessmentState {
  currentAssessment: Assessment | null;
  currentResponse: AssessmentResponse | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AssessmentAction =
  | { type: 'SET_ASSESSMENT'; payload: Assessment }
  | { type: 'START_ASSESSMENT'; payload: { respondentId: string } }
  | { type: 'ANSWER_QUESTION'; payload: Answer }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'GO_TO_QUESTION'; payload: number }
  | { type: 'COMPLETE_ASSESSMENT' }
  | { type: 'RESET_ASSESSMENT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AssessmentState = {
  currentAssessment: null,
  currentResponse: null,
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,
};

// Reducer
function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction
): AssessmentState {
  switch (action.type) {
    case 'SET_ASSESSMENT':
      return {
        ...state,
        currentAssessment: action.payload,
        currentQuestionIndex: 0,
      };

    case 'START_ASSESSMENT':
      if (!state.currentAssessment) return state;
      return {
        ...state,
        currentResponse: {
          assessmentId: state.currentAssessment.id,
          respondentId: action.payload.respondentId,
          answers: [],
          startedAt: new Date(),
        },
        currentQuestionIndex: 0,
      };

    case 'ANSWER_QUESTION':
      if (!state.currentResponse) return state;
      const existingAnswerIndex = state.currentResponse.answers.findIndex(
        (a) => a.questionId === action.payload.questionId
      );
      const updatedAnswers =
        existingAnswerIndex >= 0
          ? state.currentResponse.answers.map((a, i) =>
              i === existingAnswerIndex ? action.payload : a
            )
          : [...state.currentResponse.answers, action.payload];
      return {
        ...state,
        currentResponse: {
          ...state.currentResponse,
          answers: updatedAnswers,
        },
      };

    case 'NEXT_QUESTION':
      if (!state.currentAssessment) return state;
      const maxIndex = state.currentAssessment.questions.length - 1;
      return {
        ...state,
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, maxIndex),
      };

    case 'PREVIOUS_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      };

    case 'GO_TO_QUESTION':
      if (!state.currentAssessment) return state;
      const questionCount = state.currentAssessment.questions.length;
      return {
        ...state,
        currentQuestionIndex: Math.max(
          0,
          Math.min(action.payload, questionCount - 1)
        ),
      };

    case 'COMPLETE_ASSESSMENT':
      if (!state.currentResponse) return state;
      return {
        ...state,
        currentResponse: {
          ...state.currentResponse,
          completedAt: new Date(),
        },
      };

    case 'RESET_ASSESSMENT':
      return initialState;

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// Context
interface AssessmentContextType {
  state: AssessmentState;
  dispatch: Dispatch<AssessmentAction>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined
);

// Provider component
interface AssessmentProviderProps {
  children: ReactNode;
}

export function AssessmentProvider({ children }: AssessmentProviderProps) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

// Custom hook to use the context
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
