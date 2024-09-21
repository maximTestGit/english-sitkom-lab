// Define the CaptionAction enum
export const CaptionAction = Object.freeze({
    GO_FIRST: 'GO_FIRST',
    GO_PREV: 'GO_PREV',
    PLAY_CURRENT: 'PLAY_CURRENT',
    GO_NEXT: 'GO_NEXT',
    GO_LAST: 'GO_LAST'
});

// Import necessary React and icon components
import React from 'react';
import { FaStepBackward, FaBackward, FaPlay, FaForward, FaStepForward } from 'react-icons/fa';

// Define the CaptionsNavigationControls component
export const CaptionsNavigationControls = ({ onCaptionAction }) => {
    return (
        <div className="captions-navigation-controls" style={{ background: '#f0f0f0', padding: '1px', display: 'flex', justifyContent: 'space-between' }}>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_FIRST)} title="Go to the First Caption">
                <FaStepBackward />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_PREV)} title="Go to the Previous Caption">
                <FaBackward />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.PLAY_CURRENT)} title="Play the Current Caption" disabled>
                <FaPlay />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_NEXT)} title="Go to the Next Caption">
                <FaForward />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_LAST)} title="Go to the Last Caption">
                <FaStepForward />
            </button>
        </div>
    );
};

