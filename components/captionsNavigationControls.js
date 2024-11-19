// Define the CaptionAction enum
export const CaptionAction = Object.freeze({
    GO_FIRST: 'GO_FIRST',
    GO_PREV: 'GO_PREV',
    PLAY_CURRENT: 'PLAY_CURRENT',
    GO_NEXT: 'GO_NEXT',
    GO_LAST: 'GO_LAST',
    SEARCH: 'SEARCH',
    STOP_PLAY_CURRENT: 'STOP_PLAY_CURRENT',
});

// Import necessary React and icon components
import React from 'react';
import { FaStop, FaStepBackward, FaBackward, FaPlay, FaForward, FaStepForward, FaSearch } from './helpers/iconHelper';
import ExerciseStatus from './data/exerciseStatus';

// Define the CaptionsNavigationControls component
export const CaptionsNavigationControls = ({ currentCaption = null, onCaptionAction, isActive, exerciseStatus }) => {
    return (
        <div className="captions-navigation-controls"
            style={{ background: '#f0f0f0', padding: '1px', display: 'flex', justifyContent: 'space-between' }}
        >
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_FIRST)} title="Go to the First Caption" disabled={!isActive}>
                <FaStepBackward />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_PREV)} title="Go to the Previous Caption" disabled={!isActive}>
                <FaBackward />
            </button>
            {exerciseStatus !== ExerciseStatus.CAPTION &&
                <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.PLAY_CURRENT)} title="Play the Current Caption"
                    disabled={!isActive || !currentCaption}>
                    <FaPlay />
                </button>
            }
            {exerciseStatus === ExerciseStatus.CAPTION &&
                <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.STOP_PLAY_CURRENT)} title="Play the Current Caption">
                    <FaStop />
                </button>
            }
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_NEXT)} title="Go to the Next Caption" disabled={!isActive}>
                <FaForward />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.GO_LAST)} title="Go to the Last Caption" disabled={!isActive}>
                <FaStepForward />
            </button>
            <button style={{ flex: 1 }} onClick={() => onCaptionAction(CaptionAction.SEARCH)} title="Go To the Caption" disabled={!isActive}>
                <FaSearch />
            </button>
        </div>
    );
};