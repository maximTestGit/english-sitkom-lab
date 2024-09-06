import React, { useState, useEffect, useCallback } from 'react';
import { fetchData } from './helpers/fetchData.js';
import { decodeHtml } from './helpers/presentationUtils.js';
import { getCaptionsUrl } from './data/configurator.js';
import { playlistRegistry } from './data/playlistRegistry';
import {
    storageDataAttributes,
    saveDataToLocalStorage,
} from './helpers/storageHelper';

const CaptionsView = ({
    videoData,
    position,
    onCurrentCaptionChange,
    onUpdateCaptions,
    restoreDefaultExercise,
    afterRestoreDefaultExercise,
    onChangeClipSelection,
    hasRecordedChunks,
    loadedCaptionsData = null,
    currentUserData,
}) => {
    const [captions, setCaptions] = useState([]);
    const [currentCaption, setCurrentCaption] = useState(null);
    const [captionsRange, setCaptionsRange] = useState({ startIndex: undefined, endIndex: undefined });
    const [currentUser, setCurrentUser] = useState(currentUserData);

    const captions_data_expiration = null;
    const setCaptionsWrapper = useCallback((newCaptions) => {
        setCaptions(newCaptions);
        onUpdateCaptions(newCaptions);
        setClipRangeWrapper(newCaptions, 0, newCaptions.length - 1);
    }, [onUpdateCaptions]);

    const setClipRangeWrapper = (theCaptions, start, end) => {
        let startTime = start == 0 ? 0 : theCaptions[start].start;
        let endTime = parseFloat(theCaptions[end].start) + parseFloat(theCaptions[end].duration);
        setCaptionsRange({ startIndex: start, endIndex: end });
        if (onChangeClipSelection) {
            let clipSelection = { start: startTime, end: endTime };
            onChangeClipSelection(clipSelection);
        }
    }

    const determineCaptionChecked = useCallback((caption) => {
        let result = caption && caption.text?.startsWith(' ');
        if (videoData && videoData.intervals?.length > 0) {
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
        setCurrentUser(currentUserData);
    }, [currentUserData]);

    useEffect(() => {
        const fetchCaptions = async () => {
            const playlistData = playlistRegistry.find(playlist => playlist.listId === videoData.playlistId);
            let url = getCaptionsUrl(videoData.videoId, videoData.learningLanguage, currentUser?.username);
            const captionData =
                loadedCaptionsData
                ||
                await fetchData(
                    storageDataAttributes.captions_data_prefix,
                    videoData.videoId,
                    url,
                    captions_data_expiration,
                    restoreDefaultExercise);
            if (restoreDefaultExercise) {
                afterRestoreDefaultExercise();
            }
            if (captionData) {
                if (loadedCaptionsData) {
                    saveDataToLocalStorage(
                        storageDataAttributes.captions_data_prefix,
                        videoData.videoId,
                        captionData
                    );

                }
                if (captionData?.length > 0) {
                    const captionDataWithChecked =
                        captionData
                            .map(caption => ({ ...caption, checked: determineCaptionChecked(caption) }));
                    setCaptionsWrapper(captionDataWithChecked);
                }
            }
        };
        fetchCaptions();
    }, [videoData.videoId, restoreDefaultExercise, loadedCaptionsData]);

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
        saveDataToLocalStorage(storageDataAttributes.captions_data_prefix, videoData.videoId, updatedCaptions, captions_data_expiration);
    }

    //let fPosition = parseFloat(position);
    useEffect(() => {
        const findCurrentCaption = (captions, position) => {
            let fPosition = parseFloat(position);
            let captionAtPosition = null;
            for (let i = 0; i < captions.length; i++) {
                let caption = captions[i];
                let start = parseFloat(caption.start);
                let duration = parseFloat(caption.duration);
                if (fPosition >= start && fPosition < start + duration) {
                    captionAtPosition = caption;
                    break;
                }
            }
            if (!captionAtPosition) {
                console.log(`LingFlix: No caption found at position ${position}`);
                setCurrentCaption(null)
                onCurrentCaptionChange(null);
            } else if (currentCaption?.start < 0.1 || currentCaption !== captionAtPosition) {
                console.log(`LingFlix: Caption found at position ${position} is ${captionAtPosition.text}`);
                setCurrentCaption(captionAtPosition)
                onCurrentCaptionChange(captionAtPosition);
            }
            return captionAtPosition;
        }

        const handlePositionChange = () => {
            findCurrentCaption(captions, position);
            //console.log(`LingFlix: CaptionsView handlePositionChange position: ${position}, cap: ${cap?.text}, currentCaption: ${currentCaption?.text}`);    
        }

        handlePositionChange();
    }, [captions, currentCaption, onCurrentCaptionChange, position]);

    const handleSelectCaptionClick = (event) => {
        if (hasRecordedChunks) {
            alert('You are not allowed to change Selection, when you have recorded exercise.\nPlease clear recording first.(Click "Clear Record" button)');
        } else {
            const position = parseInt(event.target.id);
            let start = captionsRange.startIndex;
            let end = captionsRange.endIndex;
            if (position >= start
                && position <= end) {
                start = position;
                end = position;
            } else if (position < start) {
                start = position;
            } else {
                end = position;
            }
            setClipRangeWrapper(captions, start, end);
        }
    };

    return (
        <>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Your Line</th>
                        <th>Start (sec)</th>
                        <th>Text</th>
                    </tr>
                </thead>
                <tbody>
                    {captions && captions.map((caption, index) => {
                        let isPlaying = caption == currentCaption;
                        return (
                            <tr key={caption.start} >
                                <td id={index}
                                    onClick={handleSelectCaptionClick}
                                    style={{ backgroundColor: (captionsRange.startIndex <= index && index <= captionsRange.endIndex) ? 'blue' : 'lightgray' }}
                                >

                                </td>
                                <td className={isPlaying ? 'table-warning' : ''}>
                                    <input id={caption.start}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={caption.checked}
                                        onChange={(caption) => captionChange(caption)}
                                    />
                                </td>
                                <td className={isPlaying ? 'table-warning' : ''}>
                                    {parseFloat(caption.start).toFixed(3)}
                                </td>
                                <td className={isPlaying ? 'table-warning' : ''}>
                                    {decodeHtml(caption.text)}\
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );

};

export default CaptionsView;
