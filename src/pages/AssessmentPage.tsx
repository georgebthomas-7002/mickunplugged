import { useParams } from 'react-router-dom';
import QuestionCard from '@/components/Assessment/QuestionCard';
import ProgressBar from '@/components/Assessment/ProgressBar';
import './AssessmentPage.css';

function AssessmentPage() {
  const { id } = useParams<{ id: string }>();

  // Placeholder - replace with actual assessment data fetching
  const assessment = {
    id: id,
    title: 'Sample Assessment',
    questions: [
      {
        id: 'q1',
        type: 'single-choice' as const,
        text: 'What is the capital of France?',
        options: [
          { id: 'o1', text: 'London', value: 'london' },
          { id: 'o2', text: 'Paris', value: 'paris', isCorrect: true },
          { id: 'o3', text: 'Berlin', value: 'berlin' },
          { id: 'o4', text: 'Madrid', value: 'madrid' },
        ],
        required: true,
      },
    ],
  };

  const currentQuestionIndex = 0;
  const currentQuestion = assessment.questions[currentQuestionIndex];

  return (
    <div className="assessment-page">
      <div className="assessment-header">
        <h1>{assessment.title}</h1>
        <ProgressBar
          current={currentQuestionIndex + 1}
          total={assessment.questions.length}
        />
      </div>

      <div className="assessment-content">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          onAnswer={(value) => console.log('Answer:', value)}
        />
      </div>

      <div className="assessment-navigation">
        <button
          className="btn btn-secondary"
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        <span className="question-counter">
          {currentQuestionIndex + 1} of {assessment.questions.length}
        </span>
        <button className="btn btn-primary">
          {currentQuestionIndex === assessment.questions.length - 1
            ? 'Submit'
            : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default AssessmentPage;
