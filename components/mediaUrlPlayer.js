import { React, useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

const MediaUrlPlayer = ({ url, exerciseStatus, muted = false, loop,
    playbackRate, volume = 100, progressInterval = 100, onProgress = () => { }, onEnded = () => { },
    width, height, playerRef, zIndex = 9000, playing,
    imbededCaptionBluring = false,
    top = 0 }) => {

    //const [imbededCaptionBluringValue, setImbededCaptionBluringValue] = useState(imbededCaptionBluring);

    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
        }
    }, []);

    return (
        <div position="relative"
            style={
                {
                    width: { width },
                    height: { height },
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

            {imbededCaptionBluring &&
                <div style={{
                    position: 'absolute',
                    bottom: 50,
                    left: 0,
                    right: 0,
                    width: '70%',
                    height: '20%',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(5px)',
                    zIndex: zIndex + 1,
                    margin: 'auto'
                }} />
            }
        </div>
    );
};

export default MediaUrlPlayer;