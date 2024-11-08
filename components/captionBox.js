import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { decodeHtml } from './helpers/presentationUtils.js';
import { PiTranslate } from "react-icons/pi";
import { AiOutlineSound } from "react-icons/ai";
import { RiInformation2Line } from "react-icons/ri";
import {
    getTranslation,
    saveTextToFlashcards,
} from './helpers/fetchData';
import {
    extractCulture,
    getLearningLanguageName,
    getLanguageName
} from './data/configurator';
import {
    assistanceTextAnalyzeRequest,
    assistanceExerciseRequest,
    assistanceReadRequest
} from './helpers/assistanceHelper';
//import ReactMarkdown from 'react-markdown';
import { Trans, t } from '@lingui/macro';
import { GoTasklist } from "react-icons/go";
import { PiCardsThree } from "react-icons/pi";
import { createHtmlString } from './helpers/htmlHelper';

const CaptionBox = (
    {
        user,
        caption,
        learningLanguage,
        uiLanguage,
        videoData,
        onWaitForAction
        }) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formRows, setFormRows] = useState(10);
    const [formCols, setFormCols] = useState(30);
    const [modalMessage, setModalMessage] = useState('');
    const [modalUrl, setModalUrl] = useState('');
    //const [toShowMarkdown, setToShowMarkdown] = useState(false);
    //const iframeRef = useRef(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handleCaptionButtonClick = async (action) => {
        try {
            onWaitForAction(true)
            setIsButtonDisabled(true);
            await action();
            setIsButtonDisabled(false);
        } finally {
            onWaitForAction(false);
        }
    };


    const getTextToProcess = (selectionOnly = false) => {
        let textToProcess = null;
        if (caption) {
            textToProcess = window.getSelection()?.toString();
            if (!selectionOnly && (!textToProcess || textToProcess.length === 0)) {
                textToProcess = caption.text;
            }
        }
        if (textToProcess) {
            textToProcess = decodeHtml(textToProcess.trim());
        }
        return textToProcess;
    };

    const showModal = (title, message, formRows = 5, formCols = 30) => {
        setFormTitle(title);
        setModalMessage(message);
        setFormRows(formRows);
        setFormCols(formCols);
        //setToShowMarkdown(isMarkdown);
        setIsModalVisible(true);
    };
    const showModalUrl = (title, url, formRows = 5, formCols = 30) => {
        setFormTitle(title);
        setModalUrl(url);
        setFormRows(formRows);
        setFormCols(formCols);
        //setToShowMarkdown(false);
        setIsModalVisible(true);
    };

    const handleCaptionTranslate = async () => {
        const textToTranslate = getTextToProcess();
        if (!textToTranslate || textToTranslate.length === 0) {
            Swal.fire({
                title: t`Warning!`,
                text: t`No text to translate`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            const fromLanguage = extractCulture(learningLanguage);
            const translatedText = await getTranslation(user, textToTranslate, fromLanguage, uiLanguage);
            showModal(t`Translation`, translatedText);
        }
    };

    const handleCaptionRead = async () => {
        const textToReadAloud = getTextToProcess();
        if (!textToReadAloud || textToReadAloud.length === 0) {
            Swal.fire({
                title: t`Warning!`,
                text: t`No text to process`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            let answer = await assistanceReadRequest(user, textToReadAloud, textLanguage, explainInLanguage);
            answer = answer.replace('```html', '');
            answer = answer.replace('```', '');

            const blob = new Blob([answer], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            showModalUrl(t`Pronunciation`, url, 20, 80);

            pronounceText(learningLanguage, textToReadAloud);
        }
    };

    function pronounceText(readLanguage, textToReadAloud) {
        if ('speechSynthesis' in window) {
            console.log(`Reading aloud START: ${textToReadAloud} in ${readLanguage}`);
            const utterance = new SpeechSynthesisUtterance(textToReadAloud);
            utterance.lang = readLanguage;
            utterance.volume = 1; // Set volume (0.0 to 1.0)
            window.speechSynthesis.speak(utterance);
            console.log(`Reading aloud FINISH: ${textToReadAloud} in ${readLanguage}`);
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Speech synthesis is not supported in this browser.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
    const handleCaptionAnalyze = async () => {
        const textToAnalyze = getTextToProcess();
        if (!textToAnalyze || textToAnalyze.length === 0) {
            Swal.fire({
                title: t`Warning!`,
                text: t`No text to analyze`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            let answer = await assistanceTextAnalyzeRequest(user, textToAnalyze, textLanguage, explainInLanguage);
            answer = answer.replace('```html', '');
            answer = answer.replace('```', '');
            // Save content to exercise.html file
            const blob = new Blob([answer], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            showModalUrl(t`Analysis`, url, 20, 80);
        };
    };

    const handleCaptionExercise = async () => {
        const textToExercise = getTextToProcess();
        if (!textToExercise || textToExercise.length === 0) {
            Swal.fire({
                title: t`Warning!`,
                text: t`Select text to process`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            //title, task, text, option0, option1, option2, option3, correctInd, correctMsg, incorrectMsg, checkBtn
            /*let answer = await assistanceExerciseRequest(user, textToExercise, textLanguage, explainInLanguage);
            answer = answer.replace('```html', '');
            answer = answer.replace('```', '');
            // Save content to exercise.html file
            const blob = new Blob([answer], { type: 'text/html' });*/

            let exerciseDataJson = await assistanceExerciseRequest(user, textToExercise, textLanguage, explainInLanguage);
            exerciseDataJson = exerciseDataJson.replace('```json', '');
            exerciseDataJson = exerciseDataJson.replace('```', '');
            const exerciseData = JSON.parse(exerciseDataJson);
            const exerciseHtml = createHtmlString(exerciseData);
            const blob = new Blob([exerciseHtml], { type: 'text/html' });

            const url = URL.createObjectURL(blob);

            showModalUrl(t`AI-Generated Interactive Exercise (Experimental)`, url, 20, 80);
        };
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setModalUrl('');
        setModalMessage('');
    };

    const handleSelectedButtonClick = async (action) => {
        try {
            onWaitForAction(true);
            setIsButtonDisabled(true);
            let textToProcess = getTextToProcess(true);
            if (!textToProcess) {
                Swal.fire({
                    title: t`Warning!`,
                    text: t`Select text to process`,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            } else {
                await action(textToProcess);
            }
            setIsButtonDisabled(false);
        } finally {
            onWaitForAction(false);
        }
    }
    const onAddSelectionToDict = async (textToProcess) => {
        const frontLanguage = extractCulture(learningLanguage);
        await saveTextToFlashcards(user, textToProcess, frontLanguage, uiLanguage, videoData.videoId, parseFloat(caption.start));
        Swal.fire({
            title: t`Success`,
            text: t`Entry "${textToProcess}" is added to your flashcard collection`,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }

    return (
        <>
            <table className={`table table-bordered text-center mt-1 ${caption?.checked ? "table-warning" : ""}`} style={{ height: '80px' }}>
                <tbody>
                    <tr>
                        <td id="tdCaptionAddintionalActions" style={{ width: '50px', height: '50px', border: 'none', backgroundColor: 'white' }}>
                            <button className="mb-1" onClick={() => handleSelectedButtonClick(onAddSelectionToDict)} title="Add selected text to flashcard colection"
                                disabled={!caption || !user || isButtonDisabled}>
                                <PiCardsThree style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => handleCaptionButtonClick(handleCaptionExercise)} title="Exercise for current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <GoTasklist style={{ width: '100%', height: '100%' }} />
                            </button>
                        </td>
                        <td className="fw-bold fs-6">
                            {caption && decodeHtml(caption?.text)}
                        </td>
                        <td id="tdCaptionActions" style={{ width: '50px', height: '50px', border: 'none', backgroundColor: 'white' }}>
                            <button className="mb-1" onClick={() => handleCaptionButtonClick(handleCaptionTranslate)} title="Translate current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <PiTranslate style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => handleCaptionButtonClick(handleCaptionRead)} title="Read current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <AiOutlineSound style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => handleCaptionButtonClick(handleCaptionAnalyze)} title="Analyze current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <RiInformation2Line style={{ width: '100%', height: '100%' }} />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            {isModalVisible && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-fullscreen">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{formTitle || 'Message'}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {modalUrl ? (
                                    <iframe src={modalUrl} style={{ width: '100%', height: '100%', border: 'none' }}></iframe>
                                ) : (
                                    <p>{modalMessage}</p>)
                                }
                            </div>
                            <div className="modal-footer justify-content-center">
                                <button type="button" className="btn btn-primary" onClick={closeModal}>OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CaptionBox;

