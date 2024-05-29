import { React, useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import BluringPanel from './bluringPanel';
import ExerciseStatus from './data/exerciseStatus';

const MediaUrlPlayer = ({ url, exerciseStatus, muted = false, loop,
    playbackRate, volume = 100, progressInterval = 100, onProgress = () => { }, onEnded = () => { },
    playerRef, zIndex = 9000, playing,
    imbededCaptionBluring = false,
    //onResetStatus=()=>{},
    top = 0 }) => {

    //const [imbededCaptionBluringValue, setImbededCaptionBluringValue] = useState(imbededCaptionBluring);

    // const handlePlay = () => {
    //     if (exerciseStatus === ExerciseStatus.STOPPED) {
    //         onResetStatus(ExerciseStatus.ORIGIN);
    //     }
    // };

    // const handlePause = () => {
    //     if (exerciseStatus !== ExerciseStatus.STOPPED) {
    //         onResetStatus(ExerciseStatus.STOPPED);
    //     }
    // };

    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(0);
        }
    }, []);

    return (
        <div>
            <ReactPlayer ref={playerRef}
                playing={playing}
                muted={muted}
                url={url}
                controls
                progressInterval={progressInterval}
                onProgress={(state) => onProgress(state)}
                onEnded={() => onEnded()}
                loop={loop}
                playbackRate={playbackRate}
                volume={volume / 100}
                width="100%"
                zIndex={zIndex}
                config={{
                    youtube: {
                        playerVars: {
                            cc_load_policy: 0,
                            controls: 0,
                        },
                    },
                }}
            // onPlay={handlePlay}
            // onPause={handlePause}            
            />

            {imbededCaptionBluring &&
                <BluringPanel id="captionsBluringPanel"
                    //bottom={'1%'}
                    startLeft={'15%'}
                    width={'70%'}
                    height={'20%'}
                    backgroundColor={'rgba(0, 0, 0, 0.1)'}
                    backdropFilter={'blur(5px)'}
                    zIndex={9999}
                    // hint={(exerciseStatus === ExerciseStatus.ORIGIN || exerciseStatus === ExerciseStatus.PLAYING) ?
                    //     "Drag it!" : ""}
                />
            }
        </div>
    );
};

export default MediaUrlPlayer;