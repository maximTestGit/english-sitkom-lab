import React, { useEffect, useState } from 'react';
import { getCultureLanguageName } from './data/configurator';

const FlashcardEditor = ({ card, onSave, onDelete }) => {
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
    return (
        <div className="container mt-3" >
            <div className="row">
                <div className="col-12">
                    <div className="row">
                        <h4 className="col-8">Card "{card.front}"</h4>
                        <button
                            className="btn btn-danger col-2"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                    <div className="form-group">
                        <label htmlFor="backProperty" className="form-label"><strong>Translation:</strong></label>
                        <input
                            type="text"
                            id="backProperty"
                            className="form-control"
                            value={editedBack}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            style={{ backgroundColor: isEditing ? '#ffcccc' : 'white' }} // Apply background color
                        />
                    </div>

                    <div id="saveRestoreButtonsDiv" className="mt-3">
                        <button
                            className="btn btn-secondary me-2"
                            onClick={handleRestore}
                            disabled={!isEditing}
                        >
                            Restore
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={!isEditing}
                        >
                            Save
                        </button>
                    </div>

                    <div className="container mt-3" style={{ fontSize: '0.9em' }}>
                        <div>
                            <h6>Card Details:</h6>
                        </div>
                        <ul id="uiCardDetails" className="list-group">
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Collection:</strong> {card.collection}</li>
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Origin Language:</strong> {getCultureLanguageName(card.frontLanguage)}</li>
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Translation Language:</strong> {getCultureLanguageName(card.backLanguage)}</li>
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Box:</strong> {card.box}</li>
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Created:</strong> {card.created}</li>
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Last Reviewed:</strong> {card.lastReviewed}</li>
                            <li className="list-group-item" style={{ backgroundColor: detailsBackground }}><strong>Next Review:</strong> {card.nextReview}</li>
                            {/* <li className="list-group-item" style={{ backgroundColor: background }}><strong>Front:</strong> {card.front}</li> */}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlashcardEditor;