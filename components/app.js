import React, { useState } from "react";
import Banner from "./banner";
import VideoList from "./videoList";
import ExerciseView from "./exerciseView";

const App = () => {
  const [selectedVideo, setSelectedVideo] = useState();
  const [recording, setRecording] = useState(false);
  const [clearRecord, setClearRecord] = useState(false);

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
        <VideoList selectVideo={setSelectedVideoWrapper}  />
      )}
    </>
  );
};

export default App;
