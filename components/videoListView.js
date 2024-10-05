import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import VideoRow from "./videoRow";
import { fetchRetrievePlayistContent } from './helpers/fetchData';
import { playlistRegistry } from './data/playlistRegistry';

const VideoListView = forwardRef(({
    user,
    playlistId,
    onSelectVideo,
    onSelectPlaylistId,
}, ref) => {
    /*
    videos is a list of the following objects:
        description:""
        thumbnail: "https://i.ytimg.com/vi/TDhK5IQq73E/default.jpg"
        title: "כדי לקצר את הסבל שלך"
        videoId: "TDhK5IQq73E"
    */
    const [videos, setVideos] = useState([]);

    const changePlaylistIdWrapper = (newPlaylistId) => {
        onSelectPlaylistId(newPlaylistId);
    };

    const handleSelectVideo = (video) => {
        onSelectVideo(video, playlistId);
    };

    const fetchVideos = async (playlistId, force = false) => {
        const videosData = await fetchRetrievePlayistContent(user, playlistId, force);
        setVideos(videosData);
    };

    useImperativeHandle(ref, () => ({
        fetchVideos
    }));

    useEffect(() => {
        const fetchInitialVideos = async () => {
            await fetchVideos(playlistId, false);
        };
        fetchInitialVideos();
    }, [playlistId]);

    useEffect(() => {
        const fetchUserVideos = async () => {
            await fetchVideos(playlistId, true);
        };
        fetchUserVideos();
    }, [user, user?.username]);
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
            </div>
            <table id="videoListTable" className="table table-hover table-striped">
                <thead>
                    <tr className="container-lg table-secondary">
                        <th className="col-1" >YouTube</th>
                        <th className="col-7" >Exercise</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        videos?.map((v) => (
                            <VideoRow key={v.videoId} video={v} onSelectVideo={handleSelectVideo} />
                        ))
                    }
                </tbody>
            </table>

        </>
    );
});

VideoListView.displayName = 'VideoListView';
export default VideoListView;