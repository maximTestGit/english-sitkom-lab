import React, { useState, useEffect, useCallback } from 'react';
import { fetchData } from './helpers/fetchData.js';
import { decodeHtml } from './helpers/presentationUtils.js';

const CaptionsView = ({ video, position, onCurrentCaptionChange, onUpdateCaptions=null }) => {
    const [captions, setCaptions] = useState([]);
    const [currentCaption, setCurrentCaption] = useState(null);

    const setCaptionsWrapper = useCallback((newCaptions) => {
        setCaptions(newCaptions);
        if (onUpdateCaptions) {
            onUpdateCaptions(newCaptions);
        }
    }, [onUpdateCaptions]);

    useEffect(() => {
        const fetchCaptions = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${video.videoId}`;
            const captionData = await fetchData('captions', url, null);
            if (captionData) {
                const captionDataWithChecked = 
                    captionData
                        .map(caption => ({...caption, checked: caption && caption.text.startsWith(' ')}));
                setCaptionsWrapper(captionDataWithChecked);
            }
        };
        fetchCaptions();
    }, [video.videoId]);
    
    const captionChange = (caption) => {  
        const updatedCaptions = captions.map(c => {
            if (c.start === caption.target.id) {
                return {...c, checked: !c.checked};
            }
            return c;
        });
        setCaptionsWrapper(updatedCaptions);
        onUpdateCaptions(updatedCaptions);
    }

    let fPosition = parseFloat(position);
    return (
        <>
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
                        if (isPlaying && currentCaption !== caption) {
                            setCurrentCaption(caption)
                            onCurrentCaptionChange(caption);
                        }
                        return (
                            <tr key={caption.start} className={isPlaying ? 'table-warning' : ''}>
                                <td>
                                    <input id={caption.start}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={caption.checked}
                                        onChange={(caption)=> captionChange(caption)}
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

export default CaptionsView;
