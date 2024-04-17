import React, { useState, useRef } from 'react';
import CaptionsView from './captionsView';
import CaptionBox from './captionBox.js';
import PlaybackSettings from './playbackSettings.js';
import ConditionalButton from './conditionalButton.js';
import PlayerBox from './playerBox.js';
import ExerciseStatus from './exerciseStatus.js';
import { jumpToStart, handleSaveExercise } from './helpers/exerciseHelper.js';

const ExerciseView = ({ video, selectVideo }) => {
    const default_playback_rate = 1.0;
    const default_volume = 50;
    const default_your_line_volume = 1.0;
    const recording_your_line_volume = 0.0;

    // #region States
    const [muted, setMuted] = useState(null);
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

    const playerRef = useRef(null);
    // #endregion States

    // #region Exercise flow
    const setPlayingCaption = (caption) => {
        setCurrentCaption(caption);
        setYoulinePlaybackRateValue(caption);
        setVolumeValue(caption);
    };

    const setYoulinePlaybackRateValue = (caption) => {
        if (caption && caption.checked) {
            if (playbackRate !== youLinePlaybackRate) {
                setPlaybackRate(youLinePlaybackRate);
            }
        } else if (playbackRate !== default_playback_rate) {
            setPlaybackRate(default_playback_rate);
        }
    };

    const setVolumeValue = (caption) => {
        let newVolume = caption && caption.checked ? yourLineSourceVolume : sourceVolume;
        if (currentVolume !== newVolume) {
            if (currentVolume === 0) {
                setMuted(false);
            }
            setCurrentVolume(newVolume);
            if (newVolume === 0) {
                setMuted(true);
            }
        }
    };

    // #endregion Exercise flow

    // #region Exercise settings
    const handleLoopChange = (checked) => {
        console.log(`Loop ${loop} changed to ${checked} current playerRef.current;${playerRef.current.loop}`);
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
    const handlePlayStop = (status) => {
        if (status === ExerciseStatus.PLAYING) {
            stopPlay();
        } else if (status === ExerciseStatus.STOPPED) {
            startPlay();
        }
    };
    const startPlay = () => {
        jumpToStart(playerRef);
        setCurrentVolume(default_volume);
        setExerciseStatus(ExerciseStatus.PLAYING);
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
            setRecordedChunks([]);
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
    };

    // #endregion Recording

    const handleUpdateCaptions = (captions) => {
        setCaptions(captions);
    };

    return (
        <>
            <div className="row">
                <div id="PlayerControlArea" className="col-6">
                    <div id="ControlsArea" className="row">
                        <div id="ExitButtonArea" className="col">
                            <ConditionalButton className="btn btn-danger mb-3 mr-3 ml-3" onClick={() => selectVideo()}>Back</ConditionalButton>
                        </div>
                        <div className="col"></div>

                        <div id="PlayButtonArea" className="col">
                            <ConditionalButton
                                condition={exerciseStatus !== ExerciseStatus.PLAYING}
                                isDisabled={exerciseStatus === ExerciseStatus.RECORDING}
                                className="btn btn-success mb-3 mr-3 ml-3"
                                onClick={() => startPlay()}
                                antiOnClick={() => stopPlay()}
                                antiChildren={'Stop'}
                            >Play
                            </ConditionalButton>
                        </div>
                        <div id="RecordButtonArea" className="col">
                            <ConditionalButton
                                condition={exerciseStatus !== ExerciseStatus.RECORDING}
                                isDisabled={exerciseStatus === ExerciseStatus.PLAYING}
                                className="btn btn-success mb-3 mr-3 ml-3"
                                antiClassName="btn btn-success mb-3 mr-3 ml-3"
                                onClick={() => handleStartRecording()}
                                antiOnClick={() => handleStopRecording()}
                                antiChildren={'Rec.Stop'} >
                                Rec.Start
                            </ConditionalButton>
                        </div>
                        <div className="col"></div>
                        <div className="col">
                            <ConditionalButton
                                isDisabled={exerciseStatus !== ExerciseStatus.STOPPED}
                                className="btn btn-success mb-3 mr-3 ml-3" antiClassName="btn btn-success mb-3 mr-3 ml-3"
                                onClick={() => handleSaveExercise(video, captions, recordedChunks, default_playback_rate, youLinePlaybackRate)}
                                antiOnClick={() => handleStartRecording()}
                            >
                                Save
                            </ConditionalButton>
                        </div>
                        <div className="col"></div>
                        <div className="col"></div>
                        <div className="col"></div>
                    </div>
                    <div className='row'>
                        <PlayerBox
                            playerRef={playerRef}
                            exerciseStatus={exerciseStatus}
                            muted={muted}
                            video={video}
                            loop={loop}
                            playbackRate={playbackRate}
                            currentVolume={currentVolume}
                            handleOnProgress={handleOnProgress}
                            handlePlayingEnd={handlePlayingEnd}
                            handleStopRecording={handleStopRecording}
                        />
                        {showCaptions && <CaptionBox caption={currentCaption} />}
                    </div>
                </div>
                <div id="PlaybackSettingsAndCaptionsArea" className="col-6">
                    <div id="PlaybackSettingsArea" className="row">
                        <PlaybackSettings
                            initLoop={loop}
                            initShowCaptions={showCaptions}
                            initYourLineSourceVolume={yourLineSourceVolume}
                            onLoopChange={handleLoopChange}
                            onShowCaptionsChange={handleShowCaptionsChange}
                            onYourLinePlaybackRateChange={handleYourLinePlaybackRateChange}
                            onYourLineSourceVolumeChange={handleYourLineSourceVolumeChange}
                        />
                    </div>
                    <div id="CaptionsArea" class="row">
                        <CaptionsView
                            video={video}
                            position={position}
                            onCurrentCaptionChange={setPlayingCaption}
                            onUpdateCaptions={handleUpdateCaptions}
                        />
                    </div>
                </div>
            </div>

        </>
    );
};

export default ExerciseView;