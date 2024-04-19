import React, { useState, useEffect } from "react";
import Banner from "./banner";
import VideoList from "./videoList";
import ExerciseView from "./exerciseView";
import { cleanUpLocalStorage } from './helpers/fetchData.js';

const App = () => {
  const [selectedVideo, setSelectedVideo] = useState();
  const [recording, setRecording] = useState(false);
  const [clearRecord, setClearRecord] = useState(false);


  useEffect(() => {
    async function initApp() {
      await cleanUpLocalStorage();
      setInterval(cleanUpLocalStorage, 30000);
    }
    initApp();
  }, []);

  const setSelectedVideoWrapper = (video) => {
    setSelectedVideo(video);
    setClearRecord(true);
  };

  return (
    <>
      <Banner />
      {selectedVideo ? (
        <ExerciseView video={selectedVideo} selectVideo={setSelectedVideoWrapper} />
      ) : (
        <VideoList selectVideo={setSelectedVideoWrapper} />
      )}
    </>
  );
};

export default App;
