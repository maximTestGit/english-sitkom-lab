import React, { useState } from 'react';
import { decodeHtml } from './helpers/presentationUtils.js';
import { PiTranslate } from "react-icons/pi";
import { AiOutlineSound } from "react-icons/ai";
import { RiInformation2Line } from "react-icons/ri";
import { getTranslation } from './helpers/fetchData';
import { extractCulture, getLearningLanguageName, getLanguageName } from './data/configurator';
import { assistanceRequestFromCloud } from './helpers/assistanceHelper';
import ReactMarkdown from 'react-markdown';
import { Trans, t } from '@lingui/macro';

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
    const [toShowMarkdown, setToShowMarkdown] = useState(false);

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

    const showModal = (title, message, isMarkdown = false, formRows = 5, formCols = 30) => {
        setFormTitle(title);
        setModalMessage(message);
        setFormRows(formRows);
        setFormCols(formCols);
        setToShowMarkdown(isMarkdown);
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

    const onCaptionRead = () => {
        const textToReadAloud = getTextToProcess();
        if (!textToReadAloud || textToReadAloud.length === 0) {
            showModal(t`Warning!`, t`No text to read`);
        } else {
            const readLanguage = learningLanguage;
            const utterance = new SpeechSynthesisUtterance(textToReadAloud);
            utterance.lang = readLanguage;
            window.speechSynthesis.speak(utterance);
        }
    };

    const onCaptionAnalyze = async () => {
        const textToAnalyze = getTextToProcess();
        if (!textToAnalyze || textToAnalyze.length === 0) {
            showModal(t`Warning!`, t`No text to analyze`);
        } else {
            const textLanguage = getLanguageName(learningLanguage);
            const explainInLanguage = getLanguageName(user?.language);
            const answer = await assistanceRequestFromCloud(user, textToAnalyze, textLanguage, explainInLanguage);
            showModal(t`Text Analysis`, answer, true, 20, 80);
        };
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <table className={`table table-bordered text-center mt-1 ${caption?.checked ? "table-warning" : ""}`} style={{ height: '80px' }}>
                <tbody>
                    <tr>
                        <td className="fw-bold fs-6">
                            {caption && decodeHtml(caption?.text)}
                        </td>
                        <td style={{ width: '50px', height: '50px', border: 'none', backgroundColor: 'white' }}>
                            <button className="mb-1" onClick={() => onCaptionTranslate()} title="Translate current caption"
                                disabled={!caption || !user}>
                                <PiTranslate style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => onCaptionRead()} title="Read current caption"
                                disabled={!caption || !user}>
                                <AiOutlineSound style={{ width: '100%', height: '100%' }} />
                            </button>
                            <button className="mb-1" onClick={() => onCaptionAnalyze()} title="Analyze current caption"
                                disabled={!caption || !user}>
                                <RiInformation2Line style={{ width: '100%', height: '100%' }} />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            {isModalVisible && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{formTitle || 'Message'}</h5>
                                <button type="button" className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body">
                                {toShowMarkdown ? (
                                    <div id="assistanceAnswerViewer" className="form-control" style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
                                        <ReactMarkdown>{modalMessage}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p>{modalMessage}</p>
                                )}
                            </div>
                            <div className="modal-footer">
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