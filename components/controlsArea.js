import React from 'react';
import ConditionalButton from './helpers/conditionalButton.js';
import ExerciseStatus from './data/exerciseStatus.js';
import { isRunningOnBigScreen } from './data/configurator';
import { FaHome, FaStop, FaYoutube, FaPlay, FaVideo, FaShareAlt, FaSave, FaEraser } from 'react-icons/fa';
import { FaRotate } from 'react-icons/fa6';
import { MdOutlineVideoCameraFront } from "react-icons/md"

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
                {<FaHome size={40} color="gold" />}
            </ConditionalButton>

            <ConditionalButton id="btnPlayYoutube"
                condition={exerciseStatus !== ExerciseStatus.ORIGIN}
                isDisabled={exerciseStatus === ExerciseStatus.RECORDING
                    || exerciseStatus === ExerciseStatus.PLAYING}
                className={`btn  btn-danger  ${btnCommonAttributes}`}
                hint={'View the original video on YouTube'}
                onClick={() => onStartPlayWrapper(ExerciseStatus.ORIGIN, 'Play YouTube')}
                antiOnClick={() => onStopPlay()}
                antiChildren={<FaStop size={30} color="gold" />}
                fontSize={btnFontSize}
            >
                {<FaYoutube size={45} color="gold" />}
            </ConditionalButton>

            <ConditionalButton id="btnPlayExercise"
                condition={exerciseStatus !== ExerciseStatus.PLAYING}
                isDisabled={exerciseStatus === ExerciseStatus.RECORDING
                    || exerciseStatus === ExerciseStatus.ORIGIN}
                className={`btn  btn-danger  ${btnCommonAttributes}`}
                hint={(recordedChunks?.length > 0) ? 'Play your recording' : 'Play exercise'}
                onClick={() => onStartPlayWrapper(ExerciseStatus.PLAYING, 'Play Exercise')}
                antiOnClick={() => onStopPlay()}
                antiChildren={<FaStop size={30} color="gold" />}
                fontSize={btnFontSize}
            >
                {<FaPlay size={35} color="gold" />}
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
                    className={`btn  btn-danger  ${btnCommonAttributes}`}
                    hint={'Start recording'}
                    onClick={() => onStartRecording()}
                    antiOnClick={() => onSaveRecording()}
                    antiChildren={<FaStop size={30} color="gold" />}
                    fontSize={btnFontSize}
                >
                    {<MdOutlineVideoCameraFront size={50} color="gold" />}
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
                    className={`btn  btn-danger  ${btnCommonAttributes}`}
                    hint={(recordedChunks?.length > 0) ? 'Share your homework' : 'Share your exercise'}
                    onClick={() => onShareExercise()}
                    fontSize={btnFontSize}
                >
                    {<FaShareAlt size={40} color="gold" />}
                </ConditionalButton>
            }
            {isRunningOnBigScreen &&
                <ConditionalButton id="btnSaveFile"
                    isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                    className={`btn  btn-danger  ${btnCommonAttributes}`}
                    anticlassName={`btn  btn-danger  ${btnCommonAttributes}`}
                    hint={(recordedChunks?.length > 0) ? 'Save your Recording to a local File' : 'Save your Exercise to a local File'}
                    onClick={() => onSaveExercise()}
                    fontSize={btnFontSize}
                >
                    {<FaSave size={40} color="gold" />}
                </ConditionalButton>
            }
            {isRunningOnBigScreen &&
                <ConditionalButton id="btnClearRecording"
                    isDisabled={!recordedChunks || recordedChunks.length === 0}
                    className={`btn  btn-danger  ${btnCommonAttributes}`}
                    anticlassName={`btn  btn-danger ${btnCommonAttributes}`}
                    hint="This will clear the recording and cannot be undone."
                    onClick={() => onClearRecording()}
                    fontSize={btnFontSize}
                >
                    {<FaEraser size={40} color="gold" />}
                </ConditionalButton>
            }
            <ConditionalButton id="btnRestoreDefaultExercise"
                isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                className={`btn  btn-danger  ${btnCommonAttributes}`}
                hint="This will restore the default exercise line marks."
                onClick={() => onRestoreDefaultExercise()}
                fontSize={btnFontSize}
            >
                {<FaRotate size={40} color="gold" />}
            </ConditionalButton>
        </div>
    );
};

export default ControlsArea;