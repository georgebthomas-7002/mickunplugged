import type { Question } from '@/types';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer?: string | string[];
  onAnswer: (value: string | string[]) => void;
}

function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  onAnswer,
}: QuestionCardProps) {
  const handleSingleChoice = (value: string) => {
    onAnswer(value);
  };

  const handleMultipleChoice = (value: string) => {
    const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter((v) => v !== value)
      : [...currentAnswers, value];
    onAnswer(newAnswers);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAnswer(e.target.value);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'single-choice':
        return (
          <div className="options-list">
            {question.options?.map((option) => (
              <label key={option.id} className="option-item">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={selectedAnswer === option.value}
                  onChange={() => handleSingleChoice(option.value)}
                />
                <span className="option-text">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="options-list">
            {question.options?.map((option) => (
              <label key={option.id} className="option-item">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={
                    Array.isArray(selectedAnswer) &&
                    selectedAnswer.includes(option.value)
                  }
                  onChange={() => handleMultipleChoice(option.value)}
                />
                <span className="option-text">{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            className="text-answer"
            placeholder="Type your answer here..."
            value={(selectedAnswer as string) || ''}
            onChange={handleTextChange}
            rows={4}
          />
        );

      case 'boolean':
        return (
          <div className="options-list boolean-options">
            <label className="option-item">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={selectedAnswer === 'true'}
                onChange={() => handleSingleChoice('true')}
              />
              <span className="option-text">Yes</span>
            </label>
            <label className="option-item">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={selectedAnswer === 'false'}
                onChange={() => handleSingleChoice('false')}
              />
              <span className="option-text">No</span>
            </label>
          </div>
        );

      case 'rating':
        return (
          <div className="rating-options">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={`rating-btn ${selectedAnswer === String(rating) ? 'selected' : ''}`}
                onClick={() => handleSingleChoice(String(rating))}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">Question {questionNumber}</span>
        {question.required && <span className="required-badge">Required</span>}
      </div>
      <h3 className="question-text">{question.text}</h3>
      <div className="question-content">{renderQuestionContent()}</div>
    </div>
  );
}

export default QuestionCard;
