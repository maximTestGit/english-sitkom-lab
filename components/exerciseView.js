import React, { useState, useRef, useEffect, useCallback } from 'react';
import CaptionsView from './captionsView';
import CaptionBox from './captionBox';
import PlaybackSettings from './playbackSettings';
import PlayerBox from './playerBox';
import ExerciseStatus from './data/exerciseStatus';
import { jumpToStart, doSaveExerciseToFile, doShareHomework } from './helpers/exerciseHelper';
import Modal from 'react-bootstrap/Modal';
import ControlsArea from './controlsArea';
import { isRunningOnBigScreen, learningLanguage } from './data/configurator';
import {
    storageDataAttributes,
    fetchDataFromLocalStorage,
    saveDataToLocalStorage,
} from './helpers/storageHelper';
import { saveCaptionObjectsToFile } from './helpers/srtHelper';
import AdminArea from './adminArea.js';
import { captionsSaveToStorage } from './helpers/fetchData';
import { buildClipRange } from './helpers/exerciseHelper';

const ExerciseView = ({
    currentUser,
    videoData,
    captions,
    clipIndexRange, //???
    onExit,
    onClipIndexRangeChange,
    onUpdateCaptions,
}) => {

    // #region defaults

    const default_playback_rate = 1.0; // 1x speed
    const default_your_line_playback_rate = 1.0; // 1x speed

    const default_volume = 100.0; // 50% of the volume
    const default_your_line_volume = 0.0; // mute
    const default_recording_your_line_volume = 0.0; // mute

    // #region defaults

    // #region State
    const initialSettings = {
        isLoop: false,
        toShowCaptions: true,
        whisperVolume: default_your_line_volume,
        yourLineSpeed: videoData.yourLineRate ? videoData.yourLineRate : default_your_line_playback_rate, // rate of your line during exercise/recording
        playerLineSpeed: videoData.playbackRate ? videoData.playbackRate : default_playback_rate, // rate of player line during exercise/recording
        playerLineVolume: default_volume,
        isImbededCaptionsBlured: false,
        isCameraAllowed: false,
    };

    const [settings, setSettings] = useState(initialSettings);

    const [position, setPosition] = useState(0);
    const [currentCaption, setCurrentCaption] = useState(null);
    const [exerciseStatus, setExerciseStatus] = useState(ExerciseStatus.STOPPED);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [srtCaptionsData, setSrtCaptionsData] = useState(null);
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(default_playback_rate); // current, can be default_playback_rate or youLinePlaybackRate
    const [currentVolume, setCurrentVolume] = useState(default_volume); // current, can be default_volume or whisperVolume

    // save parameters before recording
    const [loopPreRec, setLoopPreRec] = useState(settings.isLoop);
    const [whisperVolumePreRec, setWhisperVolumePreRec] = useState(settings.whisperVolume);

    // #region ShowEmailFormModalOpen
    const [isShowEmailFormModalOpen, setIsShowEmailFormModalOpen] = useState(false); // State variable to control modal visibility
    const [emailAddress, setEmailAddress] = useState(null); // State variable to store email address
    const [studentName, setStudentName] = useState('Unknown'); // State variable to store student name

    const emailInputRef = useRef(null);
    const nameInputRef = useRef(null);
    const unlistedInputRef = useRef(false);

    // #endregion ShowEmailFormModalOpen

    const playerRef = useRef(null);
    const playerBoxRef = useRef(null);
    const recPlayerRef = useRef(null);
    const captionViewRef = useRef(null);

    // #endregion State

    // #region Exercise flow

    //  #region set settings key functions
    const updateSettingKey = (key, value) => {
        //console.log(`LingFlix: updateSettingKey', at position set ${key}=${settings[key]} - ${value}`);
        setSettings(prevSettings => ({
            ...prevSettings,
            [key]: value,
        }));
    };
    const setIsLoop = (value) => {
        updateSettingKey('isLoop', value);
    };
    const setToShowCaptions = (value) => {
        updateSettingKey('toShowCaptions', value);
    };
    const setWhisperVolume = (value) => {
        updateSettingKey('whisperVolume', value);
    };
    const setYourLineSpeed = (value) => {
        updateSettingKey('yourLineSpeed', value);
    };
    const setPlayerLineSpeed = (value) => {
        updateSettingKey('playerLineSpeed', value);
    };
    const setPlayerLineVolume = (value) => {
        updateSettingKey('playerLineVolume', value);
    };
    const setIsImbededCaptionsBlured = (value) => {
        updateSettingKey('isImbededCaptionsBlured', value);
    };
    const setIsCameraAllowed = (value) => {
        updateSettingKey('isCameraAllowed', value);
    };

    // #endregion set settings key functions

    const updateSetting = useCallback((key, value) => {
        switch (key) {
            case 'isLoop':
                handleLoopChange(value);
                break;
            case 'toShowCaptions':
                handleShowCaptionsChange(value);
                break;
            case 'whisperVolume':
                handleWhisperVolumeChange(value);
                break;
            case 'yourLineSpeed':
                handleYourLineSpeedChange(value);
                break;
            case 'playerLineSpeed':
                handlePlayerLineSpeedChange(value);
                break;
            case 'playerLineVolume':
                handlePlayerLineVolumeChange(value);
                break;
            case 'isImbededCaptionsBlured':
                handleImbededCaptionBluringChange(value);
                break;
            case 'isCameraAllowed':
                handleAllowCameraChange(value);
                break;
            default:
                break;
        }
    }, []);

    const setCurrentVolumeWrapper = (volume) => {
        setCurrentVolume(volume);
    };
    const setCurrentPlaybackRateWrapper = (playbackRate, caption) => {
        console.log(`LingFlix: setCurrentPlaybackRate: from ${currentPlaybackRate} to ${playbackRate} caption:${caption?.text} checked:${caption?.checked}`);
        setCurrentPlaybackRate(playbackRate);
    };
    const setPlayingCaption = (caption) => {
        if (caption) {
            setCurrentCaption(caption);
            setCurrentPlaybackRateByCaption(caption);
            setCurrentVolumeByCaption(caption);
        } else {
            setCurrentCaption(null);
            setCurrentPlaybackRateWrapper(default_playback_rate);
            setCurrentVolumeWrapper(default_volume);
        }
    };

    const setCurrentPlaybackRateByCaption = (caption) => {
        let newValue = (exerciseStatus === ExerciseStatus.RECORDING
            ||
            (exerciseStatus === ExerciseStatus.PLAYING && recordedChunks?.length > 0)
        ) ? default_playback_rate : settings.playerLineSpeed;
        if (exerciseStatus !== ExerciseStatus.ORIGIN && caption?.checked) {
            newValue = settings.yourLineSpeed;
        }
        if (newValue !== currentPlaybackRate) {
            setCurrentPlaybackRateWrapper(newValue);
        }
    };

    const setCurrentVolumeByCaption = (caption) => {
        let newVolume;
        if (exerciseStatus === ExerciseStatus.ORIGIN) {
            newVolume = settings.playerLineVolume;
            console.log(`LingFlix: 1 at position. status: ${exerciseStatus} SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked} record: ${recordedChunks?.length}`);
        } else if (exerciseStatus === ExerciseStatus.PLAYING) {
            if (caption?.checked) {
                newVolume = recordedChunks?.length > 0 ? 0 : settings.whisperVolume;
                console.log(`LingFlix: 2.1 at position status: ${exerciseStatus} SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked} record: ${recordedChunks?.length}`);
            } else {
                newVolume = settings.playerLineVolume;
                console.log(`LingFlix: 2.2 at position status: ${exerciseStatus} SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked} record: ${recordedChunks?.length}`);
            }
        } else if (exerciseStatus === ExerciseStatus.RECORDING) {
            newVolume = caption?.checked ? settings.whisperVolume : settings.playerLineVolume;
            console.log(`LingFlix: 3 at position status: ${exerciseStatus} SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked} record: ${recordedChunks?.length}`);
        } else {
            newVolume = settings.playerLineVolume;
            console.log(`LingFlix: 4 at position status: ${exerciseStatus} SetVolume: ${newVolume} caption:${caption?.text} checked:${caption?.checked} record: ${recordedChunks?.length}`);
        }

        if (newVolume !== currentVolume) {
            console.log(`LingFlix: at position SetVolume: ${newVolume}!=${currentVolume} caption:${caption?.text} checked:${caption?.checked}`);
            setCurrentVolumeWrapper(newVolume);
        }
    };

    const handleUpdateCaptions = (captions) => {
        onUpdateCaptions(captions);
    };

    // #endregion Exercise flow

    // #region Exercise settings

    const setPlayerLineSpeedWrapper = (rate) => {
        setPlayerLineSpeed(rate);
    };

    const setPlayerLineVolumeWrapper = (value) => {
        setPlayerLineVolume(value);
    };

    const handleLoopChange = (checked) => {
        console.log(`LingFlix: Loop ${settings.isLoop} changed to ${checked} current playerRef.current;${playerRef.current.loop}`);
        setIsLoop(checked);
    };

    const handleShowCaptionsChange = (checked) => {
        setToShowCaptions(checked);
    };

    const handleYourLineSpeedChange = (rate) => {
        setYourLineSpeed(parseFloat(rate));
        saveDataToLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.your_line_playback_rate,
            rate);
    };

    const handlePlayerLineSpeedChange = (rate) => {
        setPlayerLineSpeedWrapper(parseFloat(rate));
        saveDataToLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.player_line_playback_rate,
            rate);
    };

    const handlePlayerLineVolumeChange = (value) => {
        setPlayerLineVolumeWrapper(parseFloat(value));
        saveDataToLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.player_line_playback_volume,
            value);
    };

    const handleWhisperVolumeChange = (volume) => {
        setWhisperVolume(parseFloat(volume));
        saveDataToLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.whisper_playback_volume,
            volume);
    };

    const handleImbededCaptionBluringChange = (checked) => {
        setIsImbededCaptionsBlured(checked);
    };

    const handleAllowCameraChange = (checked) => {
        setIsCameraAllowed(checked);
        saveDataToLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.allow_camera_key,
            checked);
    };
    // #endregion Exercise settings

    // #region Player position handlers
    const handleOnProgress = (state) => {
        if (state.playedSeconds === 0 || position === 0 || position !== state.playedSeconds) {
            setPosition(state.playedSeconds);
            console.log(`LingFlix: OnProgress: ${state.playedSeconds}`);
        }
    };
    const handlePlayingEnd = () => {
        if (exerciseStatus === ExerciseStatus.RECORDING) {
            handleStopPlay();
        } else if (!settings.isLoop) {
            handleStopPlay();
        } else {
            jumpToStart(playerRef);
            setPosition(0);
        }
    }
    // #endregion Player position handlers

    // #region Play/Stop
    const setExerciseStatusWrapper = (status, caller) => {
        setExerciseStatus(status);
        console.log(`LingFlix: ExerciseStatus(${caller}): ${status}`);
    }
    const handleStartPlay = (status, caller) => {
        console.log(`LingFlix: startPlay from ${caller}: status=${status}`);
        jumpToStart(playerRef);
        setPosition(0);
        jumpToStart(recPlayerRef);
        setCurrentVolumeWrapper(default_volume);
        setExerciseStatusWrapper(status, 'startPlay');
    };
    const handleStopPlay = () => {
        setCurrentVolumeWrapper(default_volume);
        setExerciseStatusWrapper(ExerciseStatus.STOPPED, 'stopPlay');
    };
    // #endregion Play/Stop

    // #region Recording
    const handleStartRecording = () => {
        if (exerciseStatus === ExerciseStatus.STOPPED) {
            if (recordedChunks?.length > 0) {
                alert('You have already recorded something. Please clear recording first.\n(Click "Clear Homework Record" button)');
            } else {
                setLoopPreRec(settings.isLoop);
                setIsLoop(false);

                setWhisperVolumePreRec(settings.whisperVolume);
                setWhisperVolume(default_recording_your_line_volume);
                if (parseFloat(captions[0].start) < 0.2) {
                    setPlayingCaption(captions[0]);
                } else {
                    setPlayingCaption(null);
                }

                handleStartPlay(ExerciseStatus.RECORDING, 'handleStartRecording');;
                //setExerciseStatusWrapper(ExerciseStatus.RECORDING, 'handleStartRecording');
            }
        }
    };
    const handleSaveRecording = (chunks) => {
        console.log(`LingFlix: SaveRecording: ${chunks?.length}`);
        setIsLoop(loopPreRec);
        setWhisperVolume(whisperVolumePreRec);
        handleStopPlay();
        setExerciseStatusWrapper(ExerciseStatus.STOPPED, 'handleSaveRecording');
        setRecordedChunks(chunks);
        console.log(`LingFlix: After SaveRecording: ${chunks?.length}->${recordedChunks?.length}`);
    };
    const handleClearRecording = () => {
        playerBoxRef.current?.clearRecording();
        setRecordedChunks([]);
        videoData.videoRecordedChunks = [];
    }
    const handleRestoreDefaultExercise = () => {
        captionViewRef.current?.handleRestoreDefaultExercise(); // Calling resetCaptions function in CaptionsView
    }
    // #endregion Recording

    // start playing on the first open
    useEffect(() => {
        if (videoData.yourLineRate && videoData.yourLineRate !== settings.yourLineSpeed) {
            setYourLineSpeed(videoData.yourLineRate);
        }
        if (videoData.videoRecordedChunks?.length > 0) {
            handleSaveRecording(videoData.videoRecordedChunks); //???
            setWhisperVolume(default_recording_your_line_volume);
        } else {
            handleStartPlay(ExerciseStatus.ORIGIN, 'useEffect');
        }

        let isCameraAllowed = fetchDataFromLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.allow_camera_key);
        if (isCameraAllowed === null || isCameraAllowed === undefined) {
            isCameraAllowed = initialSettings.isCameraAllowed;
            handleAllowCameraChange(isCameraAllowed); //???
        } else {
            setIsCameraAllowed(isCameraAllowed);
        }

        let yourLineRate = fetchDataFromLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.your_line_playback_rate);
        if (yourLineRate === null || yourLineRate === undefined) {
            yourLineRate = initialSettings.yourLineSpeed;
            handleYourLineSpeedChange(yourLineRate); //???
        } else {
            setYourLineSpeed(parseFloat(yourLineRate));
        }

        let playerLineRate = fetchDataFromLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.player_line_playback_rate);
        if (playerLineRate === null || playerLineRate === undefined) {
            playerLineRate = initialSettings.playerLineSpeed;
            handlePlayerLineSpeedChange(playerLineRate); //???
        } else {
            setPlayerLineSpeed(parseFloat(playerLineRate));
        }

        let playerLineVolume = fetchDataFromLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.player_line_playback_volume);
        if (playerLineVolume === null || playerLineVolume === undefined) {
            playerLineVolume = initialSettings.playerLineVolume;
            handlePlayerLineVolumeChange(playerLineVolume); //???
        } else {
            setPlayerLineVolume(parseFloat(playerLineVolume));
        }

        let whisperVolume = fetchDataFromLocalStorage(
            storageDataAttributes.session_data_prefix,
            storageDataAttributes.session_data_keys.whisper_playback_volume);
        if (whisperVolume === null || whisperVolume === undefined) {
            whisperVolume = initialSettings.whisperVolume;
            handleWhisperVolumeChange(whisperVolume); //???
        } else {
            setWhisperVolume(parseFloat(whisperVolume));
        }
    }, []);

    // #region Email form
    const handleCloseEmailForm = () => setIsShowEmailFormModalOpen(false);
    const handleShowEmailForm = () => setIsShowEmailFormModalOpen(true);
    const handleShareHomework = () => {
        if (emailInputRef.current) {
            const emailToSend = emailInputRef.current.value;
            const name = nameInputRef.current.value;
            const isUnlistedVideo = unlistedInputRef.current.checked;
            setIsShowEmailFormModalOpen(false);
            doShareHomework(videoData, captions, recordedChunks, clipRange, settings.playerLineSpeed, settings.yourLineSpeed, name, emailToSend, isUnlistedVideo);
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

    const handleClipRangeChange = (newClipIndexRange) => {
        onClipIndexRangeChange(newClipIndexRange);
    }

    const determineClipMode = (captions, clipIndexRange) => {
        let result =
            captions?.length > 0
            &&
            ((clipIndexRange.startIndex ?? 0) > 0
                ||
                ((clipIndexRange.endIndex ?? (captions.length - 1)) < captions.length - 1));
        return result;
    }

    const handleSrtOpen = (captions) => {
        setSrtCaptionsData(captions);  //???
    }

    const handleUploadCaptions = async () => {
        const result = await captionsSaveToStorage(videoData.videoId, videoData.learningLanguage, currentUser.username, captions);
        if (result) {
            alert(`Captions for "${videoData.title}" uploaded successfully!`);
        } else {
            alert(`Error uploading Captions for "${videoData.title}"!`);
        }
    }

    const handleSrtSave = () => {
        let fileName = null;
        try {
            fileName = saveCaptionObjectsToFile(captions, videoData.title);
        } catch (error) {

        }
        if (fileName) {
            alert(`File "${fileName}" saved successfully!`);
        } else {
            alert('Error saving file.');
        }
    }

    const handleSaveExerciseWrapper = () => {
        doSaveExerciseToFile(videoData, captions, recordedChunks, clipIndexRange, settings.playerLineSpeed, settings.yourLineSpeed)
    }

    return (
        <>
            {currentUser?.role == 'Admin' && isRunningOnBigScreen &&
                <AdminArea
                    onSrtOpen={handleSrtOpen}
                    onSrtSave={handleSrtSave}
                    onUploadCaptions={handleUploadCaptions}
                />
            }
            <div id="PlaybackSettingsArea" className="row mb-3 col-12 col-md-12 col-lg-9">
                <PlaybackSettings
                    settings={settings}
                    updateSetting={updateSetting}

                    onLoopChange={handleLoopChange}
                    onShowCaptionsChange={handleShowCaptionsChange}
                    onPlayerLineSpeedChange={handlePlayerLineSpeedChange}
                    onPlayerLineVolumeChange={handlePlayerLineVolumeChange}
                    onYourLineSpeedChange={handleYourLineSpeedChange}
                    onWhisperVolumeChange={handleWhisperVolumeChange}
                    onImbededCaptionBluringChange={handleImbededCaptionBluringChange}
                    onAllowCameraChange={handleAllowCameraChange} />
            </div>

            <ControlsArea
                exerciseStatus={exerciseStatus}
                isClipMode={determineClipMode(captions, clipIndexRange)}
                recordedChunks={recordedChunks}
                isCameraAllowed={settings.isCameraAllowed}

                onStartPlay={handleStartPlay}
                onStopPlay={handleStopPlay}
                onExit={onExit}
                onSaveRecording={handleSaveRecording}
                onStartRecording={handleStartRecording}
                onShareExercise={handleShareExerciseWrapper}
                onSaveExercise={handleSaveExerciseWrapper}
                onClearRecording={handleClearRecording}
                onRestoreDefaultExercise={handleRestoreDefaultExercise}
            />

            <div id="PlayerBoxArea" className="row col-12 col-md-6">
                {captions &&
                    <PlayerBox ref={playerBoxRef}
                        playerRef={playerRef}
                        id="PlayerBoxComponent"
                        recPlayerRef={recPlayerRef}

                        exerciseStatus={exerciseStatus}
                        videoData={videoData}
                        clipRange={buildClipRange(captions, clipIndexRange)}

                        isMuted={currentVolume === 0}
                        isLoop={settings.isLoop}
                        isImbededCaptionsBlured={settings.isImbededCaptionsBlured}
                        isCameraAllowed={settings.isCameraAllowed}
                        currentPlaybackRate={currentPlaybackRate}
                        currentVolume={currentVolume}

                        onStopRecording={handleSaveRecording}
                        onProgress={handleOnProgress}
                        onPlayingEnd={handlePlayingEnd}
                    />
                }
                {settings.toShowCaptions && <CaptionBox caption={currentCaption} />}


                <CaptionsView ref={captionViewRef}
                    videoData={videoData}
                    captions={captions}
                    currentUser={currentUser}
                    position={position}
                    hasRecordedChunks={recordedChunks?.length > 0}
                    clipIndexRange={clipIndexRange}

                    srtCaptionsData={srtCaptionsData}

                    onClipIndexRangeChange={handleClipRangeChange}
                    onCurrentCaptionChange={setPlayingCaption}
                    onUpdateCaptions={handleUpdateCaptions}
                />
            </div>

            <Modal show={isShowEmailFormModalOpen} >
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
