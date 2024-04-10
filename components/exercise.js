import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import Captions from './captions';
import CaptionBox from './captionBox';

const Exercise = ({ video, selectVideo }) => {
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(null);
    const [position, setPosition] = useState(0);
    const [currentCaption, setCurrentCaption] = useState(null);
    const [loop, setLoop] = useState(false);
    const [showCaptions, setShowCaptions] = useState(true);

    const playerRef = useRef(null);
    const handleOnProgress = (state) => {
        if (position > state.playedSeconds && !loop) {
            setPlaying(false);
        }
        setPosition(state.playedSeconds);
    };
    const setMuteStatus = (caption) => {
        if (caption && caption.checked) {
            if (muted === false) {
                setMuted(true);
            }
        } else if (muted === true) {
            setMuted(false);
        }
    };
    const handleCaptionChange = (caption) => {
        setCurrentCaption(caption);
        setMuteStatus(caption);
    };
    const startPlaying = () => {
        setMuted(false);
        setPlaying(true);
    };
    const stopPlaying = () => {
        setPlaying(false);
        if (muted) {
            setMuted(false);
        }
    };
    const jumpBack = () => {
        if (!loop) {
            playerRef.current.seekTo(0);
        }
    };
    const handleLoopChange = (checked) => {
        console.log(`Loop ${loop} changed to ${checked} current playerRef.current;${playerRef.current.loop}`);
        setLoop(checked);
    };
    const handleShowCaptionsChange = (checked) => {
        setShowCaptions(checked);
    };
    return (
        <>
            <button className="btn btn-success mb-3" onClick={() => selectVideo()}>Back</button>
            <div className="row">
                <div className="col-6">
                    <div className="row">
                        <ReactPlayer ref={playerRef}
                            playing={playing}
                            muted={muted}
                            url={`https://www.youtube.com/embed/${video.videoId}`}
                            controls="false"
                            progressInterval={100}
                            onProgress={(state) => handleOnProgress(state)}
                            onEnded={() => jumpBack()}
                            loop={loop}
                        />
                    </div>

                    {showCaptions && <CaptionBox caption={currentCaption} />}
                    <button className="btn btn-success mb-3 mr-3 ml-3" onClick={() => startPlaying()}>Play</button>
                    <button className="btn btn-success mb-3 mr-3 ml-3" onClick={() => stopPlaying()}>Pause</button>

                </div>

                <div className="col-6">
                    <Captions 
                        video={video} 
                        position={position} 
                        onCaptionChange={handleCaptionChange} 
                        onLoopChange={handleLoopChange} 
                        onShowCaptionsChange={handleShowCaptionsChange}
                    />
                </div>
            </div>
        </>
    );
};

export default Exercise;