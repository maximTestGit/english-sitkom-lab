import React, { useState, useEffect } from "react";
import VideoRow from "./videoRow";
import { fetchData, storageDataAttributes } from './helpers/fetchData.js';
import { getPlaylistContentUrl } from './data/configurator';
import { playlistRegistry } from './data/playlistRegistry';
import Dropzone from 'react-dropzone'
import { isRunningOnBigScreen } from './data/configurator';

const VideoList = ({ playlistId, onSelectVideo, onSelectPlaylistId }) => {
    const default_selected_playList_id = playlistRegistry[0].listId;
    const [videos, setVideos] = useState([]);
    const [selectedPlayListId, setSelectedPlayListId] = useState(default_selected_playList_id);

    const setSelectedPlayListIdWrapper = (newSelectedPlayListId) => {
        setSelectedPlayListId(newSelectedPlayListId);
        onSelectPlaylistId(newSelectedPlayListId);
    };

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

    if (playlistId && playlistId != selectedPlayListId) {
        setSelectedPlayListId(playlistId);
        fetchVideos(playlistId);
    }

    useEffect(() => {
        fetchVideos(selectedPlayListId);
    }, [selectedPlayListId]);

    return (
        <>
            <div className="row p-1 rounded-3 mb-2 text-white" style={{ backgroundColor: '#ee3e38' }}>
                <div className="col-3 text-end">
                    <label className="form-select-lg text-end" htmlFor="playlistSelect">Select Playlist:</label>
                </div>
                <div className="col-9 col-md-6 col-lg-4">
                    <select className="form-select form-select-lg"
                        value={selectedPlayListId}
                        onChange={(e) => setSelectedPlayListIdWrapper(e.target.value)}>
                        {playlistRegistry.map((playlist) => (
                            <option key={playlist.listId} value={playlist.listId}>{playlist.listName}</option>
                        ))}
                    </select>
                </div>

                { isRunningOnBigScreen &&
                    <div className="col-3 text-center">
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
            </div>
            <table className="table table-hover table-striped">
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
        </>
    );
};

export default VideoList;
