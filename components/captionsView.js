import React, { useState, useEffect, useCallback } from 'react';
import { fetchData, saveDataToLocalStorage, dataPrefixes } from './helpers/fetchData.js';
import { decodeHtml } from './helpers/presentationUtils.js';
import { getCaptionsUrl } from './data/configurator.js';
import { playlistRegistry } from './data/playlistRegistry';

const CaptionsView = ({ videoData, position, onCurrentCaptionChange, onUpdateCaptions }) => {
    const [captions, setCaptions] = useState([]);
    const [currentCaption, setCurrentCaption] = useState(null);

    const captions_data_expiration = null;
    const setCaptionsWrapper = useCallback((newCaptions) => {
        setCaptions(newCaptions);
        onUpdateCaptions(newCaptions);
    }, [onUpdateCaptions]);

    const determineCaptionChecked = useCallback((caption) => {
        let result = caption && caption.text.startsWith(' ');
        if (videoData && videoData.intervals?.length>0) {
            let interval = null;
            for (let i = 0; i < videoData.intervals.length; i++) {
                interval = videoData.intervals[i];
                const captionStart = parseFloat(caption.start);
                const captionEnd = parseFloat(caption.start) + parseFloat(caption.duration);
                const intervalStart = parseFloat(interval.start);
                const intervalEnd = parseFloat(interval.end);
                if (intervalStart <= captionStart &&
                    intervalEnd >= captionEnd) {
                    break;
                } else {
                    interval = null;
                }
            }
            result = interval !== null && interval.checked;
        }
        return result;
    }, [videoData]);

    useEffect(() => {
        const fetchCaptions = async () => {
            const playlistData = playlistRegistry.find(playlist => playlist.listId === videoData.playlistId);
            let url = getCaptionsUrl(videoData.videoId, playlistData.language);
            const captionData = await fetchData(dataPrefixes.captions_data_prefix, videoData.videoId, url, captions_data_expiration);
            if (captionData) {
                const captionDataWithChecked =
                    captionData
                        .map(caption => ({ ...caption, checked: determineCaptionChecked(caption) }));
                setCaptionsWrapper(captionDataWithChecked);
            }
        };
        fetchCaptions();
    }, [videoData.videoId]);

    const captionChange = (caption) => {
        const updatedCaptions = captions.map(c => {
            if (c.start === caption.target.id) {
                const newChecked = !c.checked;
                if (newChecked) {
                    c.text = ' ' + c.text;
                } else {
                    c.text = c.text.trim();
                }
                return { ...c, checked: newChecked };
            }
            return c;
        });
        setCaptionsWrapper(updatedCaptions);
        saveDataToLocalStorage(dataPrefixes.captions_data_prefix, videoData.videoId, updatedCaptions, captions_data_expiration);
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
                                        onChange={(caption) => captionChange(caption)}
                                    />
                                </td>
                                <td>{parseFloat(caption.start).toFixed(3)}</td>
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
