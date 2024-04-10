import React, { useState, useEffect } from "react";
import VideoRow from "./videoRow";
import { fetchData } from './helpers/fetchData.js';

const VideoList = ({selectVideo}) => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content`;
            const videos = await fetchData('videos', url, 60*60); // Cache for 1 hour
            setVideos(videos);
        };
        fetchVideos();
    }, []);

    return (
        <>
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>YouTube</th>
                        <th>Exercise</th>
                        <th>Description</th>
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
