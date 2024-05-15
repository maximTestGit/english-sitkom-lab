import React, { use } from 'react';
import { useState } from 'react';
import Switch from './helpers/switch';

const PlaybackSettings = ({ initLoop, initShowCaptions,
    initYourLineSourceVolume, initYourLinePlaybackRate,
    onLoopChange, onShowCaptionsChange, onYourLinePlaybackRateChange, onYourLineSourceVolumeChange }) => {
    const [youLinePlaybackRate, setYouLinePlaybackRate] = useState(initYourLinePlaybackRate);
    const [yourLineSourceVolume, setYourLineSourceVolume] = useState(initYourLineSourceVolume);
    const handleYourLinePlaybackRateChange = (event) => {
        const newPlaybackRate = parseFloat(event.target.value);
        setYouLinePlaybackRate(event.target.value);
        onYourLinePlaybackRateChange(event.target.value);
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
            <div className="col">
                <Switch id="loopPlaySwitch" label="Loop" onChange={onLoopChange} initValue={initLoop} />
            </div>
            <div className="col">
                <Switch id="showCaptionsSwitch" label="Captions" onChange={onShowCaptionsChange} initValue={initShowCaptions} />
            </div>
            <div className="col">
                <select className="form-select form-select-sm"
                    onChange={handleYourLinePlaybackRateChange}
                    value={youLinePlaybackRate}>
                    <option value={1.0}>Speed:</option>
                    <option value={0.5}>0.5</option>
                    <option value={0.6}>0.6</option>
                    <option value={0.7}>0.7</option>
                    <option value={0.8}>0.8</option>
                    <option value={0.9}>0.9</option>
                    <option value={1.0}>1.0</option>
                    <option value={2.0}>2.0</option>
                    <option value={3.0}>3.0</option>
                </select>
            </div>
            <div className="col">
                <select className="form-select form-select-sm"
                    onChange={handleSourceVolumeChange}
                    value={yourLineSourceVolume}>
                    <option value={1.0}>Volume:</option>
                    <option value={0.0}>mute</option>
                    <option value={1.0}>1.0</option>
                    <option value={2.0}>2.0</option>
                    <option value={3.0}>3.0</option>
                    <option value={4.0}>4.0</option>
                    <option value={5.0}>5.0</option>
                    <option value={10.0}>10.0</option>
                </select>
            </div>
        </>
    );
};

export default PlaybackSettings;