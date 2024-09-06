import React, { useState, useEffect } from "react";
import Banner from "./banner";
import VideoListView from "./videoListView.js";
import ExerciseView from "./exerciseView";
import TopMenu from './TopMenu';
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
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
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
    const playlistData = playlistRegistry.find(playlist => playlist.listId === playlistId);
    const videoData = {
      videoId: video.videoId,
      title: video.title,
      yourLineRate: video.yourLineRate,
      videoRecordedChunks: homeworkRecordedChunks,
      intervals: video.intervals,
      playlistId: playlistId,
      learningLanguage: playlistData.language,
    };
    setVideoData(videoData);
    setSelectedPlaylistIdWrapper(playlistId);
  };

  const handleExerciseExit = () => {
    setVideoData(null);
  }

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

  const setSelectedPlaylistIdWrapper = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    saveDataToLocalStorage(
      storageDataAttributes.session_data_prefix,
      storageDataAttributes.session_data_keys.playlist_key,
      playlistId);
  };

  const extractVideoIdFromLink = (videoLink) => {
    const videoId = videoLink.split("v=")[1];
    return videoId;
  }

  const handleVideoLinkOpen = (videoLink, title) => {
    let homeworkRecordedChunks = [];
    //const playlistData = playlistRegistry.find(playlist => playlist.listId === playlistId);
    const videoData = {
      videoId: extractVideoIdFromLink(videoLink),
      title: title,
      yourLineRate: null,
      videoRecordedChunks: [],
      intervals: [],
      playlistId: null,
      learningLanguage: getLearningLanguageName(learningLanguage),
    };
    setVideoData(videoData);
    //setSelectedPlaylistIdWrapper(playlistId);
  }

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
          onExit={handleExerciseExit}
          currentUserData={currentUser}
        />
      ) : (
        <>
          <Banner />
          <VideoListView
            playlistId={selectedPlaylistId}
            onSelectVideo={setSelectedVideoWrapper}
            onSelectPlaylistId={setSelectedPlaylistIdWrapper}
            currentUserData={currentUser}
            onVideoLinkOpen={handleVideoLinkOpen}
          />
        </>
      )}
    </div>
  );
};

export default App;
