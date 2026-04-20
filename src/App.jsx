import React, { useEffect, useState } from "react";

const App = () => {
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

    setPhotos((prev) => ({ ...prev, [returnKey]: photoUrl }));

    if (loc?.latitude && loc?.longitude) {
      setLocation({
        lat: loc.latitude,
        lng: loc.longitude,
        accuracy: loc.accuracy,
      });
    }

    setSuccess(`Captured: ${returnKey}`);
  };

  const recieveLiveLocationFromAndroid = (loc) => {
    if (!loc?.latitude || !loc?.longitude) {
      setError("Invalid location");
      return;
    }

    setLocation({
      lat: loc.latitude,
      lng: loc.longitude,
      accuracy: loc.accuracy,
    });

    setSuccess("Location updated");
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
              { key: "date", value: new Date().toISOString() },
            ],
          },
        })
      );
    } else {
      setError("Camera not available");
    }
  };

  const captureVideo = async () => {
    setError("");
    try {
      const result = await window.AndroidApp?.captureLiveVideo();
      setVideoUrl(result);
    } catch {
      setError("Video capture failed");
    }
  };

  const getLocation = async () => {
    setError("");
    try {
      const result = await window.AndroidApp?.getGeoLocation();
      const parsed = typeof result === "string" ? JSON.parse(result) : result;

      setLocation({
        lat: parsed.latitude,
        lng: parsed.longitude,
        accuracy: parsed.accuracy,
      });

      setSuccess("Location fetched");
    } catch {
      setError("Location failed");
    }
  };

  const getJwtToken = async () => {
    setError("");
    try {
      if (window.AndroidApp?.getJwtToken) {
        const result = await window.AndroidApp.getJwtToken();
        setToken(result);
        setSuccess("JWT Token fetched from Bridge");
      } else {
        setError("Unable to fetch JWT Token");
      }
    } catch (err) {
      setError("Unable to fetch JWT Token " + err);
    }
  };

  // ================= UI =================
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Android Bridge Dashboard</h2>

        {/* STATUS */}
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {!cameraAvailable && (
          <div style={styles.warning}>
            ⚠️ Use inside Android WebView
          </div>
        )}

        {/* CAMERA */}
        <Section title="Capture Photos">
          <div style={styles.grid}>
            <Button onClick={() => capturePhoto("worker_1")}>
              Worker 1
            </Button>
            <Button onClick={() => capturePhoto("worker_2")}>
              Worker 2
            </Button>
            <Button onClick={() => capturePhoto("premises")}>
              Premises
            </Button>
          </div>
        </Section>

        {/* VIDEO */}
        <Section title="Video">
          <Button primary onClick={captureVideo}>
            Record Video
          </Button>
        </Section>

        {/* JWT TOKEN */}
        <Section title="Authentication">
          <Button secondary onClick={getJwtToken}>
            Fetch JWT Token
          </Button>
        </Section>

        {/* LOCATION */}
        <Section title="Location">
          <Button secondary onClick={getLocation}>
            Get Location
          </Button>
        </Section>

        {/* PREVIEW */}
        <Section title="Preview">
          <div style={styles.previewGrid}>
            {Object.entries(photos).map(([key, url]) => (
              <PreviewCard key={key} title={key}>
                <img src={url} style={styles.image} />
              </PreviewCard>
            ))}

            {videoUrl && (
              <PreviewCard title="Video">
                <video src={videoUrl} controls style={styles.video} />
              </PreviewCard>
            )}

            {token && (
              <PreviewCard title="JWT Token">
                <div style={styles.tokenWrapper}>
                  {token}
                </div>
              </PreviewCard>
            )}

            {location && (
              <PreviewCard title="Location">
                <p>Lat: {location.lat}</p>
                <p>Lng: {location.lng}</p>
                <p>Accuracy: {location.accuracy}</p>
              </PreviewCard>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
};

// ================= COMPONENTS =================
const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h4 style={styles.sectionTitle}>{title}</h4>
    {children}
  </div>
);

const Button = ({ children, primary, secondary, ...props }) => (
  <button
    {...props}
    style={{
      ...styles.button,
      ...(primary ? styles.primary : {}),
      ...(secondary ? styles.secondary : {}),
    }}
  >
    {children}
  </button>
);

const PreviewCard = ({ title, children }) => (
  <div style={styles.previewCard}>
    <p style={styles.previewTitle}>{title}</p>
    {children}
  </div>
);

// ================= STYLES =================
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    marginBottom: "10px",
    fontSize: "14px",
    color: "#555",
  },
  grid: {
    display: "flex",
    gap: "10px",
  },
  button: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#f9fafb",
  },
  primary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
  },
  secondary: {
    background: "#f59e0b",
    color: "#fff",
    border: "none",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  previewCard: {
    border: "1px solid #eee",
    padding: "10px",
    borderRadius: "10px",
    background: "#fafafa",
  },
  previewTitle: {
    fontSize: "12px",
    marginBottom: "5px",
    color: "#777",
  },
  image: {
    width: "100%",
    borderRadius: "8px",
  },
  video: {
    width: "100%",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  warning: {
    background: "#fef3c7",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  tokenWrapper: {
    fontSize: "10px",
    wordBreak: "break-all",
    background: "#f0f0f0",
    padding: "5px",
    borderRadius: "4px",
    marginTop: "5px",
  },
};

export default App;