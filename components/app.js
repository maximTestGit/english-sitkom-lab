import React, { useState, useEffect, useRef, use } from "react";
import Banner from "./banner";
import VideoListView from "./videoListView.js";
import ExerciseView from "./exerciseView";
import { loginUser, fetchRetrievePlayistRegistry, savePlayistToRegistry } from './helpers/fetchData.js';
import { buildExerciseRecordedChunks } from './helpers/exerciseHelper.js';
import {
  storageDataAttributes,
  fetchDataFromLocalStorage,
  saveDataToLocalStorage,
  cleanUpLocalStorage,
  saveLearningLanguageToLocalStorage,
} from './helpers/storageHelper';
import {
  initLearningLanguage,
  getLearningLanguageName,
  extractCulture,
  loginoutEvents
} from './data/configurator';
import TopDropdownMenu from "./topDropdownMenu";
import { onAuthStateChanged } from "firebase/auth";
import { auth, completeUserData } from "./gc/firebase";
import Swal from 'sweetalert2';
//-----------
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { messages as enMessages } from '../src/locales/en/messages';
import { messages as ruMessages } from '../src/locales/ru/messages';
import { messages as afMessages } from '../src/locales/af/messages';
import { messages as heMessages } from '../src/locales/he/messages';
import { messages as ukMessages } from '../src/locales/uk/messages';
//import { messages as arMessages } from '../src/locales/ar/messages';
//import { messages as deMessages } from '../src/locales/de/messages';
import { messages as esMessages } from '../src/locales/es/messages';
//import { messages as frMessages } from '../src/locales/fr/messages';
import { messages as hrMessages } from '../src/locales/hr/messages';
//import { messages as jaMessages } from '../src/locales/ja/messages';
//import { messages as trMessages } from '../src/locales/tr/messages';
//import { messages as zhMessages } from '../src/locales/zh/messages';
import { Trans, t } from '@lingui/macro';
//-----------
i18n.load({
  af: afMessages,
  //ar: arMessages,
  //de: deMessages,
  en: enMessages,
  es: esMessages,
  //fr: frMessages,
  he: heMessages,
  hr: hrMessages,
  //ja: jaMessages,
  ru: ruMessages,
  //tr: trMessages,
  uk: ukMessages,
  //zh: zhMessages,
});
i18n.activate('en');

