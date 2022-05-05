import { useCallback, useEffect, useRef, useState } from "react";
import "@mediapipe/face_mesh";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import {
  EstimationConfig,
  MediaPipeFaceMeshMediaPipeModelConfig,
} from "@tensorflow-models/face-landmarks-detection";
import { PixelInput } from "@tensorflow-models/face-landmarks-detection/dist/shared/calculators/interfaces/common_interfaces";

import { drawMesh } from "./utils";
import { MediaPipeFaceMeshModelConfig } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe/types";

export const modelConfig: MediaPipeFaceMeshModelConfig = {
  runtime: "tfjs",
  refineLandmarks: true,
};

export const detectorConfig: MediaPipeFaceMeshMediaPipeModelConfig = {
  runtime: "mediapipe",
  solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
  refineLandmarks: true,
};

const estimationConfig: EstimationConfig = {
  flipHorizontal: false,
  staticImageMode: true,
};

export const App = () => {
  const webcam = useRef<Webcam>(null);
  const [camCapture, setCapture] = useState<string>("");
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  const [image, setImage] = useState<PixelInput>();
  const canvas = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runFacemesh = async () => {
    detect();
  };
  const capture = useCallback(() => {
    const imageSrc = webcam?.current?.getScreenshot();

    if (imageSrc) {
      const imageElement = new Image();
      imageElement.src = imageSrc;
      imageElement.width = 640;
      imageElement.height = 480;
      setCapture(imageSrc);
      setImage(imageElement);
    }
  }, [webcam, setImage]);

  const createDetector = async (input: PixelInput) => {
    const detector = await faceLandmarksDetection.createDetector(
      model,
      modelConfig
    );
    const faces = detector.estimateFaces(input, estimationConfig);
    return faces;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const detect = async () => {
    if (webcam.current && webcam.current.video?.readyState === 4) {
      const video = webcam.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcam.current.video.width = videoWidth;
      webcam.current.video.height = videoHeight;
    } else if (image) {
      const faces = createDetector(image);

      faces
        .then((landmarks: faceLandmarksDetection.Face[]) => {
          if (canvas && canvas.current && canvas.current.getContext("2d")) {
            const ctx = canvas.current.getContext("2d");
            canvas.current.width = 640;
            canvas.current.height = 480;
            console.log(landmarks);
            if (ctx) {
              drawMesh(landmarks, ctx);
            }
          }
        })
        .catch((err) => console.warn(err));
    }
  };

  useEffect(() => {
    runFacemesh();
  }, [runFacemesh]);

  return (
    <div className="App">
      <header className="header">
        <div className="title">webcam face detection app</div>
      </header>

      {image === undefined ? (
        <>
          <Webcam
            className="input_video"
            audio={false}
            ref={webcam}
            forceScreenshotSourceSize
            screenshotFormat="image/jpeg"
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 640,
              height: 480,
            }}
          />
          <canvas className="output_canvas" ref={canvas}></canvas>
          <button onClick={capture}>Capture photo</button>
        </>
      ) : (
        <>
          <img src={camCapture} alt="captured webcam" />
          <canvas
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 640,
              height: 480,
            }}
            className="output_canvas"
            ref={canvas}
          ></canvas>
          <button onClick={() => alert("Clicked")} value="Post" />
          <button onClick={() => setImage(undefined)} value="Reset" />
        </>
      )}
    </div>
  );
};
export default App;
