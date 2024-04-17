import React from 'react';
import Switch from './switch';

const PlaybackSettings = ({ initLoop, initShowCaptions, initYourLineSourceVolume, onLoopChange, onShowCaptionsChange, onYourLinePlaybackRateChange, onYourLineSourceVolumeChange }) => {
    const handleYourLinePlaybackRateChange = (event) => {
        const newPlaybackRate = parseFloat(event.target.value);
        onYourLinePlaybackRateChange(newPlaybackRate);
    }
    const handleSourceVolumeChange = (event) => {
        const newSourceVolume = parseFloat(event.target.value);
        onYourLineSourceVolumeChange(newSourceVolume);
    }
    return (
        <>
            <div className="col">
                <Switch id="loopPlaySwitch" label="Loop" onChange={onLoopChange} initValue={initLoop} />
            </div>
            <div className="col">
                <Switch id="showCaptionsSwitch" label="Captions" onChange={onShowCaptionsChange} initValue={initShowCaptions} />
            </div>
            <div className="col">
                <select className="form-select form-select-sm"
                    onChange={handleYourLinePlaybackRateChange}>
                    <option value="0.5" selected>Your Playback:</option>
                    <option value="0.4">0.4</option>
                    <option value="0.5">0.5</option>
                    <option value="0.6">0.6</option>
                    <option value="0.7">0.7</option>
                    <option value="0.8">0.8</option>
                    <option value="0.9">0.9</option>
                    <option value="1.0">1.0</option>
                    <option value="2.0">2.0</option>
                    <option value="3.0">3.0</option>
                </select>
            </div>
            <div className="col">
                <select className="form-select form-select-sm"
                    onChange={handleSourceVolumeChange}>
                    <option value={initYourLineSourceVolume} selected>Source Volume:</option>
                    <option value="0.0">mute</option>
                    <option value="1.0">1.0</option>
                    <option value="2.0">2.0</option>
                    <option value="3.0">3.0</option>
                    <option value="4.0">4.0</option>
                    <option value="5.0">5.0</option>
                    <option value="10.0">10.0</option>
                </select>
            </div>
        </>
    );
};

export default PlaybackSettings;