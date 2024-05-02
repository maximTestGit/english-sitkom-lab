import React, { useState, useRef, useEffect, useCallback } from 'react';
import CaptionsView from './captionsView';
import CaptionBox from './captionBox.js';
import PlaybackSettings from './playbackSettings.js';
import ConditionalButton from './helpers/conditionalButton.js';
import PlayerBox from './playerBox.js';
import ExerciseStatus from './data/exerciseStatus.js';
import { jumpToStart, handleSaveExercise, handleShareExercise } from './helpers/exerciseHelper.js';
import Modal from 'react-bootstrap/Modal';

const ExerciseView = ({ videoData, onExit }) => {
    const default_playback_rate = 1.0;
    const default_volume = 50;
    const default_your_line_volume = 1.0;
    const recording_your_line_volume = 0.0;

    // #region States
    const [muted, setMuted] = useState(false);
    const [position, setPosition] = useState(0);
    const [currentCaption, setCurrentCaption] = useState(null);
    const [loop, setLoop] = useState(false);
    const [loopPreRec, setLoopPreRec] = useState(loop);
    const [showCaptions, setShowCaptions] = useState(true);
    const [youLinePlaybackRate, setYoulinePlaybackRate] = useState(default_playback_rate);
    const [playbackRate, setPlaybackRate] = useState(default_playback_rate);
    const [yourLineSourceVolume, setYourLineSourceVolume] = useState(default_your_line_volume);
    const [yourLineSourceVolumePreRec, setYourLineSourceVolumePreRec] = useState(yourLineSourceVolume);
    const [sourceVolume, setSourceVolume] = useState(default_volume);
    const [currentVolume, setCurrentVolume] = useState(default_volume);
    const [exerciseStatus, setExerciseStatus] = useState(ExerciseStatus.STOPPED);
    const [captions, setCaptions] = useState([]);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [clearRecordedChunks, setClearRecordedChunks] = useState(false);

    const [showEmailForm, setShowEmailForm] = useState(false); // State variable to control modal visibility
    const [emailAddress, setEmailAddress] = useState(null); // State variable to store email address
    const [studentName, setStudentName] = useState('Unknown'); // State variable to store student name
    const emailInputRef = useRef(null);
    const nameInputRef = useRef(null);

    const playerRef = useRef(null);
    const recPlayerRef = useRef(null);

    // #endregion States

    // #region Exercise flow
    const setPlayingCaption = (caption) => {
        setCurrentCaption(caption);
        setYoulinePlaybackRateValue(caption);
        setVolumeValue(caption);
    };

    const setYoulinePlaybackRateValue = (caption) => {
        if (caption && exerciseStatus !== ExerciseStatus.ORIGIN && caption.checked) {
            if (playbackRate !== youLinePlaybackRate) {
                setPlaybackRate(youLinePlaybackRate);
            }
        } else if (playbackRate !== default_playback_rate) {
            setPlaybackRate(default_playback_rate);
        }
    };

    const setVolumeValue = (caption) => {
        let newVolume = 0;
        if (recordedChunks?.length>0 && exerciseStatus !== ExerciseStatus.ORIGIN && caption.checked) {
            newVolume = recording_your_line_volume;
        } else if (caption && exerciseStatus !== ExerciseStatus.ORIGIN && caption.checked) {
            newVolume = yourLineSourceVolume;
        } else {
            newVolume = sourceVolume;
        }
        console.log(`LingFlix: SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked}`); 
        setCurrentVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const handleUpdateCaptions = (captions) => {
        setCaptions(captions);
    };

    // #endregion Exercise flow

    // #region Exercise settings
    const handleLoopChange = (checked) => {
        console.log(`LingFlix: Loop ${loop} changed to ${checked} current playerRef.current;${playerRef.current.loop}`);
        setLoop(checked);
    };

    const handleShowCaptionsChange = (checked) => {
        setShowCaptions(checked);
    };

    const handleYourLinePlaybackRateChange = (rate) => {
        setYoulinePlaybackRate(parseFloat(rate));
    };

    const handleYourLineSourceVolumeChange = (volume) => {
        setYourLineSourceVolume(parseFloat(volume));
    };

    // #endregion Exercise settings

    // #region Player position handlers
    const handleOnProgress = (state) => {
        setPosition(state.playedSeconds);
    };
    const handlePlayingEnd = () => {
        if (exerciseStatus === ExerciseStatus.RECORDING) {
            stopPlay();
        } else if (!loop) {
            stopPlay();
        }
    }
    // #endregion Player position handlers

    // #region Play/Stop
    // const handlePlayStop = (status) => {
    //     if (status === ExerciseStatus.PLAYING) {
    //         stopPlay();
    //     } else if (status === ExerciseStatus.STOPPED) {
    //         startPlay();
    //     }
    // };
    const startPlay = (origin = false) => {
        jumpToStart(playerRef);
        jumpToStart(recPlayerRef);
        setCurrentVolume(default_volume);
        setExerciseStatus(origin ? ExerciseStatus.ORIGIN : ExerciseStatus.PLAYING);
    };
    const stopPlay = () => {
        setCurrentVolume(sourceVolume);
        setExerciseStatus(ExerciseStatus.STOPPED);
    };
    // #endregion Play/Stop

    // #region Recording
    const handleStartRecording = () => {
        if (exerciseStatus === ExerciseStatus.STOPPED) {
            setLoopPreRec(loop);
            setYourLineSourceVolumePreRec(yourLineSourceVolume);
            setLoop(false);
            setYourLineSourceVolume(recording_your_line_volume);
            handleClearRecording();
            startPlay();
            setExerciseStatus(ExerciseStatus.RECORDING);
        }
    };
    const handleStopRecording = (chunks) => {
        if (exerciseStatus === ExerciseStatus.RECORDING) {
            setLoop(loopPreRec);
            setYourLineSourceVolume(yourLineSourceVolumePreRec);
            stopPlay();
            setExerciseStatus(ExerciseStatus.STOPPED);
            setRecordedChunks(chunks);
        }
        setClearRecordedChunks(false);
    };
    const handleClearRecording = () => {
        setClearRecordedChunks(true);
    }

    const afterClearRecordedChunks = () => {
        setRecordedChunks([]);
        setClearRecordedChunks(false);
    }
    // #endregion Recording

    // start playing on the first open
    useEffect(() => {
        if (videoData) {
            if (videoData.yourLineRate && videoData.yourLineRate !== youLinePlaybackRate) {
                setYoulinePlaybackRate(videoData.yourLineRate);
            }
        } else {
            startPlay(true);
        }
    }, []);

    // #region Email form
    const handleCloseEmailForm = () => setShowEmailForm(false);
    const handleShowEmailForm = () => setShowEmailForm(true);
    const handleShareHomework = () => {
        if (emailInputRef.current) {
            const emailToSend = emailInputRef.current.value;
            const name = nameInputRef.current.value;
            setShowEmailForm(false);
            handleShareExercise(videoData, captions, recordedChunks, playbackRate, youLinePlaybackRate, emailToSend, name);
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
        }
    };

    const handleShareExerciseWrapper = () => handleShowEmailForm(); // TODO: use handleShowEmailForm
    // #endregion Email form

    return (
        <>
            <div id="ExerciseArea" className="row">
                <div id="PlayerMainArea" className="col-6">

                    <div id="PlayerBoxArea" className='row'>
                        <PlayerBox
                            playerRef={playerRef}
                            recPlayerRef={recPlayerRef}
                            exerciseStatus={exerciseStatus}
                            muted={muted}
                            videoData={videoData}
                            loop={loop}
                            playbackRate={playbackRate}
                            currentVolume={currentVolume}
                            handleOnProgress={handleOnProgress}
                            handlePlayingEnd={handlePlayingEnd}
                            handleStopRecording={handleStopRecording}
                            clearRecordedChunks={clearRecordedChunks}
                            afterClearRecordedChunks={afterClearRecordedChunks}
                        />
                        {showCaptions && <CaptionBox caption={currentCaption} />}
                    </div>
                </div>

                <div id="PlaybackSettingsAndCaptionsArea" className="col-6">
                    <div id="PlaybackSettingsArea" className="row mb-1">
                        <PlaybackSettings
                            initLoop={loop}
                            initShowCaptions={showCaptions}
                            initYourLineSourceVolume={yourLineSourceVolume}
                            initYourLinePlaybackRate={youLinePlaybackRate}
                            onLoopChange={handleLoopChange}
                            onShowCaptionsChange={handleShowCaptionsChange}
                            onYourLinePlaybackRateChange={handleYourLinePlaybackRateChange}
                            onYourLineSourceVolumeChange={handleYourLineSourceVolumeChange}
                        />
                    </div>

                    <div id="ControlsArea" className="btn-group mb-1" role="group" >

                        <ConditionalButton
                            className="btn btn-danger"
                            onClick={() => onExit()}
                        >
                            Back
                        </ConditionalButton>

                        <ConditionalButton
                            condition={exerciseStatus !== ExerciseStatus.ORIGIN}
                            isDisabled={exerciseStatus === ExerciseStatus.RECORDING
                                || exerciseStatus === ExerciseStatus.PLAYING}
                            className="btn btn-success"
                            onClick={() => startPlay(true)}
                            antiOnClick={() => stopPlay()}
                            antiChildren={'Stop'}
                        >YouTube
                        </ConditionalButton>

                        <ConditionalButton
                            condition={exerciseStatus !== ExerciseStatus.PLAYING}
                            isDisabled={exerciseStatus === ExerciseStatus.RECORDING
                                || exerciseStatus === ExerciseStatus.ORIGIN}
                            className="btn btn-success"
                            onClick={() => startPlay()}
                            antiOnClick={() => stopPlay()}
                            antiChildren={'Stop'}
                        >
                            Play
                        </ConditionalButton>

                        <ConditionalButton
                            condition={exerciseStatus !== ExerciseStatus.RECORDING}
                            isDisabled={exerciseStatus === ExerciseStatus.PLAYING
                                ||
                                exerciseStatus === ExerciseStatus.ORIGIN}
                            className="btn btn-success"
                            onClick={() => handleStartRecording()}
                            antiOnClick={() => handleStopRecording()}
                            antiChildren={'Stop'} >
                            Record
                        </ConditionalButton>

                        <ConditionalButton
                            condition={true}
                            dataToggle="modal" dataTarget="#emailModal"
                            isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                            className="btn btn-success"
                            onClick={() => handleShareExerciseWrapper(videoData, captions, recordedChunks, default_playback_rate, youLinePlaybackRate)}
                        >
                            Share
                        </ConditionalButton>

                        <ConditionalButton
                            isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                            className="btn btn-success" antiClassName="btn btn-success"
                            onClick={() => handleSaveExercise(videoData, captions, recordedChunks, default_playback_rate, youLinePlaybackRate)}
                        >
                            Save
                        </ConditionalButton>

                        <ConditionalButton
                            isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                            className="btn btn-success" antiClassName="btn btn-success"
                            onClick={() => handleClearRecording()}
                        >
                            Clear
                        </ConditionalButton>
                    </div>

                    <div id="CaptionsArea" className="row">
                        <CaptionsView
                            videoData={videoData}
                            position={position}
                            onCurrentCaptionChange={setPlayingCaption}
                            onUpdateCaptions={handleUpdateCaptions}
                        />
                    </div>
                </div>
            </div>

            <Modal show={showEmailForm} >
                <Modal.Body>
                    <form>
                        <div className="form-group">
                            <label htmlFor="nameInput">Your Name to identify Your Exercise</label>
                            <input type="name" className="form-control" id="nameInput" ref={nameInputRef} onChange={handleNameInputChange} />
                            <label htmlFor="emailInput">Email address to send Your Exercise</label>
                            <input type="email" className="form-control" id="emailInput" aria-describedby="emailHelp" ref={emailInputRef} />
                            <small id="emailHelp" className="form-text text-muted">We never share your email with anyone else.</small>
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