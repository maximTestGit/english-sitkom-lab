import React, { useState, useEffect } from "react";
import VideoRow from "./videoRow";
import { fetchData, dataPrefixes } from './helpers/fetchData.js';

const VideoList = ({ selectVideo }) => {
    const default_selected_playList_id = 'PLuMmOfYkVMQ5ZRyYh6tWZm1XTCP-MG1BN';
    const [videos, setVideos] = useState([]);
    const [selectedPlayListId, setSelectedPlayListId] = useState(default_selected_playList_id);

    useEffect(() => {
        const fetchVideos = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content?playlistId=${selectedPlayListId}`;
            const videos = await fetchData(dataPrefixes.videoList_data_prefix, 'videoList', url, 60 * 60); // Cache for 1 hour
            setVideos(videos);
        };
        fetchVideos();
    }, [selectedPlayListId]);

    return (
        <>
            <div className="row border border-2 p-1 rounded-3 mb-2 bg-secondary text-white">
                <div className="col-3 text-end">
                    <label className="form-select-lg text-end" htmlFor="playlistSelect">Select Playlist:</label>
                </div>
                <div className="col-5">
                    <select className="form-select form-select-lg"
                        value={selectedPlayListId}
                        onChange={(e) => setSelectedPlayListId(e.target.value)}>
                        <option value={default_selected_playList_id} selected >American Sitcoms</option>
                        <option value="PLuMmOfYkVMQ5P4pAqLFQNMfCxoCRCpvTL">English for Kids</option>
                        <option value="PLuMmOfYkVMQ5BVRFMfLKXmnabpNNIr8yX">Hebrew</option>
                    </select>
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
                        <VideoRow key={v.videoId} video={v} selectVideo={selectVideo} />
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default VideoList;
