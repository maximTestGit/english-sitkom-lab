import { React, useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import BluringPanel from './bluringPanel';
import ExerciseStatus from './data/exerciseStatus';

const MediaUrlPlayer = ({ url, exerciseStatus, muted = false,
    playbackRate, volume = 100, progressInterval = 100, onProgress = () => { }, onEnded = () => { },
    playerRef, zIndex = 9000, playing,
    imbededCaptionBluring = false,
    clipSelection = { start: undefined, end: undefined },
    hasRecording = false,
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
    const [exercisePlayingCounter, setExercisePlayingCounter] = useState(0);

    const resetPlayerPosition = (playerRef, clipSelection) => {
        if (playerRef.current) {
            let start = clipSelection.start ? clipSelection.start : 0;
            playerRef.current.seekTo(start);
        }
    }

    useEffect(() => {
        resetPlayerPosition(playerRef, clipSelection);
        setExercisePlayingCounter(0);
    }, []);

    useEffect(() => {
        if (playing
            && exerciseStatus !== ExerciseStatus.PLAYING) {
            setExercisePlayingCounter(0);
        }
    }, [playing]);

    const onProgressWrapper = (state) => {
        if (!hasRecording) {
            if (state.playedSeconds < clipSelection.start) {
                resetPlayerPosition(playerRef, clipSelection);
            } else if (state.playedSeconds > clipSelection.end) {
                if (exerciseStatus === ExerciseStatus.PLAYING) {
                    setExercisePlayingCounter(exercisePlayingCounter + 1);
                }
                onEnded();
            }
        }
        onProgress(state);
    };
    const onEndedWrapper = () => {
        onEnded();
    }
    const onStartedWrapper = () => {
        console.log('LingFlix: MediaUrlPlayer: onStartedWrapper:', exerciseStatus);
    }
    
    return (
        <div>
            <ReactPlayer ref={playerRef}
                playing={playing}
                muted={muted}
                url={url}
                controls
                progressInterval={progressInterval}
                onProgress={(state) => onProgressWrapper(state)}
                onEnded={() => onEndedWrapper()}
                onStart={() => onStartedWrapper()}
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
            {(exerciseStatus === ExerciseStatus.PLAYING
                ||
                exerciseStatus === ExerciseStatus.STOPPED
            ) &&
                <BluringPanel id="exerciseCounterPanel"
                    bottom={'78%'}
                    startLeft={'75%'}
                    width={'10%'}
                    height={'12%'}
                    backgroundColor={'rgba(0, 0, 0, 0.1)'}
                    backdropFilter={'blur(5px)'}
                    zIndex={9999}
                    hint={exercisePlayingCounter}
                />
            }
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