const App = () => {
  const [videoData, setVideoData] = useState(null);
  const [clipIndexRange, setClipIndexRange] = useState({ startIndex: undefined, endIndex: undefined });
  const [captions, setCaptions] = useState([]);
  const [playlistRegistry, setPlaylistRegistry] = useState([]);
  const [playlistId, setPlaylistId] = useState(null);
  const [user, setUser] = useState(null);
  const [learningLanguage, setLearningLanguage] = useState(null);
  const [uiLanguage, setUiLanguage] = useState('en');
  const [newPlaylistId, setNewPlaylistId] = useState(null);

  const activateUiLanguage = (language) => {
    if (language && language !== i18n.locale) {
      i18n.activate(language);
    }
  };
  useEffect(() => {
    activateUiLanguage(uiLanguage);
  }, [uiLanguage]);

  const handleSetUser = (newUser) => {
    setUser(newUser);
  }

  const handleLoginLogout = async (event, name, language) => {
    switch (event) {
      case loginoutEvents.REGISTER_SUCCESS:
      case loginoutEvents.LOGIN_SUCCESS:
        activateUiLanguage(extractCulture(language));
        Swal.fire({
          title: t`Operation completed successfully`,
          text: t`Hello ${name}`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        break;
      case loginoutEvents.LOGOUT_SUCCESS:
        activateUiLanguage(extractCulture('en-US'));
        const theLearningLanguage = await initLearningLanguage();
        setLearningLanguage(theLearningLanguage);
        break;
      case loginoutEvents.LOGIN_ERROR:
        Swal.fire({
          title: t`Error`,
          text: t`Login ${name} failed`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        break;
      case loginoutEvents.LOGOUT_ERROR:
        Swal.fire({
          title: t`Error`,
          text: t`Logout ${name} failed`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        break;
      case loginoutEvents.REGISTER_ERROR:
        activateUiLanguage(extractCulture(language));
        Swal.fire({
          title: t`Error`,
          text: t`Register ${name} failed, try later`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
        break; default:
        break;
    }
  };

  const exerciseViewRef = useRef(null);
  const videolistViewRef = useRef(null);

  const fetchPlaylists = async (user, learningLanguage, refetchFromSource = false) => {
    const result = await fetchRetrievePlayistRegistry(user, getLearningLanguageName(learningLanguage), refetchFromSource);
    return result;
  };
  const extractUiLanguage = (user) => {
    let result = 'en';
    if (user) {
      result = extractCulture(user.language);
    }
    return result;
  }
  useEffect(() => {
    if (user) {
      const newUiLanguage = extractUiLanguage(user);
      if (newUiLanguage !== uiLanguage) {
        setUiLanguageWrapper(newUiLanguage);
      }
    }
    fetchPlaylists(user, learningLanguage)
      .then((plRegistry) => {
        if (plRegistry) {
          setPlaylistRegistry(plRegistry);
        }
      })
  }, [user, learningLanguage, uiLanguage]);

  // useEffect(() => {
  //   if (playlistId) {
  //     handleReloadPlaylist(false);
  //   }
  // }, [playlistId]);

  useEffect(() => {
    if (playlistRegistry?.length > 0) {
      setPlaylistId(newPlaylistId ?? playlistRegistry[0].listId);
      if (newPlaylistId) {
        setNewPlaylistId(null);
      }
    }
  }, [playlistRegistry]);

  useEffect(() => {
    async function initApp() {
      await cleanUpLocalStorage();
      const theLearningLanguage = await initLearningLanguage();
      setLearningLanguage(theLearningLanguage);
      const plRegistry = await fetchPlaylists(user, theLearningLanguage);
      if (plRegistry) {
        setPlaylistRegistry(plRegistry);
      }
      setInterval(cleanUpLocalStorage, 30000);
      let playlistId = await fetchDataFromLocalStorage(
        storageDataAttributes.session_data_prefix,
        storageDataAttributes.session_data_keys.playlist_key,
        null);
      if (playlistId) {
        setPlaylistId(playlistId);
      } else if (plRegistry?.length > 0) {
        setPlaylistId(plRegistry[0].listId);
      }
      onAuthStateChanged(auth, (theUser) => {
        if (theUser) {
          completeUserData(theUser)
            .then(() => {
              handleSetUser(theUser);
            })
            .catch((error) => {
              console.error("Error completing user data:", error);
            });
        } else {
          handleSetUser(null);
        }
      });

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

  const handleSelectPlaylistId = (playlistId) => {
    setPlaylistId(playlistId);
    saveDataToLocalStorage(
      storageDataAttributes.session_data_prefix,
      storageDataAttributes.session_data_keys.playlist_key,
      playlistId);
  };

  //#endregion simple handlers

  //#region exercise handlers
  const extractVideoIdFromUrl = (videoUrl) => {
    let videoId = null;
    const url = new URL(videoUrl);
    if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (url.searchParams.has("v")) {
      videoId = url.searchParams.get("v");
    } else if (url.pathname.includes("embed/")) {
      videoId = url.pathname.split("/embed/")[1];
    } else if (url.pathname.includes("shorts/")) {
      videoId = url.pathname.split("/shorts/")[1];
    } else if (url.pathname.includes("watch")) {
      videoId = url.searchParams.get("v");
    } else {
      const paths = url.pathname.split("/");
      videoId = paths[paths.length - 1];
    }
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
    handleSelectPlaylistId(videoData.playlistId);
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
    if (videoData.playlistId) {
      handleSelectPlaylistId(videoData.playlistId);
    }
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
    if (response) {
      result = true;
    }
    else {
      handleLogout();
    }
    return result;
  }

  //#endregion login handlers

  //#region .srt handlers
  const handleSrtUpload = () => {
    exerciseViewRef.current?.handleSrtUpload();
  }
  const handleSrtOpen = (captions) => {
    exerciseViewRef.current?.handleSrtOpen(captions);
  }
  const handleSrtSave = () => {
    exerciseViewRef.current?.handleSrtSave();
  }
  //#region .srt handlers
  const handleReloadPlaylist = async (refetch = true) => {
    //await cleanUpLocalStorage(true);
    await videolistViewRef.current?.fetchVideos(playlistId, refetch);
  }
  const handleSavePlaylist = async (playlistId, playlistName) => {
    const playlistData = {
      id: playlistId,
      name: playlistName,
      language: getLearningLanguageName(learningLanguage),
    };
    await savePlayistToRegistry(user, playlistData)
      .then(result => {
        if (result) {
          fetchPlaylists(user, learningLanguage, true)
            .then((plRegistry) => {
              if (plRegistry) {
                setPlaylistRegistry(plRegistry);
                setNewPlaylistId(playlistId);
              }
              Swal.fire({
                title: `Playlist "${playlistName}" saved successfully!`,
                icon: 'success',
                confirmButtonText: 'OK'
              });
            });

        } else {
          Swal.fire({
            title: `Error saving playlist "${playlistName}"!`,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }

      });
  }
  const handleLearningLanguageChange = (newLearningLanguage) => {
    console.log(`LingFlix: handleLearningLanguageChange old: ${learningLanguage}, new: ${newLearningLanguage}`);
    setLearningLanguage(newLearningLanguage);
    saveLearningLanguageToLocalStorage(newLearningLanguage);
    //setPlaylistId(null);
  }
  const handleUILanguageChange = (newUILanguage) => {
    console.log(`LingFlix: handleUILanguageChange old: ${uiLanguage}, new: ${newUILanguage}`);
    const uiCulture = extractCulture(newUILanguage);
    setUiLanguageWrapper(uiCulture);
    //saveUILanguageToLocalStorage(newUILanguage);
  }
  const setUiLanguageWrapper = (newUiLanguage) => {
    setUiLanguage(newUiLanguage);
  }

  return (
    <I18nProvider i18n={i18n}>
      <div>
        <TopDropdownMenu
          user={user}
          videoData={videoData}
          learningLanguage={learningLanguage}
          uiLanguage={uiLanguage}
          onCustomVideoOpen={handleCustomVideoOpen}
          onExerciseOpen={handleExerciseOpen}
          onGoHome={handleExerciseExit}
          onSrtOpen={handleSrtOpen}
          onSrtUpload={handleSrtUpload}
          onSrtSave={handleSrtSave}
          onReloadPlaylist={handleReloadPlaylist}
          onSavePlaylist={handleSavePlaylist}
          onLearningLanguageChange={handleLearningLanguageChange}
          onUILanguageChange={handleUILanguageChange}
          onLoginLogout={handleLoginLogout}
        />
        {videoData ? (
          <ExerciseView ref={exerciseViewRef}
            user={user}
            learningLanguage={learningLanguage}
            uiLanguage={uiLanguage}
            videoData={videoData}
            playlistData={playlistRegistry.find(playlist => playlist.listId === videoData.playlistId)}
            captions={captions}
            clipIndexRange={clipIndexRange}
            onExit={handleExerciseExit}
            onClipIndexRangeChange={handleClipIndexRangeChange}
            onUpdateCaptions={handleUpdateCaptions}
          />
        ) : (
          <>
            <Banner />
            <VideoListView ref={videolistViewRef}
              user={user}
              playlistId={playlistId}
              playlistRegistry={playlistRegistry}
              onSelectVideo={handleSelectedVideo}
              onSelectPlaylistId={handleSelectPlaylistId}
              learningLanguageName={getLearningLanguageName(learningLanguage)}
            />
          </>
        )}
      </div>
    </I18nProvider>
  );
};

export default App;


