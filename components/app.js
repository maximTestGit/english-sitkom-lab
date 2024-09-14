import React, { useState, useEffect } from "react";
import Banner from "./banner";
import VideoListView from "./videoListView.js";
import ExerciseView from "./exerciseView";
import TopMenu from './topMenu';
import { loginUser } from './helpers/fetchData.js';
import { buildExerciseRecordedChunks } from './helpers/exerciseHelper.js';
import { playlistRegistry } from './data/playlistRegistry';
import {
  storageDataAttributes,
  fetchDataFromLocalStorage,
  saveDataToLocalStorage,
  cleanUpLocalStorage,
} from './helpers/storageHelper';
import { learningLanguage, getLearningLanguageName } from './data/configurator';

const App = () => {
  const [videoData, setVideoData] = useState(null);
  const [clipIndexRange, setClipIndexRange] = useState({ startIndex: undefined, endIndex: undefined });
  const [captions, setCaptions] = useState([]);
  const [playlistId, setPlaylistId] = useState(playlistRegistry[0].listId);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function initApp() {
      await cleanUpLocalStorage();
      setInterval(cleanUpLocalStorage, 30000);
      let playlistId = await fetchDataFromLocalStorage(
        storageDataAttributes.session_data_prefix,
        storageDataAttributes.session_data_keys.playlist_key,
        null);
      if (playlistId) {
        setPlaylistId(playlistId);
      }
    }
    initApp();
  }, []);

  //#region simple handlers
  const handleUpdateCaptions = (newCaptions) => {
    setCaptions(newCaptions);
    if (!clipIndexRange || !clipIndexRange.startIndex || !clipIndexRange.endIndex) {
      setClipIndexRange({ startIndex: 0, endIndex: newCaptions.length - 1 });
    }
  }

  const handleClipIndexRangeChange = (newClipIndexRange) => {
    setClipIndexRange(newClipIndexRange);
  }

  const handleSlectPlaylistId = (playlistId) => {
    setPlaylistId(playlistId);
    saveDataToLocalStorage(
      storageDataAttributes.session_data_prefix,
      storageDataAttributes.session_data_keys.playlist_key,
      playlistId);
  };

  //#endregion simple handlers

  //#region exercise handlers
  const extractVideoIdFromUrl = (videoUrl) => {
    const videoId = videoUrl.split("v=")[1];
    return videoId;
  }

  function buildVideoData(video, playlistId = null) {
    const playlistData = playlistId && playlistRegistry.find(playlist => playlist.listId === playlistId);
    let learningLanguageName = playlistData?.language ?? getLearningLanguageName(learningLanguage);
    const videoData = {
      videoId: video.videoId,
      title: video.title,
      playlistId: playlistId,
      learningLanguage: learningLanguageName,
    };
    return videoData;
  }

  const handleSelectedVideo = (video, playlistId) => {
    const videoData = buildVideoData(video, playlistId);
    setVideoData(videoData);
    handleSlectPlaylistId(videoData.playlistId);
  };

  const handleExerciseOpen = (exercise) => {
    let videoData = buildVideoData(exercise, exercise.playlistId);
    let homeworkRecordedChunks = [];
    if (exercise.videoRecordedChunks?.length > 0) {
      homeworkRecordedChunks = buildExerciseRecordedChunks(exercise.videoRecordedChunks);
    }
    const exerciseData = {
      yourLineRate: exercise.yourLineRate,
      videoRecordedChunks: homeworkRecordedChunks,
      intervals: exercise.intervals,
      clipIndexRange: exercise.clipIndexRange,
    };
    videoData = { ...videoData, ...exerciseData };
    setVideoData(videoData);
    setClipIndexRange(videoData.clipIndexRange);
    handleSlectPlaylistId(videoData.playlistId);
  };

  const handleCustomVideoOpen = (videoUrl, title) => {
    const videoData = buildVideoData(
      {
        videoId: extractVideoIdFromUrl(videoUrl),
        title: title,
      });
    setVideoData(videoData);
    //setSelectedPlaylistIdWrapper(playlistId);
  }

  const handleExerciseExit = () => {
    setVideoData(null);
    setClipIndexRange(null);
    setCaptions(null);
  }

  //#endregion exercise handlers

  // #region login handlers
  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
  }

  const handleLogin = async (username, password) => {
    let result = false;
    let response = null;
    try {
      response = await loginUser(username, password);
      console.log('Login successful:', JSON.stringify(response));
    } catch (error) {
      console.error('Login failed:', error);
      handleLogout();
    }
    if (response?.ok) {
      setCurrentUser(response.data);
      setToken(response.data.token);
      result = true;
    }
    else {
      handleLogout();
    }
    return result;
  }

  //#endregion login handlers

  return (
    <div>
      <TopMenu
        onGoHome={handleExerciseExit}
        onLogin={handleLogin}
        onLogout={handleLogout}
        currentUserData={currentUser}
      />
      {videoData ? (
        <ExerciseView
          videoData={videoData}
          captions={captions}
          currentUser={currentUser}
          clipIndexRange={clipIndexRange}
          onExit={handleExerciseExit}
          onClipIndexRangeChange={handleClipIndexRangeChange}
          onUpdateCaptions={handleUpdateCaptions}
        />
      ) : (
        <>
          <Banner />
          <VideoListView
            playlistId={playlistId}
            currentUser={currentUser}
            onSelectVideo={handleSelectedVideo}
            onExerciseOpen={handleExerciseOpen}
            onSelectPlaylistId={handleSlectPlaylistId}
            onCustomVideoOpen={handleCustomVideoOpen}
          />
        </>
      )}
    </div>
  );
};

export default App;

