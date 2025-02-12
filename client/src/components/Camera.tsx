import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "./ui/button";
import { SwitchCameraIcon, CameraIcon, CircleIcon, XIcon } from "lucide-react";

interface PropsType {
  photo: string | null;
  setPhoto: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function CameraComponent({ photo, setPhoto }: PropsType) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false); // Stato per accendere/spegnere la fotocamera
  const videoConstraints = { width: 460, height: 460, facingMode: facingMode };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const photo = webcamRef.current.getScreenshot(); // Base64 string
      if (photo) {
        setPhoto(photo); // Salva la foto scattata
        setIsCameraActive(false); // Chiudi la fotocamera dopo lo scatto
      }
    }
  }, [setPhoto]);

  const retryPhoto = () => {
    setPhoto(null); // Rimuovi la foto scattata
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const toggleCamera = () => {
    setIsCameraActive((prev) => !prev);
  };

  return (
    <div className="relative my-5">
      {photo ? (
        <img
          src={photo}
          alt="ScreenShot"
          className="rounded-md border w-full"
        />
      ) : (
        <div className="text-center text-muted-foreground">No photos Taken</div>
      )}

      <div className="flex justify-center xl:justify-start gap-4 mt-4">
        {photo ? (
          <Button onClick={retryPhoto}>Retry</Button>
        ) : (
          <Button onClick={toggleCamera}>
            <CameraIcon />
          </Button>
        )}
      </div>

      {isCameraActive && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <div className="relative bg-background rounded-lg shadow-md p-5 max-w-md w-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored={true}
              className="rounded-md border w-full"
            />

            <div className="flex justify-between gap-2 mt-4">
              <Button onClick={toggleFacingMode} size="icon">
                <SwitchCameraIcon />
              </Button>
              <Button onClick={capture}>
                <CircleIcon />
              </Button>
              <Button onClick={toggleCamera} size="icon">
                <XIcon />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
