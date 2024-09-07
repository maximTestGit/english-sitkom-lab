import { React, useState, useRef, useEffect } from 'react';
import ExerciseStatus from './data/exerciseStatus';
import { getYoutubeUrl, isRunningOnBigScreen } from './data/configurator';
import WebcamBox from './webcamBox';
import WebcamBorderKeeper from './webcamBorderKeeper';
import MediaUrlPlayer from './mediaUrlPlayer';

const PlayerBox = ({ playerRef, recPlayerRef, videoData, exerciseStatus,
    muted, loop, currentPlaybackRate, currentVolume,
    handleOnProgress, handlePlayingEnd, handleStopRecording,
    clearRecordedChunks, afterClearRecordedChunks,
    imbededCaptionBluring = false,
    allowCamera = true,
    clipSelection = { start: undefined, end: undefined },
    //onResetStatus=()=>{},
}) => {

    const [recordedChunks, setRecordedChunks] = useState([]);
    const [recordedChunksUrl, setRecordedChunksUrl] = useState(null);

    const handleStopRecordingWraper = (chunks) => {
        setRecordedChunks(chunks);

        if (chunks?.length > 0) {
            const blob = new Blob(chunks, { type: "video/x-matroska;codecs=avc1,opus" });
            const videoUrl = window.URL.createObjectURL(blob);
            setRecordedChunksUrl(videoUrl);
        }
        handleStopRecording(chunks);
    };

    const doClearRecording = () => {
        if (clearRecordedChunks && recordedChunks?.length > 0) {
            setRecordedChunks([]);
            setRecordedChunksUrl(null);
            afterClearRecordedChunks();
        }
    };

    if (clearRecordedChunks) {
        doClearRecording();
    }

    useEffect(() => {
        if (videoData.videoRecordedChunks?.length > 0) {
            handleStopRecordingWraper(videoData.videoRecordedChunks);
        }
    }, []);

    const handlePlayingEndWrapper = () => {
        console.log('LingFlix: PlayerBox: Playing ended');
        handlePlayingEnd();
    };
    
    // const handleResetStatus = (status) => {
    //     if (status !== exerciseStatus) {
    //         onResetStatus(status);
    //     }
    // };

    return (
        <div style={{ position: 'relative' }}>
            <div id="ExercisePlayerArea"
                className="pe-none"
            >
                {recordedChunksUrl && exerciseStatus !== ExerciseStatus.ORIGIN ?
                    <MediaUrlPlayer playerRef={playerRef}
                        url={recordedChunksUrl}
                        playing={exerciseStatus === ExerciseStatus.PLAYING
                            || exerciseStatus === ExerciseStatus.ORIGIN
                            || exerciseStatus === ExerciseStatus.RECORDING}
                        exerciseStatus={exerciseStatus}
                        //onProgress={(state) => handleOnProgress(state)}
                        onEnded={() => handlePlayingEnd()}
                        clipSelection={clipSelection}
                        hasRecording={true}
                    />
                    :
                    <MediaUrlPlayer playerRef={playerRef}
                        url={getYoutubeUrl(videoData.videoId)}
                        playing={exerciseStatus === ExerciseStatus.PLAYING
                            || exerciseStatus === ExerciseStatus.ORIGIN
                            || exerciseStatus === ExerciseStatus.RECORDING}
                        exerciseStatus={exerciseStatus}
                        muted={muted}
                        playbackRate={currentPlaybackRate}
                        onProgress={(state) => handleOnProgress(state)}
                        onEnded={() => handlePlayingEndWrapper()}
                        volume={currentVolume}
                        imbededCaptionBluring={imbededCaptionBluring}
                        clipSelection={clipSelection}
                        hasRecording={false}
                    //onResetStatus={handleResetStatus}
                    />
                }
            </div>

            {isRunningOnBigScreen && allowCamera
                &&
                (recordedChunksUrl && exerciseStatus !== ExerciseStatus.ORIGIN ?
                    <div id="FaceAreaRecorded" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 200,
                        height: 150,
                        backgroundColor: 'transparent',
                        zIndex: 9990
                    }}>
                        <MediaUrlPlayer
                            playerRef={recPlayerRef}
                            url={getYoutubeUrl(videoData.videoId)}
                            playing={exerciseStatus === ExerciseStatus.PLAYING
                                || exerciseStatus === ExerciseStatus.ORIGIN
                                || exerciseStatus === ExerciseStatus.RECORDING}
                            muted={muted}
                            volume={currentVolume}
                            playbackRate={currentPlaybackRate}
                            width={220}
                            height={170}
                            onProgress={(state) => handleOnProgress(state)}
                            hasRecording={true}
                        />
                    </div>
                    :
                    <div id="FaceAreaView" style={{
                        position: 'absolute',
                        top: -15,
                        left: -62,
                        width: 150,
                        height: 100,
                        backgroundColor: 'transparent',
                        zIndex: 9990
                    }}>
                        <WebcamBorderKeeper zIndex={9999} />
                        <WebcamBox
                            loop={loop}
                            cameraWidth={150}
                            exerciseStatus={exerciseStatus}
                            onStopRecording={handleStopRecordingWraper}
                            zIndex={9991}
                        />
                    </div>
                )}
        </div>
    );
};

export default PlayerBox;

