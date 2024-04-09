import React, { useState } from "react";
import Banner from "./banner";
import VideoList from "./videoList";
import Exercise from "./exercise";

const App = () => {
  const [selectedVideo, setSelectedVideo] = useState();

  const setSelectedVideoWrapper = (video) => {
    setSelectedVideo(video);
  };



  return (
    <>
      <Banner />
      {selectedVideo ? (
        <Exercise video={selectedVideo} selectVideo={setSelectedVideoWrapper}/>
      ) : (
        <VideoList selectVideo={setSelectedVideoWrapper} />
      )}
    </>
  );
};

export default App;
