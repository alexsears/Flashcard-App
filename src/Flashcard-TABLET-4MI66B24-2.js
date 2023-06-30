import React from 'react';


function Flashcard({ flashcard }) {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
      {isFlipped ? <h3 className="flashcard-answer">{flashcard.answer}</h3> : <h3 className="flashcard-question">{flashcard.question}</h3>}
    </div>
  );
}



export default Flashcard;
