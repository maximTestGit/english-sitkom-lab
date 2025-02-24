import { React, useState, forwardRef, useEffect, useImperativeHandle } from 'react';
import ExerciseStatus from './data/exerciseStatus';
import { getYoutubeUrl, isRunningOnBigScreen } from './data/configurator';
import WebcamBox from './webcamBox';
import WebcamBorderKeeper from './webcamBorderKeeper';
import MediaUrlPlayer from './mediaUrlPlayer';

const PlayerBox = forwardRef(({
    playerRef,
    recPlayerRef,
    exerciseStatus,
    videoData,
    clipRange,
    isMited,
    isLoop,
    isImbededCaptionsBlured,
    isCameraAllowed,
    currentPlaybackRate,
    currentVolume,
    onStopRecording,
    onProgress,
    onPlayingEnd,
    onRecordingStarted,
    onPlayingStarted,
}, ref) => {
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [recordedChunksUrl, setRecordedChunksUrl] = useState(null);

    const handleStopRecordingWraper = (chunks) => {
        setRecordedChunks(chunks);

        if (chunks?.length > 0) {
            const blob = new Blob(chunks, { type: "video/x-matroska;codecs=avc1,opus" });
            const videoUrl = window.URL.createObjectURL(blob);
            setRecordedChunksUrl(videoUrl);
        }
        onStopRecording(chunks);
    };

    useImperativeHandle(ref, () =>
    ({
        clearRecording() {
            if (recordedChunks?.length > 0) {
                setRecordedChunks([]);
                setRecordedChunksUrl(null);
            }
        }
    })
    );

    useEffect(() => {
        if (videoData.videoRecordedChunks?.length > 0) {
            handleStopRecordingWraper(videoData.videoRecordedChunks);
        }
    }, []);

    const handlePlayingEndWrapper = () => {
        console.log('LingFlix: PlayerBox: Playing ended');
        onPlayingEnd();
    };

    function isYoutubePlaying(exerciseStatus) {
        const result = exerciseStatus === ExerciseStatus.PLAYING
            || exerciseStatus === ExerciseStatus.ORIGIN
            || exerciseStatus === ExerciseStatus.RECORDING
            || exerciseStatus === ExerciseStatus.CAPTION;

        console.log(`LingFlix: PlayerBox: isYoutubePlaying: ${result} (${exerciseStatus})`);
        return result;
    }

    return (
        <div style={{ position: 'relative' }}>
            <div id="ExercisePlayerArea"
                className="pe-none"
            >
                {
                    (recordedChunksUrl
                        && exerciseStatus !== ExerciseStatus.ORIGIN
                        && exerciseStatus !== ExerciseStatus.CAPTION)
                        ?
                        <MediaUrlPlayer
                            playerRef={playerRef}
                            url={recordedChunksUrl}
                            playing={exerciseStatus === ExerciseStatus.PLAYING}
                            exerciseStatus={exerciseStatus}
                            onEnded={onPlayingEnd}
                            clipRange={clipRange}
                            hasRecording={true}
                        />
                        :
                        <MediaUrlPlayer
                            playerRef={playerRef}
                            url={getYoutubeUrl(videoData.videoId)}
                            playing={isYoutubePlaying(exerciseStatus)}
                            exerciseStatus={exerciseStatus}
                            isMited={isMited}
                            playbackRate={currentPlaybackRate}
                            onProgress={(state) => onProgress(state)}
                            onEnded={handlePlayingEndWrapper}
                            volume={currentVolume}
                            isImbededCaptionsBlured={isImbededCaptionsBlured}
                            clipRange={clipRange}
                            hasRecording={false}
                            onPlayingStarted={onPlayingStarted}
                        //onResetStatus={handleResetStatus}
                        />
                }
            </div>

            {isRunningOnBigScreen && isCameraAllowed
                &&
                (recordedChunksUrl && exerciseStatus !== ExerciseStatus.ORIGIN ?
                    <div id="FaceAreaRecorded" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 200,
                        height: 150,
                        backgroundColor: 'transparent',
                        zIndex: 2
                    }}>
                        <MediaUrlPlayer
                            playerRef={recPlayerRef}
                            url={getYoutubeUrl(videoData.videoId)}
                            playing={exerciseStatus === ExerciseStatus.PLAYING
                                || exerciseStatus === ExerciseStatus.ORIGIN
                                || exerciseStatus === ExerciseStatus.RECORDING}
                            isMited={isMited}
                            volume={currentVolume}
                            playbackRate={currentPlaybackRate}
                            width={220}
                            height={170}
                            onProgress={(state) => onProgress(state)}
                            onEnded={() => { }}
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
                        zIndex: 2
                    }}>
                        <WebcamBorderKeeper zIndex={3} />
                        <WebcamBox
                            isLoop={isLoop}
                            cameraWidth={150}
                            exerciseStatus={exerciseStatus}
                            onStopRecording={handleStopRecordingWraper}
                            onRecordingStarted={onRecordingStarted}
                            zIndex={2}
                        />
                    </div>
                )}
        </div>
    );
});

PlayerBox.displayName = 'PlayerBox';
export default PlayerBox;
