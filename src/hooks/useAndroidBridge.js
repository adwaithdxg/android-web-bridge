import { useState, useEffect } from "react";

export const useAndroidBridge = () => {
  const [photos, setPhotos] = useState({});
  const [videoUrl, setVideoUrl] = useState("");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [cameraAvailable, setCameraAvailable] = useState(true);

  // ================= ANDROID CALLBACKS =================
  const recievePhotoFromAndroid = (returnKey, photoUrl, loc) => {
    if (!photoUrl) {
      setError("Invalid photo received");
      return;
    }

    const photoLocation = loc?.latitude && loc?.longitude ? {
      lat: loc.latitude,
      lng: loc.longitude,
      accuracy: loc.accuracy,
    } : null;

    setPhotos((prev) => ({ 
      ...prev, 
      [returnKey]: { 
        url: photoUrl, 
        location: photoLocation 
      } 
    }));

    if (photoLocation) {
      setLocation(photoLocation);
    }

    setSuccess(`Successfully captured: ${returnKey.replace("_", " ")}`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const recieveLiveLocationFromAndroid = (loc) => {
    if (!loc?.latitude || !loc?.longitude) {
      setError("Invalid location coordinates received");
      return;
    }

    setLocation({
      lat: loc.latitude,
      lng: loc.longitude,
      accuracy: loc.accuracy,
    });

    setSuccess("Location coordinates synchronized");
    setTimeout(() => setSuccess(""), 3000);
  };

  useEffect(() => {
    window.recievePhotoFromAndroid = recievePhotoFromAndroid;
    window.recieveLiveLocationFromAndroid = recieveLiveLocationFromAndroid;

    if (!window.AndroidApp?.captureLivePhoto) {
      setCameraAvailable(false);
    }

    return () => {
      delete window.recievePhotoFromAndroid;
      delete window.recieveLiveLocationFromAndroid;
    };
  }, []);

  // ================= ACTIONS =================
  const capturePhoto = (key) => {
    setError("");
    setSuccess("");

    if (window.AndroidApp?.captureLivePhoto) {
      window.AndroidApp.captureLivePhoto(
        JSON.stringify({
          returnKey: key,
          lens: "both",
          waterMark: {
            geoLocation: true,
            accuracy: true,
            accuracyLimit: 50,
            staticDatas: [
              { key: "type", value: key },
              { key: "timestamp", value: new Date().toLocaleString() },
            ],
          },
        })
      );
    } else {
      setError("Native camera module not found. Please run inside Android WebView.");
    }
  };

  const captureVideo = async () => {
    setError("");
    try {
      if (!window.AndroidApp?.captureLiveVideo) {
        throw new Error("Video module missing");
      }
      const result = await window.AndroidApp.captureLiveVideo();
      setVideoUrl(result);
      setSuccess("Video recording completed");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Capture failed: Device restricted or module missing");
    }
  };

  const getGeoLocation = async () => {
    setError("");
    try {
      if (!window.AndroidApp?.getGeoLocation) {
        throw new Error("GPS module missing");
      }
      const result = await window.AndroidApp.getGeoLocation();
      const parsed = typeof result === "string" ? JSON.parse(result) : result;

      setLocation({
        lat: parsed.latitude,
        lng: parsed.longitude,
        accuracy: parsed.accuracy,
      });

      setSuccess("Current position acquired");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("GPS Failed: Check device permissions");
    }
  };

  const getJwtToken = async () => {
    setError("");
    try {
      if (window.AndroidApp?.getJwtToken) {
        const result = await window.AndroidApp.getJwtToken();
        setToken(result);
        setSuccess("Authentication token retrieved");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Auth service unavailable in current environment");
      }
    } catch (err) {
      setError("Authentication failed: Session expired or invalid");
    }
  };

  const verifyFace = () => {
    setError("");
    setSuccess("");

    const faceEmbeddings = {
      size: 3,
      data: [
        new Array(512).fill(0),
        new Array(512).fill(0),
        new Array(512).fill(0)
      ]
    };

    if (window.AndroidApp?.verifyFace) {
      window.AndroidApp.verifyFace(
        JSON.stringify({
          returnKey: "face_verification",
          faceEmbeddings: faceEmbeddings,
          waterMark: {
            geoLocation: true,
            accuracy: true,
            accuracyLimit: 50,
            staticDatas: [
              { key: "type", value: "face_verification" },
              { key: "timestamp", value: new Date().toLocaleString() },
            ],
          },
        })
      );
    } else {
      setError("Face verification module not found.");
    }
  };

  return {
    photos,
    videoUrl,
    location,
    error,
    success,
    token,
    cameraAvailable,
    capturePhoto,
    captureVideo,
    getGeoLocation,
    getJwtToken,
    verifyFace
  };
};
