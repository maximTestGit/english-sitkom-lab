import React, { useState, useEffect } from "react";
import Banner from "./banner";
import VideoList from "./videoList";
import ExerciseView from "./exerciseView";
import { cleanUpLocalStorage, fetchDataFromLocalStorage, saveDataToLocalStorage, storageDataAttributes } from './helpers/fetchData.js';
import { buildExerciseRecordedChunks } from './helpers/exerciseHelper.js';

const App = () => {
  const [videoData, setVideoData] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);


  useEffect(() => {
    async function initApp() {
      await cleanUpLocalStorage();
      setInterval(cleanUpLocalStorage, 30000);
      let playlistId = await fetchDataFromLocalStorage(
        storageDataAttributes.session_data_prefix, 
        storageDataAttributes.session_data_keys.playlist_key, 
        null);
      if (playlistId) {
        setSelectedPlaylistId(playlistId);
      }
    }
    initApp();
  }, []);

  const setSelectedVideoWrapper = (video, playlistId) => {
    let homeworkRecordedChunks = [];
    if (video.videoRecordedChunks?.length > 0) {
      homeworkRecordedChunks = buildExerciseRecordedChunks(video.videoRecordedChunks);
    }
    const videoData = {
      videoId: video.videoId,
      title: video.title,
      yourLineRate: video.yourLineRate,
      videoRecordedChunks: homeworkRecordedChunks,
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
    saveDataToLocalStorage(
      storageDataAttributes.session_data_prefix, 
      storageDataAttributes.session_data_keys.playlist_key, 
      playlistId);
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
