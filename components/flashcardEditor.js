import React, { useEffect, useState } from 'react';
import { getCultureLanguageName } from './data/configurator';
import { t, Trans } from '@lingui/macro';

const FlashcardEditor = ({
    card,
    onSave,
    onDelete,
    showDetails
}) => {
    const [editedBack, setEditedBack] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const detailsBackground = 'lightgray';

    useEffect(() => {
        setEditedBack(card.back);
    }, [card]);

    const handleSave = () => {
        if (onSave && editedBack !== card.back) {
            card.back = editedBack;
            onSave(card);
        }
        setIsEditing(false);
    };

    const handleRestore = () => {
        setEditedBack(card.back);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setEditedBack(e.target.value);
        setIsEditing(true);
    };

    const handleFocus = () => {
        setIsEditing(true);
    };
    function handleDelete() {
        if (onDelete) {
            onDelete(card);
        }
    }
    function getCardVideoLink() {
        const videoId = card.videoId;
        const seconds = card.seconds || 0;
        const duration = card.duration || 5;
        const startInt = Math.round(seconds);
        const endInt = Math.round(seconds + duration);
        return `https://www.youtube.com/embed/${videoId}?start=${startInt}&end=${endInt}&autoplay=1`;//`https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
    }
    return (
        <div className="container mt-3" >
            <div className="row">
                <div className="col-12">
                    <div id='frontArea' className="row">
                        <h4 className="col-8">{t`Card`} [{card.front}]</h4>
                        <button id='deleteButton'
                            className="btn btn-danger col-2"
                            onClick={handleDelete}
                        >
                            {t`Delete`}
                        </button>
                    </div>
                    <div id='backArea' className="form-group">
                        <label htmlFor="backProperty" className="form-label"><strong>{t`Translation:`}</strong></label>
                        <input
                            type="text"
                            id="backProperty"
                            className="form-control"
                            value={editedBack}
                            onChange={handleChange}
                            onFocus={handleFocus}
                        // Apply background color
                        />
                    </div>

                    <div id="saveRestoreButtonsDiv" className="mt-3">
                        <button
                            className="btn btn-secondary me-2"
                            onClick={handleRestore}
                            disabled={!isEditing}
                        >
                            {t`Restore`}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!isEditing}
                        >
                            {t`Save`}
                        </button>
                    </div>

                    {
                        card.videoId &&
                        <div id='linkArea' className="row">
                            <a href={getCardVideoLink()} target="_blank" rel="noopener noreferrer">
                                {t`YouTube`}
                            </a>
                        </div>
                    }

                    {showDetails &&
                        <div className="container mt-3" style={{ fontSize: '0.9em' }}>
                            <div>
                                <h6>{t`Card Details:`}</h6>
                            </div>
                            <ul id="uiCardDetails" className="list-group">
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Collection:`}</strong> {card.collection}</li>
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Origin Language:`}</strong> {getCultureLanguageName(card.frontLanguage)}</li>
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Translation Language:`}</strong> {getCultureLanguageName(card.backLanguage)}</li>
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Box:`}</strong> {card.box}</li>
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Created:`}</strong> {card.created}</li>
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Last Reviewed:`}</strong> {card.lastReviewed}</li>
                                <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>{t`Next Review:`}</strong> {card.nextReview}</li>
                                {/* <li className="list-group-item" style={{ backgroundColor: background }}><strong>Front:</strong> {card.front}</li> */}
                            </ul>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default FlashcardEditor;