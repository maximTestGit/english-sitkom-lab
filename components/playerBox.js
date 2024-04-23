import React from 'react';
import ReactPlayer from 'react-player';
import WebcamStreamCapture from './webcamStreamCapture';
import styles from './styles/playerBox.module.css';
import ExerciseStatus from './data/exerciseStatus';
import {getYoutubeUrl} from './data/configurator.js';

const PlayerBox = ({ playerRef, video, exerciseStatus,
    muted, loop, playbackRate, currentVolume,
    handleOnProgress, handlePlayingEnd, handleStopRecording,
    cameraWidth=150 }) => 
{
    const handleStopRecordingWraper = (recordedChunks) => {
        handleStopRecording(recordedChunks);
    };
    return (
        <div id="PlayerArea" className="row border border-secondary" style={{ position: 'relative' }}>
            <div className="pe-none">
            <ReactPlayer ref={playerRef}
                playing={exerciseStatus === ExerciseStatus.PLAYING ||
                         exerciseStatus === ExerciseStatus.RECORDING}
                muted={muted}
                url={getYoutubeUrl(video.videoId)}
                controls="false"
                progressInterval={100}
                onProgress={(state) => handleOnProgress(state)}
                onEnded={() => handlePlayingEnd()}
                loop={loop}
                playbackRate={playbackRate}
                volume={currentVolume / 100}
                width="100%"
            />
            </div>
            <div id="WebcamArea" style={{
                    position: 'absolute',
                    top: 0,
                    left: -11,
                    width: {cameraWidth},
                    backgroundColor: 'transparent',
                    zIndex: 9990
                }}>
                <WebcamStreamCapture
                    width={cameraWidth}
                    recording={exerciseStatus === ExerciseStatus.RECORDING}
                    clearRecord={false}
                    onEndCapturing={handleStopRecordingWraper}
                />
            </div>
            <div id="StatusLabelArea" style={{
                position: 'absolute',
                top: cameraWidth*0.7-8,
                left: 10,
                width: cameraWidth*0.8,
                height: '25px',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}>
                {exerciseStatus === ExerciseStatus.RECORDING ?
                    (
                        <label className={styles.blinking}>Recording...</label>
                    ) : (
                        <label className={styles.dark}>Camera View</label>
                    )}
            </div>
        </div>
    );
};

export default PlayerBox;