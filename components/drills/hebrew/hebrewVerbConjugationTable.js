import React, { useEffect } from 'react';
import { Trans, t } from '@lingui/macro';
import { AiOutlineSound } from '../../helpers/iconHelper';
import { pronounceText } from '../../helpers/miscUtils';

const HebrewVerbConjugationTable = ({
    tense,
    root,
    binyan,
    infinitive,
    conjugations,
    conjugationsExample,
    disabled,
}) => {
    const [showExample, setShowExample] = React.useState(false);
    const [showAnswer, setShowAnswer] = React.useState(false);
    const handleShowExampleClick = () => {
        setShowExample(!showExample);
    };
    const handleShowAnswerClick = () => {
        setShowAnswer(!showAnswer);
    };
    const handleVerbInput = (e) => {
        const inputVerb = e.target.value;
        if (inputVerb !== '') {
            const index = e.target.id.split('-')[1];
            const checkVerb = conjugations[index].verb;
            const checkVerbs = checkVerb.split(', ');
            if (checkVerbs.includes(inputVerb)) {
                e.target.style.backgroundColor = '';
            } else {
                e.target.style.backgroundColor = 'red';
            }
        } else {
            e.target.style.backgroundColor = '';
        }
        console.log(e.target.value);
    };
    const handleVoiceHint = (verb) => {
        const readLanguage = 'he-IL';
        pronounceText(readLanguage, verb, 0.3);
    }
    const renderTable = (tense, data, exampleData) => (
        <div className="col-md-4 mb-4 justify-content-center">
            <h4 className="text-center mb-3">{root}/{binyan}/{tense}</h4>
            <h3 className="text-center mb-3"><b><i>{infinitive}</i></b></h3>
            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th><Trans>Subject</Trans></th>
                        <th><input type="checkbox" value={showAnswer} onClick={handleShowAnswerClick} /><Trans>Verb</Trans></th>
                        <th><Trans>Hint</Trans></th>
                        <th><Trans>Voice Hint</Trans></th>
                        <th><input type="checkbox" value={showExample} onClick={handleShowExampleClick} /> <Trans>Example</Trans></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.subject}</td>
                            <td>
                                {showAnswer ? item.verb :
                                    <input
                                        id={`verbInput-${index}`}
                                        disabled={disabled}
                                        type='text'
                                        style={{ width: '100%', height: '100%', direction: 'rtl' }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleVerbInput(e);
                                                const nextInput = document.getElementById(`verbInput-${index + 1}`);
                                                if (nextInput) {
                                                    nextInput.focus();
                                                }
                                            }
                                        }}
                                        onBlur={handleVerbInput}
                                    />
                                }
                            </td>
                            <td className={disabled ? "" : "nikud-cell"} data-nikud={`${item.verb} (${item.nikud})`}><Trans>Hint</Trans></td>
                            <td>
                                <button
                                    className="mb-1"
                                    onClick={() => { handleVoiceHint(item.verb); }}
                                >
                                    <AiOutlineSound style={{ width: '100%', height: '100%' }} />
                                </button>
                            </td>
                            <td>{(!disabled && showExample) ? exampleData[index].verb : '?'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Add CSS to show nikud only on hover
    const styles = `
        .nikud-cell {
            position: relative;
        }
        .nikud-cell::after {
            content: attr(data-nikud);
            visibility: hidden;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            border: 1px solid black;
            z-index: 1;
            background-color: #f9f9f9;
        }
        .nikud-cell:hover::after {
            visibility: visible;
        }
    `;

    // Inject styles into the document
    if (typeof document !== 'undefined') {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    return (
        <div className="container mt-5 justify-content-center">
            <div className="row justify-content-center">
                {renderTable(tense, conjugations, conjugationsExample)}
            </div>
        </div>
    );
};

export default HebrewVerbConjugationTable;
