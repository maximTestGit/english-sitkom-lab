import React, { useState, useEffect } from 'react';
import { getCultureLanguageName } from './data/configurator';
import { t, Trans } from '@lingui/macro';
import { getCardYoutubeClipLink, getCardYouglishLink} from './helpers/flashcardHelper';


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
        let result = [...cardList]
            .map(card => ({
                ...card,
                inverted: Math.random() < 0.5
            }))
        result = [...result]
            .map(card => ({
                ...card,
                inverted: isAlreadyCorrect(card) ? !card.inverted : card.inverted
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
    }
    function removeCorrectCards(cardList) {
        const result = cardList.filter(card => {
            const isInvertedCorrect = isAlreadyCorrect({ cardId: card.cardId, inverted: true });
            const isNotInvertedCorrect = isAlreadyCorrect({ cardId: card.cardId, inverted: false });
            const iKnowIt = isInvertedCorrect && isNotInvertedCorrect;
            if (iKnowIt) {
                onIKnowIt(card.cardId, true);
            }
            return !iKnowIt;
        });
        return result;
    }
    useEffect(() => {
        setIsReady(shuffledCards?.length > 0);
    }, [shuffledCards]);

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
        return <div className="text-center mt-4">{t`No more cards...`}</div>;
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
        const url = getCardYoutubeClipLink(currentCard);//`https://www.youtube.com/embed/${videoId}?start=${startInt}&end=${endInt}&autoplay=1`;//`https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
        window.open(url, '_blank');
    };

    const openYouglish = () => {
        const url = getCardYouglishLink(currentCard);
        window.open(url, '_blank');
    };

    const questionText = currentCard.inverted ? currentCard.back : currentCard.front;
    const answerText = currentCard.inverted ? currentCard.front : currentCard.back;

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <span>{t`Card ${currentCardIndex + 1} of ${shuffledCards.length}`}</span>
                            <div>
                                <button
                                    className="btn btn-link btn-sm me-2"
                                    onClick={openYouTube}
                                    disabled={!currentCard.videoId}
                                >
                                    {t`YouTube`}
                                </button>
                                <button
                                    className="btn btn-link btn-sm"
                                    onClick={openYouglish}
                                >
                                    {t`Youglish`}
                                </button>
                            </div>
                        </div>

                        <div
                            className={`card-body ${isFlipped ? 'bg-info-subtle' : 'bg-light'}`}
                            style={{ minHeight: '200px', color: 'black' }}
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className="text-center">
                                {!isFlipped ? (
                                    <div>
                                        <h6>{t`Question`}</h6>
                                        <p className="lead">{questionText}</p>
                                        <p className="text-muted">{t`(Click to reveal answer)`}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h6>{t`Answer`}</h6>
                                        <p className="lead">{answerText}</p>
                                        <div className="mt-4">
                                            <button
                                                className="btn btn-success me-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAnswer(true);
                                                }}
                                            >
                                                {t`Correct`}
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAnswer(false);
                                                }}
                                            >
                                                {t`Incorrect`}
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
