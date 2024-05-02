import React, { useState, useEffect } from "react";
import Banner from "./banner";
import VideoList from "./videoList";
import ExerciseView from "./exerciseView";
import { cleanUpLocalStorage } from './helpers/fetchData.js';

const App = () => {
  const [videoData, setVideoData] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);


  useEffect(() => {
    async function initApp() {
      await cleanUpLocalStorage();
      setInterval(cleanUpLocalStorage, 30000);
    }
    initApp();
  }, []);

  const setSelectedVideoWrapper = (video, playlistId) => {
    const videoData = {
      videoId: video.videoId,
      title: video.title,
      yourLineRate: video.yourLineRate,
      videoRecordedChunks: video.videoRecordedChunks,
      intervals: video.intervals,
      playlistId: playlistId,
    };
    setVideoData(videoData);
    setSelectedPlaylistIdWrapper(playlistId);
  };

  const handleExerciseExit = () => {
    setVideoData(null);
  }

  const setSelectedPlaylistIdWrapper = (playlistId) => {
    setSelectedPlaylistId(playlistId);
  };

  return (
    <>
      <Banner />
      {videoData ? (
        <ExerciseView 
          videoData={videoData} 
          onExit={handleExerciseExit} 
        />
      ) : (
        <VideoList 
          playlistId={selectedPlaylistId}
          onSelectVideo={setSelectedVideoWrapper} 
          onSelectPlaylistId={setSelectedPlaylistIdWrapper} 
        />
      )}
    </>
  );
};

export default App;
