import React, { useState } from 'react';
import Switch from './helpers/switch';
import { isRunningOnBigScreen } from './data/configurator';

const PlaybackSettings = ({
    settings,
    updateSetting,
    onLoopChange, onShowCaptionsChange, onPlayerLineSpeedChange, onYourLineSpeedChange, onWhisperVoumeChange,
    onImbededCaptionBluringChange, onAllowCameraChange
}) => {
    let isLoop = settings.isLoop;
    let toShowCaptions = settings.toShowCaptions;
    let whisperVoume = settings.whisperVoume;
    let playerLineSpeed = settings.playerLineSpeed;
    let yourLineSpeed = settings.yourLineSpeed;
    let isImbededCaptionsBlured = settings.isImbededCaptionsBlured;
    let isCameraAllowed = settings.isCameraAllowed;

    const setYouLinePlaybackRate = (value) => {
        updateSetting('yourLineSpeed', value);
    };
    const setPlayerLineSpeed = (value) => {
        updateSetting('playerLineSpeed', value);
    };
    const setWhisperVoume = (value) => {
        updateSetting('whisperVoume', value);
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
    const handleSourceVolumeChange = (event) => {
        //const newSourceVolume = parseFloat(event.target.value);
        setWhisperVoume(event.target.value);
        onWhisperVoumeChange(event.target.value);
    }
    return (
        <>
            <div className="row mb-2">
                <div className="col-2">
                    <Switch id="loopPlaySwitch" label="Loop" onChange={onLoopChange} initValue={isLoop} />
                </div>
                <div className="col-3">
                    <Switch id="imbededCaptionBluringSwitch" label="Blure Imbeded Captions" onChange={onImbededCaptionBluringChange} initValue={isImbededCaptionsBlured} />
                </div>
                {isRunningOnBigScreen &&
                    <div className="col-2">
                        <Switch id="allowCameraSwitch" label="Camera" onChange={onAllowCameraChange} initValue={isCameraAllowed} />
                    </div>
                }
                <div className="col-3">
                    <Switch id="showCaptionsSwitch" label="Exercise Captions" onChange={onShowCaptionsChange} initValue={toShowCaptions} />
                </div>
            </div>
            <div className="row mb-2">
                <div className="col-4 col-lg-3">
                    <select className="form-select form-select-sm"
                        onChange={handleYourLineSpeedChange}
                        value={yourLineSpeed}>
                        <option value={0.5}>0.5 of Normal Speed when you talk</option>
                        <option value={0.6}>0.6 of Normal Speed when you talk</option>
                        <option value={0.7}>0.7 of Normal Speed when you talk</option>
                        <option value={0.8}>0.8 of Normal Speed when you talk</option>
                        <option value={0.9}>0.9 of Normal Speed when you talk</option>
                        <option value={1.0} selected>Normal Speed when you talk</option>
                    </select>
                </div>
                <div className="col-4 col-lg-3">
                    <select className="form-select form-select-sm"
                        onChange={handleSourceVolumeChange}
                        value={whisperVoume}>
                        <option value={0.0} selected>Mute Player when you talk</option>
                        <option value={2.0} >Slight Whisper Player when you talk</option>
                        <option value={5.0} >Whisper Player when you talk</option>
                        <option value={10.0}>Loud Whisper Player when you talk</option>
                    </select>
                </div>
                <div className="col-4 col-lg-3">
                    <select className="form-select form-select-sm"
                        onChange={handlePlayerLineSpeedChange}
                        value={playerLineSpeed}>
                        <option value={0.5}>0.5 of Normal Speed Player</option>
                        <option value={0.6}>0.6 of Normal Speed Player</option>
                        <option value={0.7}>0.7 of Normal Speed Player</option>
                        <option value={0.8}>0.8 of Normal Speed Player</option>
                        <option value={0.9}>0.9 of Normal Speed Player</option>
                        <option value={1.0} selected>Normal Speed Player</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default PlaybackSettings;