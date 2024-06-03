import React from 'react';
import ConditionalButton from './helpers/conditionalButton.js';
import ExerciseStatus from './data/exerciseStatus.js';
import { getYoutubeUrl, isRunningOnBigScreen } from './data/configurator';

const ControlsArea = ({ exerciseStatus, 
    onExit, startPlay, stopPlay, saveRecording,
    recordedChunks, handleStartRecording,
    videoData, captions, isClipMode=false,
    sourcePlaybackRate, youLinePlaybackRate,
    handleShareExerciseWrapper, handleSaveExercise, handleClearRecording, handleRestoreDefaultExercise }
) => {
    const btnCommonAttributes = 'border border-dark rounded col-3 col-md-1';
    const btnFontSize=isRunningOnBigScreen ? '0.7em' : '1em';
    
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
                onClick={() => startPlay(true, 'Play YouTube')}
                antiOnClick={() => stopPlay()}
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
                onClick={() => startPlay(false, 'Play Exercise')}
                antiOnClick={() => stopPlay()}
                antiChildren={'Stop'}
                fontSize={btnFontSize}
            >
                {(recordedChunks?.length > 0) ? 'Play Record' : 'Play Exercise'}
            </ConditionalButton>

            {isRunningOnBigScreen && 
                <ConditionalButton id="btnStartRecording"
                    condition={exerciseStatus !== ExerciseStatus.RECORDING}
                    isDisabled={exerciseStatus === ExerciseStatus.PLAYING
                        ||
                        exerciseStatus === ExerciseStatus.ORIGIN
                        ||
                        isClipMode}
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    hint={'Start recording'}
                    onClick={() => handleStartRecording()}
                    antiOnClick={() => saveRecording()}
                    antiChildren={'Stop'}
                    fontSize={btnFontSize}
                    >
                        {'Start Record'}
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
                        recordedChunks.length==0}
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    hint={(recordedChunks?.length > 0) ? 'Share your homework' : 'Share your exercise'}
                    onClick={() => handleShareExerciseWrapper(videoData, captions, recordedChunks, sourcePlaybackRate, youLinePlaybackRate)}
                    fontSize={btnFontSize}
                    >
                    {(recordedChunks?.length > 0) ? 'Share Record' : 'Share Exercise'}
                </ConditionalButton>
            }
            {isRunningOnBigScreen && 
                <ConditionalButton id="btnSaveFile"
                    isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                    className={`btn  btn-success  ${btnCommonAttributes}`}
                    anticlassName={`btn  btn-success  ${btnCommonAttributes}`}
                    hint={(recordedChunks?.length > 0) ? 'Save your Recording to a local File' : 'Save your Exercise to a local File'}
                    onClick={() => handleSaveExercise(videoData, captions, recordedChunks, sourcePlaybackRate, youLinePlaybackRate)}
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
                    onClick={() => handleClearRecording()}
                    fontSize={btnFontSize}
                    >
                    {'Clear Record'}
                </ConditionalButton>
            }
            <ConditionalButton id="btnRestoreDefaultExercise"
                isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                className={`btn  btn-success  ${btnCommonAttributes}`}
                hint="This will restore the default exercise line marks."
                onClick={() => handleRestoreDefaultExercise()}
                fontSize={btnFontSize}
            >
                {'Restore Default'}
            </ConditionalButton>
        </div>
    );
};

export default ControlsArea;