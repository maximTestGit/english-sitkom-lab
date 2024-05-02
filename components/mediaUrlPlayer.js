import React, { useEffect } from 'react';
import ReactPlayer from 'react-player';

const MediaUrlPlayer = ({ url, exerciseStatus, muted = false, loop,
    playbackRate, volume = 100, progressInterval = 100, onProgress = () => { }, onEnded = () => { },
    width, height, playerRef, zIndex, playing,
    top = 0 }) => {

    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
        }
    }, []);

    return (
        <div position="relative"
            style={
                { 
                    width: {width}, 
                    height: {height}, 
                    backgroundColor: "transparent", 
                }}
            >
            <ReactPlayer ref={playerRef}
                playing={playing}
                muted={muted}
                url={url}
                controls="false"
                progressInterval={progressInterval}
                onProgress={(state) => onProgress(state)}
                onEnded={() => onEnded()}
                loop={loop}
                playbackRate={playbackRate}
                volume={volume / 100}
                width={width}
                height={height}
                zIndex={zIndex}
            />
        </div>
    );
};

export default MediaUrlPlayer;