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

const VideoListView = ({ playlistId, onSelectVideo, onSelectPlaylistId, currentUserData, onVideoLinkOpen }) => {
    const default_selected_playList_id = playlistRegistry[0].listId;
    const [videos, setVideos] = useState([]);
    const [selectedPlayListId, setSelectedPlayListId] = useState(default_selected_playList_id);
    const [currentUser, setCurrentUser] = useState(currentUserData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');

    const setSelectedPlayListIdWrapper = (newSelectedPlayListId) => {
        setSelectedPlayListId(newSelectedPlayListId);
        onSelectPlaylistId(newSelectedPlayListId);
    };

    useEffect(() => {
        setCurrentUser(currentUserData);
    }, [currentUserData]);

    const fetchVideos = async (playlistId) => {
        let url = getPlaylistContentUrl(playlistId);
        const videos = await fetchData(storageDataAttributes.videoList_data_prefix, `videoList%${playlistId}`, url, 60 * 60); // Cache for 1 hour
        setVideos(videos);
    };

    const selectVideoWrapper = (video) => {
        onSelectVideo(video, selectedPlayListId);
    };

    const openExercise = (file) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const contents = event.target.result;
            try {
                const exerciseJson = JSON.parse(contents);
                onSelectVideo(exerciseJson, exerciseJson.playlistId);
            } catch (e) {
                console.error('Could not parse JSON: ', e);
            }
        };
        reader.readAsText(file);
    };

    const handleOpenVideoLinkButtonClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setVideoUrl('');
    };

    const handleOpenVideo = () => {
        onVideoLinkOpen(videoUrl, videoTitle);
        handleModalClose();
    };

    if (playlistId && playlistId != selectedPlayListId) {
        setSelectedPlayListId(playlistId);
        fetchVideos(playlistId);
    }

    useEffect(() => {
        fetchVideos(selectedPlayListId);
    }, [selectedPlayListId]);

    return (
        <>
            <div id="selectPlaylistArea" className="row p-1 rounded-3 mb-2 text-white" style={{ backgroundColor: '#ee3e38' }}>
                <div id="selectPlaylistDropdownLabel" className="col-2 text-end">
                    <label className="form-select-lg text-end" htmlFor="playlistSelect">Select Playlist:</label>
                </div>
                <div id="selectPlaylistDropdown" className="col-9 col-md-6 col-lg-4">
                    <select className="form-select form-select-lg"
                        value={selectedPlayListId}
                        onChange={(e) => setSelectedPlayListIdWrapper(e.target.value)}>
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
                        <VideoRow key={v.videoId} video={v} onSelectVideo={selectVideoWrapper} />
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
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
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter video URL"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
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