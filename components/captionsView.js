import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetchData } from './helpers/fetchData';
import { decodeHtml } from './helpers/presentationUtils';
import { getCaptionsUrl } from './data/configurator';
import { getIntervals } from './helpers/exerciseHelper';
import {
    storageDataAttributes,
    saveDataToLocalStorage,
    fetchDataFromLocalStorage,
} from './helpers/storageHelper';

public const CaptionsView = forwardRef(({
    videoData,
    captions,
    currentUser,
    position,
    hasRecordedChunks,
    clipIndexRange,
    onClipIndexRangeChange,
    srtCaptionsData,
    onCurrentCaptionChange,
    onUpdateCaptions,
}, ref) => {
    const [currentCaption, setCurrentCaption] = useState(null);

    const retrieveClipIndexRange = async (videoId, captions) => {
        let result = await fetchDataFromLocalStorage(
            storageDataAttributes.captions_range_data_prefix,
            videoId
        );
        if (!result) {
            result = { startIndex: 0, endIndex: captions.length - 1 };
        }
        await onClipIndexRangeChangeWrapper(captions, result.startIndex, result.endIndex);
        return result;
    }

    const setCaptionsWrapper = async (newCaptions) => {
        await saveDataToLocalStorage(
            storageDataAttributes.captions_data_prefix,
            videoData.videoId,
            newCaptions);
        onUpdateCaptions(newCaptions);
    };

    const onClipIndexRangeChangeWrapper = async (theCaptions, start, end) => {
        if (!theCaptions || theCaptions.length === 0) {
            return;
        }
        if (start === undefined || start === null) {
            start = 0;
        }
        if (end === undefined || end === null) {
            end = theCaptions.length - 1;
        }
        const tempClipIndexRange = { startIndex: start, endIndex: end };
        await saveDataToLocalStorage(
            storageDataAttributes.captions_range_data_prefix,
            videoData.videoId,
            tempClipIndexRange
        );
        onClipIndexRangeChange(tempClipIndexRange);
    }

    const decideCaptionToCheck = (caption) => {
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
    };

    const assignCaptions = async (newCaptions) => {
        let result = null;
        if (newCaptions?.length > 0) {
            result =
                newCaptions
                    .map(caption => ({ ...caption, checked: decideCaptionToCheck(caption) }));
            await setCaptionsWrapper(result);
        }
        return result;
    };

    const retrieveCaptions = async (videoId, captions, toRestoreDefaultExercise = false) => {
        let newCaptions = captions;
        if (toRestoreDefaultExercise || !captions || captions.length === 0) {
            let url = getCaptionsUrl(videoId, videoData.learningLanguage, currentUser?.username);
            newCaptions = await fetchData(
                storageDataAttributes.captions_data_prefix,
                videoData.videoId,
                url,
                null,
                toRestoreDefaultExercise);
            if (toRestoreDefaultExercise) {
                videoData.intervals = getIntervals(newCaptions);
            }
        }
        const result = await assignCaptions(newCaptions);
        return result;
    };

    const resetCheckedCaptions = (captions, captionStart) => {
        let result = [...captions];
        let caption = result.find(c => c.start === captionStart);
        caption.checked = !caption.checked;
        if (caption.checked) {
            caption.text = ' ' + caption.text;
        } else {
            caption.text = caption.text.trim();
        }
        return result;
    };

    const captionChange = async (caption) => {
        const updatedCaptions = resetCheckedCaptions(captions, caption.target.id);
        await setCaptionsWrapper(updatedCaptions);
    }

    // new vdeo opened
    useEffect(() => {
        retrieveCaptions(videoData.videoId, captions)
            .then(captions => {
                if (!clipIndexRange || clipIndexRange.startIndex === undefined) {
                    retrieveClipIndexRange(videoData.videoId, captions);
                }
            });
    }, [videoData.videoId]);

    // if cations are loaded from srt file
    useEffect(() => {
        assignCaptions(srtCaptionsData)
            .then(captions => {
                onClipIndexRangeChangeWrapper(captions);
            });
    }, [srtCaptionsData]);

    useImperativeHandle(ref, () =>
    ({
        handleRestoreDefaultExercise() {
            retrieveCaptions(videoData.videoId, null, true)
                .then(captions => {
                    onClipIndexRangeChangeWrapper(captions);
                });
        }
    })
    );

    useEffect(() => {
        const findCurrentCaption = (captions, position) => {
            let fPosition = parseFloat(position);
            let captionAtPosition = null;
            for (let i = 0; i < captions?.length; i++) {
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
            } else if (currentCaption?.start < 0.1 || currentCaption !== captionAtPosition) { //???
                const now = new Date();
                const currentTime = `${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`;
                console.log(`LingFlix: [${currentTime}] Caption found at position ${position} is ${captionAtPosition.text} start:${captionAtPosition.start}`);
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
            let start = clipIndexRange.startIndex;
            let end = clipIndexRange.endIndex;
            if (position >= start
                && position <= end) {
                start = position;
                end = position;
            } else if (position < start) {
                start = position;
            } else {
                end = position;
            }
            onClipIndexRangeChangeWrapper(captions, start, end);
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
                                    style={{
                                        backgroundColor:
                                            (!clipIndexRange || (clipIndexRange.startIndex <= index && index <= clipIndexRange.endIndex)) ?
                                                'blue' :
                                                'lightgray'
                                    }}
                                >

                                </td>
                                <td className={isPlaying ? 'table-warning' : ''}>
                                    <input id={caption.start}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={caption.checked}
                                        onChange={async (caption) => await captionChange(caption)}
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

});

//export default CaptionsView;
