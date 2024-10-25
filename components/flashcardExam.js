import React, { useState, useEffect } from 'react';
import { getCultureLanguageName } from './data/configurator';

const FlashcardExam = ({ cards, onIKnowIt }) => {
    const [shuffledCards, setShuffledCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [isReady, setIsReady] = useState(false);


    function isAlreadyCorrect(card) {
        return correctAnswers.some(answer => answer.cardId === card.cardId && answer.inverted === card.inverted);
    }
    function resetCardsInverted(cardList) {
        const result = [...cardList]
            .map(card => ({
                ...card,
                inverted: Math.random() < 0.5
            }))
        return result;
    }
    function shuffleCards(cards) {
        return [...cards]
            .sort(() => Math.random() - 0.5);
    }

    function resetCards(cardList) {
        const cardsForExam = removeCorrectCards(cardList);
        const shuffled = shuffleCards(cardsForExam);
        const shuffledAndInverted = resetCardsInverted(shuffled);
        setShuffledCards(shuffledAndInverted);
        setIsReady(true);
    }
    function removeCorrectCards(cardList) {
        const result = cardList.filter(card => {
            const isInvertedCorrect = isAlreadyCorrect({ cardId: card.cardId, inverted: true });
            const isNotInvertedCorrect = isAlreadyCorrect({ cardId: card.cardId, inverted: false });
            const iKnowIt = isInvertedCorrect && isNotInvertedCorrect;
            if (iKnowIt) {
                onIKnowIt(currentCard.cardId, true);
            }
            return !iKnowIt;
        });
        return result;
    }
    useEffect(() => {
        if (cards?.length > 0) {
            resetCards(cards);
        }
    }, [cards]);

    useEffect(() => {
        if (shuffledCards?.length > 0 && currentCardIndex === 0) {
            resetCards(shuffledCards);
        }
    }, [currentCardIndex]);

    if (shuffledCards.length === 0 || !isReady) {
        return <div className="text-center mt-4">No more cards...</div>;
    }

    const currentCard = shuffledCards[currentCardIndex];

    function getNextCardIndex() {
        let result = 0;
        if (currentCardIndex < shuffledCards.length - 1) {
            result = currentCardIndex + 1;
        }
        return result;
    }
    const handleAnswer = (isCorrect) => {
        if (isCorrect) {
            const alreadyCorrect = isAlreadyCorrect(currentCard);
            if (!alreadyCorrect) {
                setCorrectAnswers([...correctAnswers, { cardId: currentCard.cardId, inverted: currentCard.inverted }]);
            }
        }
        const nextCardIndex = getNextCardIndex();
        setCurrentCardIndex(nextCardIndex);
        setIsFlipped(false);
        setIsReady(currentCardIndex < shuffledCards.length - 1);
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


