import React, { useState, useEffect } from "react";
import VideoRow from "./videoRow.js";
import { fetchData } from './helpers/fetchData.js';
import { getPlaylistContentUrl } from './data/configurator.js';
import { playlistRegistry } from './data/playlistRegistry.js';
import Dropzone from 'react-dropzone';
import { isRunningOnBigScreen } from './data/configurator.js';
import {
    storageDataAttributes,
} from './helpers/storageHelper.js';

const VideoListView = ({ 
    playlistId, 
    currentUser, 
    onSelectVideo, 
    onSelectPlaylistId, 
    onCustomVideoOpen, 
    onExerciseOpen 
}) => {
    /*
    videos is a list of the following objects:
        description:""
        thumbnail: "https://i.ytimg.com/vi/TDhK5IQq73E/default.jpg"
        title: "כדי לקצר את הסבל שלך"
        videoId: "TDhK5IQq73E"
    */
    const [videos, setVideos] = useState([]);

    // Custom Video Open Modal dialog State
    const [isCustomVideoModalOpen, setIsCustomVdeoModalOpen] = useState(false);
    const [customVideoUrl, setCustomVideoUrl] = useState('');
    const [customVideoTitle, Custom] = useState('');

    const changePlaylistIdWrapper = (newPlaylistId) => {
        onSelectPlaylistId(newPlaylistId);
    };

    const handleSelectVideo = (video) => {
        onSelectVideo(video, playlistId);
    };

    const fetchVideos = async (playlistId) => {
        let url = getPlaylistContentUrl(playlistId);
        const videosData = await fetchData(storageDataAttributes.videoList_data_prefix, `videoList%${playlistId}`, url, 60 * 60); // Cache for 1 hour
        setVideos(videosData);
    };

    const openExercise = (file) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const contents = event.target.result;
            try {
                const exercise = JSON.parse(contents);
                onExerciseOpen(exercise);
            } catch (e) {
                console.error('Could not parse JSON: ', e);
            }
        };
        reader.readAsText(file);
    };

    const handleOpenVideoLinkButtonClick = () => {
        setIsCustomVdeoModalOpen(true);
    };

    const handleModalClose = () => {
        setIsCustomVdeoModalOpen(false);
        setCustomVideoUrl('');
    };

    const handleOpenVideo = () => {
        onCustomVideoOpen(customVideoUrl, customVideoTitle);
        handleModalClose();
    };

     useEffect(() => {
        fetchVideos(playlistId);
    }, [playlistId]);

    return (
        <>
            <div id="selectPlaylistArea" className="row p-1 rounded-3 mb-2 text-white" style={{ backgroundColor: '#ee3e38' }}>
                <div id="selectPlaylistDropdownLabel" className="col-2 text-end">
                    <label className="form-select-lg text-end" htmlFor="playlistSelect">Select Playlist:</label>
                </div>
                <div id="selectPlaylistDropdown" className="col-9 col-md-6 col-lg-4">
                    <select className="form-select form-select-lg"
                        value={playlistId}
                        onChange={(e) => changePlaylistIdWrapper(e.target.value)}>
                        {playlistRegistry.map((playlist) => (
                            <option key={playlist.listId} value={playlist.listId}>{playlist.listName}</option>
                        ))}
                    </select>
                </div>

                {isRunningOnBigScreen &&
                    <div id="openExerciseFileButton" className="col-2 text-center">
                        <Dropzone onDrop={acceptedFiles => openExercise(acceptedFiles[0])}>
                            {({ getRootProps, getInputProps }) => (
                                <section>
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <button type="button" className="btn btn-warning btn-lg">Open or Drop File</button>
                                    </div>
                                </section>
                            )}
                        </Dropzone>
                    </div>
                }
                {isRunningOnBigScreen && currentUser?.role === 'Admin' &&
                    <div id="openVideoLinkButton" className="col-2 text-center">
                        <button type="button" className="btn btn-warning btn-lg" onClick={handleOpenVideoLinkButtonClick}>Open video</button>
                    </div>
                }
            </div>
            <table id="videoListTable" className="table table-hover table-striped">
                <thead>
                    <tr className="container-lg table-secondary">
                        <th className="col-1" >YouTube</th>
                        <th className="col-7" >Exercise</th>
                    </tr>
                </thead>
                <tbody>
                    {videos.map((v) => (
                        <VideoRow key={v.videoId} video={v} onSelectVideo={handleSelectVideo} />
                    ))}
                </tbody>
            </table>

            {isCustomVideoModalOpen && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Open Video</h5>
                                <button type="button" className="btn-close" onClick={handleModalClose}></button>
                            </div>
                            <div className="modal-body">
                            <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Enter video title"
                                    value={customVideoTitle}
                                    onChange={(e) => Custom(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter video URL"
                                    value={customVideoUrl}
                                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleOpenVideo}>Open</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoListView;