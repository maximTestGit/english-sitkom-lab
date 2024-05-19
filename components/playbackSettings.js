import React, { use } from 'react';
import { useState } from 'react';
import Switch from './helpers/switch';

const PlaybackSettings = ({ initLoop, initShowCaptions,
    initYourLineSourceVolume, initYourLinePlaybackRate, initImbededCaptionBluring = false,
    onLoopChange, onShowCaptionsChange, onYourLinePlaybackRateChange, onYourLineSourceVolumeChange,
    onImbededCaptionBluringChange }) => {
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
            <div className="row">
                <div className="col">
                    <Switch id="loopPlaySwitch" label="Loop Playing Erercise" onChange={onLoopChange} initValue={initLoop} />
                </div>
                <div className="col">
                    <Switch id="imbededCaptionBluringSwitch" label="Blure Imbeded Captions" onChange={onImbededCaptionBluringChange} initValue={initImbededCaptionBluring} />
                </div>
                <div className="col">
                    <Switch id="showCaptionsSwitch" label="Show Exercise Captions" onChange={onShowCaptionsChange} initValue={initShowCaptions} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <select className="form-select form-select-sm"
                        onChange={handleYourLinePlaybackRateChange}
                        value={youLinePlaybackRate}>
                        <option value={1.0}>Your Line Speed(normal):</option>
                        <option value={0.5}>0.5</option>
                        <option value={0.6}>0.6</option>
                        <option value={0.7}>0.7</option>
                        <option value={0.8}>0.8</option>
                        <option value={0.9}>0.9</option>
                        <option value={1.0}>normal</option>
                        <option value={2.0}>2.0</option>
                        <option value={3.0}>3.0</option>
                    </select>
                </div>
                <div className="col">
                    <select className="form-select form-select-sm"
                        onChange={handleSourceVolumeChange}
                        value={yourLineSourceVolume}>
                        <option value={1.0}>Your Line Volume(Whisper):</option>
                        <option value={0.0}>Mute</option>
                        <option value={1.0}>Whisper</option>
                        <option value={5.0}>Moderate</option>
                        <option value={10.0}>Loud Whisper</option>
                    </select>
                </div>
            </div>
        </>
    );
};

export default PlaybackSettings;