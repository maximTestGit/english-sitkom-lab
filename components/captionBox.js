import React, { useState, useRef } from 'react';
import { decodeHtml } from './helpers/presentationUtils.js';
import { PiTranslate } from "react-icons/pi";
import { AiOutlineSound } from "react-icons/ai";
import { RiInformation2Line } from "react-icons/ri";
import { getTranslation } from './helpers/fetchData';
import { extractCulture, getLearningLanguageName, getLanguageName } from './data/configurator';
import {
    assistanceTextAnalyzeRequest,
    assistanceExerciseRequest,
    assistanceReadRequest,
} from './helpers/assistanceHelper';
import ReactMarkdown from 'react-markdown';
import { Trans, t } from '@lingui/macro';
import { GoTasklist } from "react-icons/go";

const CaptionBox = (
    {
        user,
        caption,
        learningLanguage,
        uiLanguage,
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

    const handleButtonClick = async (action) => {
        try {
            document.body.style.cursor = 'wait';
            setIsButtonDisabled(true);
            await action();
            setIsButtonDisabled(false);
        } finally {
            document.body.style.cursor = 'default';
        }
    };


    const getTextToProcess = () => {
        let textToProcess = null;
        if (caption) {
            textToProcess = window.getSelection()?.toString();
            if (!textToProcess || textToProcess.length === 0) {
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

    const onCaptionTranslate = async () => {
        const textToTranslate = getTextToProcess();
        if (!textToTranslate || textToTranslate.length === 0) {
            showModal(t`Warning!`, t`No text to translate`);
        } else {
            const fromLanguage = extractCulture(learningLanguage);
            const translatedText = await getTranslation(user, textToTranslate, fromLanguage, uiLanguage);
            showModal(t`Translation`, translatedText);
        }
    };

    const onCaptionRead = async () => {
        const textToReadAloud = getTextToProcess();
        if (!textToReadAloud || textToReadAloud.length === 0) {
            showModal(t`Warning!`, t`No text to read`);
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            let answer = await assistanceReadRequest(user, textToReadAloud, textLanguage, explainInLanguage);
            answer = answer.replace('```html', '');
            answer = answer.replace('```', '');

            const blob = new Blob([answer], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            showModalUrl(t`Pronouncation`, url, 20, 80);

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
            alert(`Speech synthesis is not supported in this browser.`);
        }
    }
    const onCaptionAnalyze = async () => {
        const textToAnalyze = getTextToProcess();
        if (!textToAnalyze || textToAnalyze.length === 0) {
            showModal(t`Warning!`, t`No text to analyze`);
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            let answer = await assistanceTextAnalyzeRequest(user, textToAnalyze, textLanguage, explainInLanguage);
            answer = answer.replace('```html', '');
            answer = answer.replace('```', '');
            // Save content to exercise.html file
            const blob = new Blob([answer], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            showModalUrl(t`Analizys`, url, 20, 80);
        };
    };

    const onCaptionExercise = async () => {
        const textToExercise = getTextToProcess();
        if (!textToExercise || textToExercise.length === 0) {
            showModal(t`Warning!`, t`No text to work out`);
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            let answer = await assistanceExerciseRequest(user, textToExercise, textLanguage, explainInLanguage);
            answer = answer.replace('```html', '');
            answer = answer.replace('```', '');
            // Save content to exercise.html file
            const blob = new Blob([answer], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            showModalUrl(t`Exercise`, url, 20, 80);
        };
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setModalUrl('');
        setModalMessage('');
    };

    return (
        <>
            <table className={`table table-bordered text-center mt-1 ${caption?.checked ? "table-warning" : ""}`} style={{ height: '80px' }}>
                <tbody>
                    <tr>
                        <td className="fw-bold fs-6">
                            {caption && decodeHtml(caption?.text)}
                        </td>
                        <td id="tdCaptionActions" style={{ width: '50px', height: '50px', border: 'none', backgroundColor: 'white' }}>
                            <button className="mb-1" onClick={() => handleButtonClick(onCaptionTranslate)} title="Translate current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <PiTranslate style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => handleButtonClick(onCaptionRead)} title="Read current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <AiOutlineSound style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => handleButtonClick(onCaptionAnalyze)} title="Analyze current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <RiInformation2Line style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => handleButtonClick(onCaptionExercise)} title="Exercise for current caption"
                                disabled={!caption || !user || isButtonDisabled}>
                                <GoTasklist style={{ width: '100%', height: '100%' }} />
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

