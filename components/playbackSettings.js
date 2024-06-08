import React, { use } from 'react';
import { useState } from 'react';
import Switch from './helpers/switch';

const PlaybackSettings = ({ initLoop, initShowCaptions,
    initYourLineSourceVolume, initPlayerLinePlaybackRate, initYourLinePlaybackRate, initImbededCaptionBluring = false,
    onLoopChange, onShowCaptionsChange, onPlayerLinePlaybackRateChange, onYourLinePlaybackRateChange, onYourLineSourceVolumeChange,
    onImbededCaptionBluringChange }) => {
        const [youLinePlaybackRate, setYouLinePlaybackRate] = useState(initYourLinePlaybackRate);
        const [playerLinePlaybackRate, setPlayerLinePlaybackRate] = useState(initPlayerLinePlaybackRate);
        const [yourLineSourceVolume, setYourLineSourceVolume] = useState(initYourLineSourceVolume);
    const handleYourLinePlaybackRateChange = (event) => {
        const newPlaybackRate = parseFloat(event.target.value);
        setYouLinePlaybackRate(event.target.value);
        onYourLinePlaybackRateChange(event.target.value);
    }
    const handlePlayerLinePlaybackRateChange = (event) => {
        const newPlaybackRate = parseFloat(event.target.value);
        setPlayerLinePlaybackRate(event.target.value);
        onPlayerLinePlaybackRateChange(event.target.value);
    }
    const handleSourceVolumeChange = (event) => {
        //const newSourceVolume = parseFloat(event.target.value);
        setYourLineSourceVolume(event.target.value);
        onYourLineSourceVolumeChange(event.target.value);
    }
    // useEffect(() => {
    //     setYouLinePlaybackRate(initYourLinePlaybackRate);
    //     setYourLineSourceVolume(initYourLineSourceVolume);
    // }, []);
    return (
        <>
            <div className="row mb-2">
                <div className="col-3">
                    <Switch id="loopPlaySwitch" label="Loop Playing" onChange={onLoopChange} initValue={initLoop} />
                </div>
                <div className="col-3">
                    <Switch id="imbededCaptionBluringSwitch" label="Blure Imbeded Captions" onChange={onImbededCaptionBluringChange} initValue={initImbededCaptionBluring} />
                </div>
                <div className="col-3">
                    <Switch id="showCaptionsSwitch" label="Show Exercise Captions" onChange={onShowCaptionsChange} initValue={initShowCaptions} />
                </div>
            </div>
            <div className="row mb-2">
                <div className="col-4 col-lg-3">
                    <select className="form-select form-select-sm"
                        onChange={handleYourLinePlaybackRateChange}
                        value={youLinePlaybackRate}>
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
                        value={yourLineSourceVolume}>
                        <option value={0.0} selected>Mute Player when you talk</option>
                        <option value={2.0} >Slight Whisper Player when you talk</option>
                        <option value={5.0} >Whisper Player when you talk</option>
                        <option value={10.0}>Loud Whisper Player when you talk</option>
                    </select>
                </div>
            <div className="col-4 col-lg-3">
                    <select className="form-select form-select-sm"
                        onChange={handlePlayerLinePlaybackRateChange}
                        value={playerLinePlaybackRate}>
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