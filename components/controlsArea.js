import React from 'react';
import ConditionalButton from './helpers/conditionalButton.js';
import ExerciseStatus from './data/exerciseStatus.js';
import { isRunningOnBigScreen } from './data/configurator';

function ControlsArea({
    exerciseStatus,
    isClipMode,
    recordedChunks,
    isCameraAllowed,
    onStartPlay,
    onStopPlay,
    onExit,
    onSaveRecording,
    onStartRecording,
    onShareExercise,
    onSaveExercise,
    onClearRecording,
    onRestoreDefaultExercise,
}) {
    const btnCommonAttributes = 'border border-dark rounded col-3 col-md-1';
    const btnFontSize = isRunningOnBigScreen ? '0.7em' : '1em';

    const onStartPlayWrapper = (status, caller) => {
        onStartPlay(status, caller);
    }
    return (
        <div id="ControlsArea" className="row mb-3 col-12 col-md-12 col-lg-10">
            <ConditionalButton id="btnExit"
                condition={exerciseStatus === ExerciseStatus.ORIGIN}
                className={`btn btn-danger border ${btnCommonAttributes}`}
                hint='Return to the Playlist view'
                onClick={() => onExit()}
                fontSize={btnFontSize}
            >
                {'Back to Playlists'}
            </ConditionalButton>

            <ConditionalButton id="btnPlayYoutube"
                condition={exerciseStatus !== ExerciseStatus.ORIGIN}
                isDisabled={exerciseStatus === ExerciseStatus.RECORDING
                    || exerciseStatus === ExerciseStatus.PLAYING}
                className={`btn  btn-success  ${btnCommonAttributes}`}
                hint={'View the original video on YouTube'}
                onClick={() => onStartPlayWrapper(ExerciseStatus.ORIGIN, 'Play YouTube')}
                antiOnClick={() => onStopPlay()}
                antiChildren={'Stop'}
                fontSize={btnFontSize}
            >
                {'Play YouTube'}
            </ConditionalButton>

            <ConditionalButton id="btnPlayExercise"
                condition={exerciseStatus !== ExerciseStatus.PLAYING}
                isDisabled={exerciseStatus === ExerciseStatus.RECORDING
                    || exerciseStatus === ExerciseStatus.ORIGIN}
                className={`btn  btn-success  ${btnCommonAttributes}`}
                hint={(recordedChunks?.length > 0) ? 'Play your recording' : 'Play exercise'}
                onClick={() => onStartPlayWrapper(ExerciseStatus.PLAYING, 'Play Exercise')}
                antiOnClick={() => onStopPlay()}
                antiChildren={'Stop'}
                fontSize={btnFontSize}
            >
                {(recordedChunks?.length > 0) ? 'Play Homework Record' : 'Play Exercise'}
            </ConditionalButton>

            {isRunningOnBigScreen &&
                <ConditionalButton id="btnStartRecording"
                    condition={exerciseStatus !== ExerciseStatus.RECORDING}
                    isDisabled={exerciseStatus === ExerciseStatus.PLAYING
                        ||
                        exerciseStatus === ExerciseStatus.ORIGIN
                        ||
                        isClipMode
                        ||
                        !isCameraAllowed
                    }
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    hint={'Start recording'}
                    onClick={() => onStartRecording()}
                    antiOnClick={() => onSaveRecording()}
                    antiChildren={'Stop'}
                    fontSize={btnFontSize}
                >
                    {'Start Record Homework'}
                </ConditionalButton>
            }
            {isRunningOnBigScreen &&
                <ConditionalButton id="btnShareExercise"
                    condition={true}
                    dataToggle="modal" dataTarget="#emailModal"
                    isDisabled={exerciseStatus !== ExerciseStatus.STOPPED
                        ||
                        isClipMode
                        ||
                        !recordedChunks
                        ||
                        recordedChunks.length == 0}
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    hint={(recordedChunks?.length > 0) ? 'Share your homework' : 'Share your exercise'}
                    onClick={() => onShareExercise()}
                    fontSize={btnFontSize}
                >
                    {'Share Homework'}
                </ConditionalButton>
            }
            {isRunningOnBigScreen &&
                <ConditionalButton id="btnSaveFile"
                    isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    anticlassName={`btn  btn-success  ${btnCommonAttributes}`}
                    hint={(recordedChunks?.length > 0) ? 'Save your Recording to a local File' : 'Save your Exercise to a local File'}
                    onClick={() => onSaveExercise()}
                    fontSize={btnFontSize}
                >
                    {'Save File'}
                </ConditionalButton>
            }
            {isRunningOnBigScreen &&
                <ConditionalButton id="btnClearRecording"
                    isDisabled={!recordedChunks || recordedChunks.length === 0}
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    anticlassName={`btn  btn-success ${btnCommonAttributes}`}
                    hint="This will clear the recording and cannot be undone."
                    onClick={() => onClearRecording()}
                    fontSize={btnFontSize}
                >
                    {'Clear Homework Record'}
                </ConditionalButton>
            }
            <ConditionalButton id="btnRestoreDefaultExercise"
                isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                className={`btn  btn-success  ${btnCommonAttributes}`}
                hint="This will restore the default exercise line marks."
                onClick={() => onRestoreDefaultExercise()}
                fontSize={btnFontSize}
            >
                {'Restore Default'}
            </ConditionalButton>
        </div>
    );
};

export default ControlsArea;