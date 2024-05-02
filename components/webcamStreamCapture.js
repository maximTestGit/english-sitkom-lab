import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import ExerciseStatus from './data/exerciseStatus';

const WebcamStreamCapture = ({ width, exerciseStatus, onEndCapturing, clearRecord }) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaStreams = useRef([]);
  const instanceId = useRef(Math.random().toString(36).substring(7));

  // #region functions
  const createMediaStream = async (source) => {
    var result = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { max: 900 },
        height: { max: 750 },
        frameRate: { max: 20 },
      },
      audio: true
    });
    mediaStreams.current.push(result);
    videoStreamRef.current = result;
    console.log(`LingFlix[${instanceId.current}]: createMediaStream on Stream`, source, result);
    return result;
  }

  const handleStartRecording = async () => {
    console.log(`LingFlix[${instanceId.current}]: handleStartRecording start, mediaRecorderRef:${mediaRecorderRef?.current}, status:${exerciseStatus}, isRecording:${isRecording}`);
    setRecordedChunks([]);
    setIsRecording(true);

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
    console.log(`LingFlix[${instanceId.current}]: handleStartRecording end, mediaRecorderRef:${mediaRecorderRef?.current?.id}, status:${exerciseStatus}, isRecording:${isRecording}`);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    //stopWebcam('handleStopCapture');
    //mediaRecorderRef.current = null;
    console.log(`LingFlix[${instanceId.current}]: handleStopRecording, status:${exerciseStatus}, isRecording:${isRecording}`);
  };

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks([data]);
        //if (currentRecording) {
          console.log(`LingFlix[${instanceId.current}]: handleDataAvailable on Stream, status:`+
          `mediaRecorderRef:${mediaRecorderRef?.current?.id}, `+
          `state:${mediaRecorderRef?.current?.state}, ${exerciseStatus}, isRecording:${isRecording}, `);
          setIsRecording(false);
          onEndCapturing([data]);
        //}
      }
    },
    [isRecording, onEndCapturing, exerciseStatus]
  );

  // #endregion functions

  if (isRecording !== (exerciseStatus === ExerciseStatus.RECORDING)) {
    if (isRecording) {
      handleStopRecording()
    } else {
      handleStartRecording();
    }
  }

  if (recordedChunks?.length > 0 && clearRecord) {
    setRecordedChunks([]);
  }

  // #region on exit
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
      console.log(`LingFlix[${instanceId.current}]: stopWebCam on Stream`, source, stream);
      stream.getTracks().forEach(track => {
        console.log(`LingFlix[${instanceId.current}]: stopping track`, track);
        track.enabled = false;
        track.stop();
      });
    });
  }, []);

  useEffect(() => {
    console.log(`LingFlix[${instanceId.current}]: webcamStreamCapture, status:${exerciseStatus}, isRecording:${isRecording}, recordedChunks:${recordedChunks?.length}`);
    return () => {
      stopWebcam('useEffect');
    };
  },[]);

  // #endregion on exit

  /*
  const startWebcam = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject = await createMediaStream('startWebCam');
      }
    } else {
      console.log("getUserMedia not supported");
    }
  }, []);

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
  */

  return (
    <>
      <div>
        <Webcam
          ref={webcamRef}
          width={width}
        />
      </div>
    </>
  );
};

export default WebcamStreamCapture;