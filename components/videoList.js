import React, { useState, useEffect } from "react";
import VideoRow from "./videoRow";
import { fetchData, dataPrefixes } from './helpers/fetchData.js';
import { getPlaylistContentUrl } from './data/configurator';
import { playlistRegistry } from './data/playlistRegistry';
import Dropzone from 'react-dropzone'

const VideoList = ({ playlistId, onSelectVideo, onSelectPlaylistId }) => {
    const default_selected_playList_id = playlistRegistry[0].listId;
    const [videos, setVideos] = useState([]);
    const [selectedPlayListId, setSelectedPlayListId] = useState(default_selected_playList_id);

    const setSelectedPlayListIdWrapper = (newSelectedPlayListId) => {
        setSelectedPlayListId(newSelectedPlayListId);
        onSelectPlaylistId(newSelectedPlayListId);
    };

    if (playlistId && playlistId != selectedPlayListId) {
        setSelectedPlayListId(playlistId);
    }

    const fetchVideos = async (playlistId) => {
        let url = getPlaylistContentUrl(playlistId);
        const videos = await fetchData(dataPrefixes.videoList_data_prefix, `videoList%${playlistId}`, url, 60 * 60); // Cache for 1 hour
        setVideos(videos);
    };

    useEffect(() => {
        fetchVideos(selectedPlayListId);
    }, [selectedPlayListId]);

    const selectVideoWrapper = (video) => {
        onSelectVideo(video, selectedPlayListId);
    };

    const openExercise = (file) => {
        const reader = new FileReader();
        reader.onload = function(event) {
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
    return (
        <>
            <div className="row border border-2 p-1 rounded-3 mb-2 bg-danger text-white">
                <div className="col-3 text-end">
                    <label className="form-select-lg text-end" htmlFor="playlistSelect">Select Playlist:</label>
                </div>
                <div className="col-4">
                    <select className="form-select form-select-lg"
                        value={selectedPlayListId}
                        onChange={(e) => setSelectedPlayListIdWrapper(e.target.value)}>
                        {playlistRegistry.map((playlist) => (
                            <option key={playlist.listId} value={playlist.listId}>{playlist.listName}</option>
                        ))}
                    </select>
                </div>
                <div className="col-1 text-center">
                    <label className="form-select-lg text-center" >OR</label>
                </div>

                <div className="col-4 text-center">
                    <Dropzone onDrop={acceptedFiles => openExercise(acceptedFiles[0])}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <button type="button" class="btn btn-warning btn-lg">Open or Drop File</button>
                                </div>
                            </section>
                        )}
                    </Dropzone>                
                </div>
            </div>
            <table className="table table-hover table-striped">
                <thead>
                    <tr className="container-lg table-secondary">
                        <th className="col-1" >YouTube</th>
                        <th className="col-7" >Exercise</th>
                        <th className="col-4" >Description</th>
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
