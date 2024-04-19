import React, { useState, useEffect, useCallback } from 'react';
import { fetchData, saveDataToLocalStorage } from './helpers/fetchData.js';
import { decodeHtml } from './helpers/presentationUtils.js';
//import { getIntervals } from './helpers/exerciseHelper.js';

const CaptionsView = ({ video, position, onCurrentCaptionChange, onUpdateCaptions }) => {
    const [captions, setCaptions] = useState([]);
    const [currentCaption, setCurrentCaption] = useState(null);

    const setCaptionsWrapper = useCallback((newCaptions) => {
        setCaptions(newCaptions);
        saveDataToLocalStorage('captions', video.videoId, newCaptions, null);
        onUpdateCaptions(newCaptions);
    }, [onUpdateCaptions]);

    const determineCaptionChecked = (caption) => 
    {
        let result = caption && caption.text.startsWith(' ');
        return result;
    };
    
    useEffect(() => {
        const fetchCaptions = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-captions-fetch-json?videoId=${video.videoId}`;
            const captionData = await fetchData('captions', video.videoId, url, 40);
            if (captionData) {
                const captionDataWithChecked = 
                    captionData
                        .map(caption => ({...caption, checked: determineCaptionChecked(caption)}));
                setCaptionsWrapper(captionDataWithChecked);
            }
        };
        fetchCaptions();
    }, [video.videoId]);
    
    const captionChange = (caption) => {  
        const updatedCaptions = captions.map(c => {
            if (c.start === caption.target.id) {
                const newChecked = !c.checked;
                if (newChecked) {
                    c.text = ' ' + c.text;
                } else {
                    c.text = c.text.trim();
                }
                return {...c, checked: newChecked};
            }
            return c;
        });
        setCaptionsWrapper(updatedCaptions);
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
