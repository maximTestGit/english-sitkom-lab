import React from "react";
import styles from './webcamView.module.css';
import WebcamStreamCapture from './webcamStreamCapture';

const WebcamView = ({ recording, clearRecord }) => {
    const webcamWidth = 210;
    return (
        <div className="row border border-success justify-content-center">
                <div >
                    <WebcamStreamCapture
                        width={webcamWidth}
                        recording={recording}
                        clearRecord={clearRecord}
                    />
                </div>
                <div>
                    {recording ?
                        (
                            <label className={styles.blinking}>Recording...</label>
                        ) : (
                            <label className={styles.info}>Camera View</label>
                        )}
                </div>
        </div>
    );
}

export default WebcamView;