import React, { useState, useEffect } from 'react';
import { fetchData } from './helpers/fetchData.js';
import { decodeHtml } from './helpers/presentationUtils.js';
import Switch from './switch';

const Captions = ({ video, position, onCaptionChange, onLoopChange, onShowCaptionsChange }) => {
    const [captions, setCaptions] = useState([]);
    const [selectedCaption, setSelectedCaption] = useState(null);

    useEffect(() => {
        const fetchCaptions = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${video.videoId}`;
            const captionData = await fetchData('captions', url);
            setCaptions(captionData);
        };
        fetchCaptions();
    }, [video.videoId]);
    
    let fPosition = parseFloat(position);
    return (
        <>
            {/* <p>Current position: {parseFloat(position).toFixed(3)}</p> */}
            <div class="container">
                <div class="row">
                    <div class="col">
                    <Switch id="loopPlaySwitch" label="Loop" onChange={onLoopChange} />                    
                    </div>
                    <div class="col">
                    <Switch id="showCaptionsSwitch" label="Captions" onChange={onShowCaptionsChange} />                    
                    </div>
                    <div class="col">
                    </div>
                </div>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Checked</th>
                        <th>Start(sec)</th>
                        <th>Text</th>
                    </tr>
                </thead>
                <tbody>
                    {captions && captions.map((caption) => {
                        let start = parseFloat(caption.start);
                        let duration = parseFloat(caption.duration);
                        let isPlaying = fPosition >= start && fPosition < start + duration;
                        if (isPlaying && selectedCaption !== caption) {
                            setSelectedCaption(caption)
                            onCaptionChange(caption);
                        }
                        return (
                            <tr key={caption.start} className={isPlaying ? 'table-warning' : ''}>
                                <td>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={caption.checked}
                                        onChange={() => caption.checked = !caption.checked}
                                    />
                                </td>
                                <td>{caption.start}</td>
                                <td>{decodeHtml(caption.text)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );

};

export default Captions;
