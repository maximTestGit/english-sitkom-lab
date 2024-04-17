import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamStreamCapture = ({ width, recording, onEndCapturing, clearRecord }) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);

  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaStreams = useRef([]);

  // #region functions
  const createMediaStream = async (source) => {
    var result = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: 350 },
        height: { max: 270 },
        frameRate: { max: 10 },
      },
      audio: true
    });
    mediaStreams.current.push(result);
    videoStreamRef.current = result;
    console.log('createMediaStream on Stream', source, result);
    return result;
  }

  const handleStartCapture = async () => {
    setRecordedChunks([]);
    setCapturing(true);

    mediaRecorderRef.current =
      new MediaRecorder(
        await createMediaStream('mediaRecorderRef'),
        {
          mimeType: "video/webm;"
        });

    // Listen for incoming video data chunks
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );

    // Start recording
    mediaRecorderRef.current.start();
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
        onEndCapturing([data]);
      }
    },
    [setRecordedChunks, onEndCapturing]
  );

  const handleStopCapture = () => {
    setCapturing(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (videoStreamRef.current) {
      const tracks = videoStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleDownload = () => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });

      const url = URL.createObjectURL(blob);

      // Create a hidden link element to initiate download
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm"; // Set filename
      a.click(); // Trigger download

      window.URL.revokeObjectURL(url);
    } else {
      alert('No records');
    }
  };

  // #endregion functions

  if (recording !== capturing) {
    if (capturing) {
      handleStopCapture()
    } else {
      handleStartCapture();
    }
  }

  if (recordedChunks?.length > 0 && clearRecord) {
    setRecordedChunks([]);
  }

  const stopWebcam = useCallback((source = 'unknown') => {
    const webcam = webcamRef.current;
    if (webcam?.stream) {
      const tracks = webcam.stream.getTracks();
      tracks.forEach(track => { track.enabled = false; track.stop(); });
    }
    if (videoStreamRef.current) {
      const tracks = videoStreamRef.current.getTracks();
      tracks.forEach(track => { track.enabled = false; track.stop(); });
    }
    mediaStreams.current.forEach(stream => {
      console.log('stopWebCam on Stream', source, stream);
      stream.getTracks().forEach(track => {
        console.log('stopping track', track);
        track.enabled = false;
        track.stop();
      });
    });
  }, []);
  const startWebcam = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject = await createMediaStream('startWebCam');
      }
    } else {
      console.log("getUserMedia not supported");
    }
  }, []);
  useEffect(() => {
    return () => {
      stopWebcam('useEffect');
    };
  }, [stopWebcam]);

  return (
    <div
      onClick={handleDownload}
    >
      <div>
        <Webcam
          ref={webcamRef}
          width={width}
        />
      </div>
    </div>
  );
};

export default WebcamStreamCapture;