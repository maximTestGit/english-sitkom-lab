import React from 'react';
import WebcamStreamCapture from './webcamStreamCapture';
import ExerciseStatus from './data/exerciseStatus';
import styles from './styles/playerBox.module.css';


const WebcamBox = ({ cameraWidth, exerciseStatus, onStopRecording, zIndex }) => {
    return (
        <>
            <WebcamStreamCapture
                width={cameraWidth}
                exerciseStatus={exerciseStatus}
                clearRecord={false}
                onEndCapturing={onStopRecording}
            />
            {exerciseStatus === ExerciseStatus.RECORDING &&
                <div id="StatusLabelArea" style={{
                    position: 'absolute',
                    top: cameraWidth * 0.7,
                    left: 80,
                    width: cameraWidth * 0.5,
                    height: '25px',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: {zIndex}
                }}>
                    <label className={styles.blinking}>Record...</label>
                </div>
            }
        </>
    );
};

export default WebcamBox;