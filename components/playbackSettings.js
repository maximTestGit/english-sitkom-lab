import React, { useState } from 'react';
import Switch from './helpers/switch';
import { isRunningOnBigScreen } from './data/configurator';
import { t, Trans } from '@lingui/macro';
//import showCaptionsOptions from './data/showCaptionsOptions';

const PlaybackSettings = ({
    settings,
    updateSetting,
    onLoopChange, onShowCaptionsChange, onPlayerLineSpeedChange, onPlayerLineVolumeChange, onYourLineSpeedChange, onWhisperVolumeChange,
    onImbededCaptionBluringChange, onAllowCameraChange
}) => {
    let isLoop = settings.isLoop;
    let showCaptions = settings.showCaptions;
    let whisperVolume = settings.whisperVolume;
    let playerLineSpeed = settings.playerLineSpeed;
    let playerLineVolume = settings.playerLineVolume;
    let yourLineSpeed = settings.yourLineSpeed;
    let isImbededCaptionsBlured = settings.isImbededCaptionsBlured;
    let isCameraAllowed = settings.isCameraAllowed;

    const setYouLinePlaybackRate = (value) => {
        updateSetting('yourLineSpeed', value);
    };
    const setPlayerLineSpeed = (value) => {
        updateSetting('playerLineSpeed', value);
    };
    const setPlayerLineVolume = (value) => {
        updateSetting('playerLineVolume', value);
    };
    const setWhisperVolume = (value) => {
        updateSetting('whisperVolume', value);
    };

    const handleYourLineSpeedChange = (event) => {
        const newPlaybackRate = parseFloat(event.target.value);
        setYouLinePlaybackRate(event.target.value);
        onYourLineSpeedChange(event.target.value);
    }
    const handlePlayerLineSpeedChange = (event) => {
        const newPlaybackRate = parseFloat(event.target.value);
        setPlayerLineSpeed(event.target.value);
        onPlayerLineSpeedChange(event.target.value);
    }
    const handlePlayerLineVolumeChange = (event) => {
        const newPlaybackVolume = parseFloat(event.target.value);
        setPlayerLineVolume(event.target.value);
        onPlayerLineVolumeChange(event.target.value);
    }
    const handleSourceVolumeChange = (event) => {
        //const newSourceVolume = parseFloat(event.target.value);
        setWhisperVolume(event.target.value);
        onWhisperVolumeChange(event.target.value);
    }
    const youTalkSpeedOptions = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const volumeOptions = [
        { value: 0.0, text: t`Mute Player when you talk` },
        { value: 2.0, text: t`Slight Prompt when you talk` },
        { value: 5.0, text: t`Prompt when you talk` },
        { value: 10.0, text: t`Loud Prompt when you talk` },
    ];
    const speedOptions = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

    const handleShowCaptionsChange = (event) => {
        const newShowCaptions = parseInt(event.target.value);
        onShowCaptionsChange(newShowCaptions);
    }
    const showCaptionsOptions = [
        { value: 0, text: t`Show No Subtitles` },
        { value: 1, text: t`Show Original Subtitles` },
        { value: 2, text: t`Show Training Subtitles` },
        { value: 3, text: t`Show Original Subtitle + Next Line` },
    ];

    return (
        <>
            <div className="row mb-2">
                <div className="col-3 col-md-2 col-lg-2">
                    <Switch id="loopPlaySwitch" label={<Trans>Loop</Trans>} onChange={onLoopChange} initValue={isLoop} />
                </div>
                <div className="col-5 col-md-3 col-lg-4">
                    <select className="form-select form-select-sm"
                        onChange={handleShowCaptionsChange}
                        value={showCaptions}>
                        {showCaptionsOptions.map(({ value, text }) => (
                            <option key={value} value={value}>
                                {text}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-4 col-md-3 col-lg-4">
                    <Switch id="imbededCaptionBluringSwitch" label={<Trans>Blure Youtube Captions</Trans>} onChange={onImbededCaptionBluringChange} initValue={isImbededCaptionsBlured} />
                </div>
                {isRunningOnBigScreen &&
                    <div className="col-6 col-md-2 col-lg-1">
                        <Switch id="allowCameraSwitch" label={<Trans>Camera</Trans>} onChange={onAllowCameraChange} initValue={isCameraAllowed} />
                    </div>
                }
            </div>
            <div className="row mb-2">
                <div className="col-4 col-lg-4">
                    <select id="speedWhenYouTalkSelect" className="form-select form-select-sm"
                        onChange={handleYourLineSpeedChange}
                        value={yourLineSpeed}>
                        {youTalkSpeedOptions.map(speed => (
                            <option key={speed} value={speed}>
                                {speed === 1.0
                                    ? t`Normal Speed when you talk`
                                    : t`${speed} of Normal Speed when you talk`}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-4 col-lg-4">
                    <select className="form-select form-select-sm"
                        onChange={handleSourceVolumeChange}
                        value={whisperVolume}>
                        {volumeOptions.map(({ value, text }) => (
                            <option key={value} value={value}>
                                {text}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-4 col-lg-3">
                    <select className="form-select form-select-sm"
                        onChange={handlePlayerLineSpeedChange}
                        value={playerLineSpeed}>
                        {speedOptions.map(speed => (
                            <option key={speed} value={speed}>
                                {speed === 1.0
                                    ? t`Normal Speed Player`
                                    : t`${speed} of Normal Speed Player`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </>
    );
};

export default PlaybackSettings;