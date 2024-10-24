import React, { useState, useEffect } from 'react';
import { getCultureLanguageName } from './data/configurator';

const FlashcardExam = ({ cards, onAnswer }) => {
    const [shuffledCards, setShuffledCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Shuffle cards on component mount
    useEffect(() => {
        if (cards?.length > 0) {
            const shuffled = [...cards]
                .map(card => ({
                    ...card,
                    inverted: Math.random() < 0.5
                }))
                .sort(() => Math.random() - 0.5);
            setShuffledCards(shuffled);
        }
    }, [cards]);

    if (shuffledCards.length === 0) {
        return <div className="text-center mt-4">Loading...</div>;
    }

    const currentCard = shuffledCards[currentCardIndex];

    const handleAnswer = (isCorrect) => {
        onAnswer(currentCard.cardId, currentCard.inverted, isCorrect);

        // Move to next card or finish
        if (currentCardIndex < shuffledCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // Exam completed
            setCurrentCardIndex(0);
            setIsFlipped(false);
            // You might want to add some completion logic here
        }
    };

    const openYouTube = () => {
        const timeParam = currentCard.seconds ? `&t=${currentCard.seconds}s` : '';
        window.open(`https://www.youtube.com/watch?v=${currentCard.videoId}${timeParam}`, '_blank');
    };

    const openYouglish = () => {
        const text = currentCard.front;
        window.open(`https://youglish.com/pronounce/${encodeURIComponent(text)}/${getCultureLanguageName(currentCard.language)}`, '_blank');
    };

    const questionText = currentCard.inverted ? currentCard.back : currentCard.front;
    const answerText = currentCard.inverted ? currentCard.front : currentCard.back;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>Card {currentCardIndex + 1} of {shuffledCards.length}</span>
                            <div>
                                <button
                                    className="btn btn-link btn-sm me-2"
                                    onClick={openYouTube}
                                    disabled={!currentCard.videoId}
                                >
                                    YouTube
                                </button>
                                <button
                                    className="btn btn-link btn-sm"
                                    onClick={openYouglish}
                                >
                                    Youglish
                                </button>
                            </div>
                        </div>

                        <div
                            className={`card-body ${isFlipped ? 'bg-success' : 'bg-info'}`}
                            style={{ minHeight: '200px', color: 'white' }}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="text-center">
                                {!isFlipped ? (
                                    <div>
                                        <h4>Question</h4>
                                        <p className="lead">{questionText}</p>
                                        <p className="text-muted">(Click to reveal answer)</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h4>Answer</h4>
                                        <p className="lead">{answerText}</p>
                                        <div className="mt-4">
                                            <button
                                                className="btn btn-success me-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAnswer(true);
                                                }}
                                            >
                                                Correct
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAnswer(false);
                                                }}
                                            >
                                                Incorrect
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardExam;