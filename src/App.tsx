import { useCallback, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import {
  createDetector,
  FaceLandmarksDetector,
  SupportedModels,
} from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMeshModelConfig } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe/types";

export const config: MediaPipeFaceMeshModelConfig = {
  runtime: "mediapipe",
  refineLandmarks: false,
};

const App = () => {
  const webcam = useRef<Webcam>(null);

  const detect = async (
    model: FaceLandmarksDetector,
    config: MediaPipeFaceMeshModelConfig
  ) => {
    if (webcam.current) {
      if (webcam?.current?.video?.readyState === 4) {
        const video = webcam.current.video;
      }
    }
  };

  const runFaceDetect = async () => {
    const model = await createDetector(
      SupportedModels.MediaPipeFaceMesh,
      config
    );
    console.log(model);
    detect(model, config);
  };

  const capture = useCallback(() => {
    const imageSrc = webcam?.current?.getScreenshot();
  }, [webcam]);

  useEffect(() => {
    runFaceDetect();
  }, [webcam]);

  return (
    <div className="App">
      <header className="header">
        <div className="title">webcam face detection app</div>
      </header>
      <Webcam audio={false} ref={webcam} forceScreenshotSourceSize />
      <button onClick={capture}>Capture photo</button>
    </div>
  );
};

export default App;
