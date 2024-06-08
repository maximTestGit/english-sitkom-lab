import React, { useState, useRef, useEffect, useCallback } from 'react';
import CaptionsView from './captionsView';
import CaptionBox from './captionBox.js';
import PlaybackSettings from './playbackSettings.js';
import PlayerBox from './playerBox.js';
import ExerciseStatus from './data/exerciseStatus.js';
import { jumpToStart, handleSaveExercise, handleShareExercise } from './helpers/exerciseHelper.js';
import Modal from 'react-bootstrap/Modal';
import ControlsArea from './controlsArea.js';

const ExerciseView = ({ videoData, onExit }) => {
    const default_playback_rate = 1.0; // 1x speed
    const default_your_line_playback_rate = 1.0; // 1x speed

    const default_volume = 50.0; // 50% of the volume
    const default_your_line_volume = 1.0; // 1% of the volume
    const default_recording_your_line_volume = 0.0; // mute

    // #region States
    const [muted, setMuted] = useState(false);
    const [position, setPosition] = useState(0);
    const [currentCaption, setCurrentCaption] = useState(null);
    const [loop, setLoop] = useState(false);
    const [showCaptions, setShowCaptions] = useState(true);
    const [exerciseStatus, setExerciseStatus] = useState(ExerciseStatus.STOPPED);
    const [captions, setCaptions] = useState([]);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [clearRecordedChunks, setClearRecordedChunks] = useState(false);

    const [sourcePlaybackRate, setSourcePlaybackRate] = useState(default_playback_rate); // rate of youtube lines during origing/exercise/recording
    const [playerLinePlaybackRate, setPlayerLinePlaybackRate] = useState(sourcePlaybackRate); // rate of player line during exercise/recording
    const [youLinePlaybackRate, setYouLinePlaybackRate] = useState(videoData.yourLineRate ? videoData.yourLineRate : default_your_line_playback_rate); // rate of your line during exercise/recording
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(sourcePlaybackRate); // current, can be sourcePlaybackRate or youLinePlaybackRate
    const [imbededCaptionBluringValue, setImbededCaptionBluringValue] = useState(false);

    const [sourceVolume, setSourceVolume] = useState(default_volume); // volume of youtube lines during origing/exercise/recording
    const [yourLineSourceVolume, setYourLineSourceVolume] = useState(default_your_line_volume); // volume of your line during origing/exercise/recording
    const [currentVolume, setCurrentVolume] = useState(sourceVolume); // current, can be sourceVolume or yourLineSourceVolume

    // save parameters before recording
    const [loopPreRec, setLoopPreRec] = useState(loop);
    const [yourLineSourceVolumePreRec, setYourLineSourceVolumePreRec] = useState(yourLineSourceVolume);

    const [showEmailForm, setShowEmailForm] = useState(false); // State variable to control modal visibility
    const [emailAddress, setEmailAddress] = useState(null); // State variable to store email address
    const [studentName, setStudentName] = useState('Unknown'); // State variable to store student name
    const [isClipMode, setIsClipMode] = useState(false); 
    const emailInputRef = useRef(null);
    const nameInputRef = useRef(null);
    const unlistedInputRef = useRef(false);

    const playerRef = useRef(null);
    const recPlayerRef = useRef(null);

    const [restoreDefaultExercise, setRestoreDefaultExercise] = useState(false);
    const [clipSelection, setClipSelection] = useState({ start: undefined, end: undefined });

    // #endregion States

    // #region Exercise flow
    const setCurrentVolumeWrapper = (volume) => {
        setCurrentVolume(volume);
        setMuted(volume === 0);
    };

    const setPlayingCaption = (caption) => {
        if (caption) {
            setCurrentCaption(caption);
            setCurrentPlaybackRateByCaption(caption);
            setCurrentVolumeByCaption(caption);
        } else {
            setCurrentCaption(null);
            setCurrentPlaybackRate(sourcePlaybackRate);
            setCurrentVolumeWrapper(sourceVolume);
        }
    };

    const setCurrentPlaybackRateByCaption = (caption) => {
        let newValue = (exerciseStatus === ExerciseStatus.RECORDING
                            ||
                        (exerciseStatus === ExerciseStatus.PLAYING && recordedChunks?.length > 0)
                       )?sourcePlaybackRate:playerLinePlaybackRate;
        if (exerciseStatus !== ExerciseStatus.ORIGIN && caption?.checked) {
            newValue = youLinePlaybackRate;
        }
        if (newValue !== currentPlaybackRate) {
            console.log(`LingFlix: SetPlaybackRate: ${newValue} caption:${caption?.text} checked:${caption?.checked}`);
            setCurrentPlaybackRate(newValue);
        }
    };

    const setCurrentVolumeByCaption = (caption) => {
        let newVolume = sourceVolume;
        if (exerciseStatus !== ExerciseStatus.ORIGIN && caption?.checked) {
            newVolume = yourLineSourceVolume;
        }
        if (newVolume !== currentVolume) {
            console.log(`LingFlix: SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked}`);
            setCurrentVolumeWrapper(newVolume);
        }
    };

    const handleUpdateCaptions = (captions) => {
        setCaptions(captions);
    };

    // #endregion Exercise flow

    // #region Exercise settings
    const setYoulinePlaybackRateWrapper = (rate) => {
        setYouLinePlaybackRate(rate);
    };

    const setPlayerLinePlaybackRateWrapper = (rate) => {
        setPlayerLinePlaybackRate(rate);
    };

    const handleLoopChange = (checked) => {
        console.log(`LingFlix: Loop ${loop} changed to ${checked} current playerRef.current;${playerRef.current.loop}`);
        setLoop(checked);
    };

    const handleShowCaptionsChange = (checked) => {
        setShowCaptions(checked);
    };

    const handleYourLinePlaybackRateChange = (rate) => {
        setYoulinePlaybackRateWrapper(parseFloat(rate));
    };

    const handlePlayerLinePlaybackRateChange = (rate) => {
        setPlayerLinePlaybackRateWrapper(parseFloat(rate));
    };

    const handleYourLineSourceVolumeChange = (volume) => {
        setYourLineSourceVolume(parseFloat(volume));
    };

    const handleImbededCaptionBluringChange = (checked) => {
        setImbededCaptionBluringValue(checked);
    };
    // #endregion Exercise settings

    // #region Player position handlers
    const handleOnProgress = (state) => {
        if (position !== state.playedSeconds) {
            setPosition(state.playedSeconds);
        }
    };
    const handlePlayingEnd = () => {
        if (exerciseStatus === ExerciseStatus.RECORDING) {
            stopPlay();
        } else if (!loop) {
            stopPlay();
        } else {
            jumpToStart(playerRef);        }
    }
    // #endregion Player position handlers

    // #region Play/Stop
    const setExerciseStatusWrapper = (status, caller) => {
        setExerciseStatus(status);
        console.log(`LingFlix: ExerciseStatus(${caller}): ${status}`);
    }
    const startPlay = (origin, caller) => {
        console.log(`LingFlix: startPlay from ${caller}: Origin=${origin}`);
        jumpToStart(playerRef);
        jumpToStart(recPlayerRef);
        setCurrentVolumeWrapper(default_volume);
        setExerciseStatusWrapper(origin ? ExerciseStatus.ORIGIN : ExerciseStatus.PLAYING, 'startPlay');
    };
    const stopPlay = () => {
        setCurrentVolumeWrapper(sourceVolume);
        setExerciseStatusWrapper(ExerciseStatus.STOPPED, 'stopPlay');
    };
    const handleResetStatus = (status) => {
        setExerciseStatusWrapper(status, 'resetStatus');
    };
    // #endregion Play/Stop

    // #region Recording
    const handleStartRecording = () => {
        if (exerciseStatus === ExerciseStatus.STOPPED) {
            if (recordedChunks?.length > 0) {
                alert('You have already recorded something. Please clear recording first.\n(Click "Clear Record" button)');
            } else {
                setLoopPreRec(loop);
                setLoop(false);

                setYourLineSourceVolumePreRec(yourLineSourceVolume);
                setYourLineSourceVolume(default_recording_your_line_volume);
                if (parseFloat(captions[0].start) < 0.2) {
                    setPlayingCaption(captions[0]);
                } else {
                    setPlayingCaption(null);
                }

                startPlay(false, 'handleStartRecording');;
                setExerciseStatusWrapper(ExerciseStatus.RECORDING, 'handleStartRecording');
            }
        }
    };
    const saveRecording = (chunks) => {
        console.log(`LingFlix: SaveRecording: ${chunks?.length}`);
        //if (exerciseStatus === ExerciseStatus.RECORDING) {
        setLoop(loopPreRec);
        setYourLineSourceVolume(yourLineSourceVolumePreRec);
        stopPlay();
        setExerciseStatusWrapper(ExerciseStatus.STOPPED, 'saveRecording');
        setRecordedChunks(chunks);
        console.log(`LingFlix: After SaveRecording: ${chunks?.length}->${recordedChunks?.length}`);
        //}
        setClearRecordedChunks(false);
    };
    const handleClearRecording = () => {
        setClearRecordedChunks(true);
    }
    const afterClearRecordedChunks = () => {
        setRecordedChunks([]);
        videoData.videoRecordedChunks = [];
        setClearRecordedChunks(false);
    }
    const handleRestoreDefaultExercise = () => {
        setRestoreDefaultExercise(true);
    }
    const afterRestoreDefaultExercise = () => {
        setRestoreDefaultExercise(false);
    }
    // #endregion Recording

    // start playing on the first open
    useEffect(() => {
        if (videoData.yourLineRate && videoData.yourLineRate !== youLinePlaybackRate) {
            setYoulinePlaybackRateWrapper(videoData.yourLineRate);
        }
        if (videoData.videoRecordedChunks?.length > 0) {
            saveRecording(videoData.videoRecordedChunks);
            setYourLineSourceVolume(default_recording_your_line_volume);
        } else {
            startPlay(true, 'useEffect');
        }
    }, []);

    // #region Email form
    const handleCloseEmailForm = () => setShowEmailForm(false);
    const handleShowEmailForm = () => setShowEmailForm(true);
    const handleShareHomework = () => {
        if (emailInputRef.current) {
            const emailToSend = emailInputRef.current.value;
            const name = nameInputRef.current.value;
            const isUnlistedVideo = unlistedInputRef.current.checked;
            setShowEmailForm(false);
            handleShareExercise(videoData, captions, recordedChunks, currentPlaybackRate, youLinePlaybackRate, name, emailToSend, isUnlistedVideo);
            setEmailAddress(emailToSend);
            setStudentName(name);
        }
    };

    const handleNameInputChange = (event) => {
        const regex = /^[a-zA-Z0-9.-]*$/;
        let inputValue = event.target.value;
        if (inputValue.length > 20) {
            inputValue = inputValue.slice(0, 20);
        }
        if (regex.test(inputValue)) {
            nameInputRef.current.value = inputValue;
        } else {
            nameInputRef.current.value = inputValue.replace(/[^a-zA-Z0-9.-]/g, '');
            alert('Invalid character. Only english letters, numbers, and hyphens are allowed!');
        }
    };

    const handleShareExerciseWrapper = () => handleShowEmailForm(); // TODO: use handleShowEmailForm
    // #endregion Email form

    const handleChangeClipSelection=(clipRange) => {
        setClipSelection(clipRange);
        setIsClipMode(determineClipMode(clipRange));
    }

    const determineClipMode = (clipRange) => {
        let result = captions?.length>0 && clipRange?.start !== undefined;
        if (result) {
            let lastCaptionEnd = parseFloat(captions[captions.length - 1].start) + parseFloat(captions[captions.length - 1].duration);
            result = clipRange.start > 0 || clipRange.end < lastCaptionEnd;
        }
        return result;
    }

    return (
        <>
            <div id="PlaybackSettingsArea" className="row mb-3 col-12 col-md-12 col-lg-9">
                <PlaybackSettings
                    initLoop={loop}
                    initShowCaptions={showCaptions}
                    initYourLineSourceVolume={yourLineSourceVolume}
                    initPlayerLinePlaybackRate={sourcePlaybackRate}
                    initYourLinePlaybackRate={youLinePlaybackRate}
                    initImbededCaptionBluring={imbededCaptionBluringValue}
                    onLoopChange={handleLoopChange}
                    onShowCaptionsChange={handleShowCaptionsChange}
                    onPlayerLinePlaybackRateChange={handlePlayerLinePlaybackRateChange}
                    onYourLinePlaybackRateChange={handleYourLinePlaybackRateChange}
                    onYourLineSourceVolumeChange={handleYourLineSourceVolumeChange}
                    onImbededCaptionBluringChange={handleImbededCaptionBluringChange}
                />
            </div>

            <ControlsArea
                exerciseStatus={exerciseStatus}
                isClipMode = {isClipMode}
                onExit={onExit}
                startPlay={startPlay}
                stopPlay={stopPlay}
                recordedChunks={recordedChunks}
                handleStartRecording={handleStartRecording}
                saveRecording={saveRecording}
                videoData={videoData}
                captions={captions}
                sourcePlaybackRate={sourcePlaybackRate}
                youLinePlaybackRate={youLinePlaybackRate}
                handleShareExerciseWrapper={handleShareExerciseWrapper}
                handleSaveExercise={handleSaveExercise}
                handleClearRecording={handleClearRecording}
                handleRestoreDefaultExercise={handleRestoreDefaultExercise}
            />

            <div className="row col-12 col-md-6">
                <PlayerBox
                    playerRef={playerRef}
                    recPlayerRef={recPlayerRef}
                    exerciseStatus={exerciseStatus}
                    muted={muted}
                    videoData={videoData}
                    loop={loop}
                    imbededCaptionBluring={imbededCaptionBluringValue}
                    currentPlaybackRate={currentPlaybackRate}
                    currentVolume={currentVolume}
                    handleOnProgress={handleOnProgress}
                    handlePlayingEnd={handlePlayingEnd}
                    handleStopRecording={saveRecording}
                    clearRecordedChunks={clearRecordedChunks}
                    afterClearRecordedChunks={afterClearRecordedChunks}
                    clipSelection={clipSelection}
                //onResetStatus={handleResetStatus}
                />
                {showCaptions && <CaptionBox caption={currentCaption} />}


                <CaptionsView
                    videoData={videoData}
                    position={position}
                    onCurrentCaptionChange={setPlayingCaption}
                    onUpdateCaptions={handleUpdateCaptions}
                    restoreDefaultExercise={restoreDefaultExercise}
                    afterRestoreDefaultExercise={afterRestoreDefaultExercise}
                    onChangeClipSelection={handleChangeClipSelection}
                    hasRecordedChunks={recordedChunks?.length > 0}
                />
            </div>
            <Modal show={showEmailForm} >
                <Modal.Body>
                    <form>
                        <div className="form-group">
                            <label htmlFor="emailInput">Email address to send Your Exercise</label>
                            <input type="email" className="form-control" id="emailInput" aria-describedby="emailHelp" ref={emailInputRef} />
                            <small id="emailHelp" className="form-text text-muted">We never share your email with anyone else.</small>
                            <label htmlFor="nameInput">Your Name to identify Your Exercise</label>
                            <input type="name" className="form-control" id="nameInput" ref={nameInputRef} onChange={handleNameInputChange} />
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="unlistedCheck" ref={unlistedInputRef} />
                                <label className="form-check-label" htmlFor="unlistedCheck">Unlisted video</label>
                                <p><small id="unlistedCheckHelp" className="form-text text-muted">The secret video only you can share with others</small></p>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleCloseEmailForm}>
                        Close
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleShareHomework}>
                        Send
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ExerciseView;