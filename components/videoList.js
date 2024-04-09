import React, { useState, useEffect } from "react";
import VideoRow from "./videoRow";

const VideoList = ({selectVideo}) => {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            let url = `https://us-central1-youtube-project-404109.cloudfunctions.net/function-get-playlst-content`;
            const response = await fetch(url);
            const videos = await response.json();
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
