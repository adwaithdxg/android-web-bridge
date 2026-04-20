import React, { useEffect, useState } from "react";
import { 
  Camera, 
  Video, 
  MapPin, 
  ShieldCheck, 
  User, 
  Building2, 
  XCircle, 
  CheckCircle2, 
  Locate,
  RefreshCw,
  KeyRound,
  FileImage
} from "lucide-react";

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

  // ================= UI COMPONENTS =================
  const ActionCard = ({ title, icon: Icon, color, onClick, description }) => (
    <div 
      style={{
        ...styles.actionCard,
        borderLeft: `4px solid ${color}`
      }}
      onClick={onClick}
    >
      <div style={{ ...styles.iconContainer, background: `${color}15` }}>
        <Icon size={20} color={color} />
      </div>
      <div style={styles.cardContent}>
        <h4 style={styles.cardTitle}>{title}</h4>
        <p style={styles.cardDescription}>{description}</p>
      </div>
    </div>
  );

  const StatusToast = ({ type, message, icon: Icon }) => (
    <div style={{ ...styles.toast, ...(type === 'error' ? styles.errorToast : styles.successToast) }}>
      <Icon size={18} />
      <span>{message}</span>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container} className="animate-fade-in">
        <header style={styles.header}>
          <div style={styles.headerTitle}>
            <ShieldCheck size={28} color="#2563eb" />
            <h1 style={styles.title}>FieldBridge <span style={styles.titleBadge}>v2.0</span></h1>
          </div>
          <p style={styles.subtitle}>Native Android Integration Interface</p>
        </header>

        {/* FEEDBACK MESSAGES */}
        {error && <StatusToast type="error" message={error} icon={XCircle} />}
        {success && <StatusToast type="success" message={success} icon={CheckCircle2} />}

        {!cameraAvailable && (
          <div style={styles.warningBox}>
            <div style={styles.warningIcon}>⚠️</div>
            <div>
              <strong>Native Modules Restricted</strong>
              <p style={styles.warningText}>Web features are available, but native hardware bridging requires the Android Container.</p>
            </div>
          </div>
        )}

        {/* CAMERA TASKS */}
        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>Capture Operations</h3>
          <div style={styles.cameraGrid}>
            <ActionCard 
              title="Worker Profile" 
              description="Primary personnel verification"
              icon={User} 
              color="#2563eb"
              onClick={() => capturePhoto("worker_1")}
            />
            <ActionCard 
              title="Secondary Identity" 
              description="Witness or partner capture"
              icon={User} 
              color="#4f46e5"
              onClick={() => capturePhoto("worker_2")}
            />
            <ActionCard 
              title="Site Inspection" 
              description="Premises and surrounding area"
              icon={Building2} 
              color="#7c3aed"
              onClick={() => capturePhoto("premises")}
            />
          </div>
        </div>

        {/* SYSTEM UTILITIES */}
        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>System Utilities</h3>
          <div style={styles.utilGrid}>
            <button style={{ ...styles.utilBtn, background: '#0f172a' }} onClick={captureVideo}>
              <Video size={18} />
              <span>Record Evidence</span>
            </button>
            <button style={{ ...styles.utilBtn, background: '#059669' }} onClick={getGeoLocation}>
              <MapPin size={18} />
              <span>Sync Location</span>
            </button>
            <button style={{ ...styles.utilBtn, background: '#f59e0b' }} onClick={getJwtToken}>
              <KeyRound size={18} />
              <span>Refresh Auth</span>
            </button>
          </div>
        </div>

        {/* REAL-TIME PREVIEW */}
        <div style={styles.section}>
          <h3 style={styles.sectionLabel}>Evidence Preview</h3>
          <div style={styles.previewGrid}>
            {Object.entries(photos).length === 0 && !videoUrl && !location && !token && (
              <div style={styles.emptyState}>
                <FileImage size={40} color="#cbd5e1" strokeWidth={1} />
                <p>No evidence captured yet</p>
              </div>
            )}

            {Object.entries(photos).map(([key, url]) => (
              <div key={key} style={styles.previewCard}>
                <div style={styles.previewImageContainer}>
                  <img src={url} style={styles.image} alt={key} />
                  <div style={styles.previewBadge}>{key.replace("_", " ")}</div>
                </div>
              </div>
            ))}

            {videoUrl && (
              <div style={styles.previewCard}>
                <div style={styles.previewVideoContainer}>
                  <video src={videoUrl} controls style={styles.video} />
                  <div style={styles.previewBadge}>Recorded Footage</div>
                </div>
              </div>
            )}

            {location && (
              <div style={{ ...styles.previewCard, ...styles.dataCard }}>
                <div style={styles.dataIcon}><Locate size={16} color="#059669" /></div>
                <div style={styles.dataContent}>
                  <div style={styles.dataLabel}>Live Coordinates</div>
                  <div style={styles.dataValue}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                  <div style={styles.dataSub}>Accuracy: {location.accuracy.toFixed(1)}m</div>
                </div>
              </div>
            )}

            {token && (
              <div style={{ ...styles.previewCard, ...styles.dataCard, gridColumn: 'span 2' }}>
                <div style={styles.dataIcon}><ShieldCheck size={16} color="#2563eb" /></div>
                <div style={styles.dataContent}>
                  <div style={styles.dataLabel}>Active Session Token</div>
                  <div style={styles.tokenText}>{token}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= STYLES =================
const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 16px",
    overflowX: "hidden",
  },
  container: {
    width: "100%",
    maxWidth: "480px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
    textAlign: "left",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  titleBadge: {
    fontSize: "12px",
    background: "#e2e8f0",
    color: "#64748b",
    padding: "2px 8px",
    borderRadius: "12px",
    verticalAlign: "middle",
    marginLeft: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  section: {
    marginBottom: "32px",
  },
  sectionLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "12px",
    display: "block",
  },
  cameraGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  actionCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02), 0 10px 20px -5px rgba(0,0,0,0.04)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  iconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    margin: "0 0 2px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  cardDescription: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },
  utilGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  utilBtn: {
    border: "none",
    borderRadius: "12px",
    padding: "12px 8px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  emptyState: {
    gridColumn: "span 2",
    background: "#fff",
    border: "2px dashed #e2e8f0",
    borderRadius: "16px",
    padding: "40px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  previewCard: {
    borderRadius: "12px",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  previewImageContainer: {
    position: "relative",
    aspectRatio: "1",
  },
  previewVideoContainer: {
    position: "relative",
    aspectRatio: "1",
    background: "#000",
    display: "flex",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  video: {
    width: "100%",
  },
  previewBadge: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    textTransform: "capitalize",
    backdropFilter: "blur(4px)",
  },
  dataCard: {
    padding: "12px",
    display: "flex",
    gap: "10px",
  },
  dataIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dataContent: {
    minWidth: 0,
  },
  dataLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dataValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: "1.2",
  },
  dataSub: {
    fontSize: "11px",
    color: "#64748b",
  },
  tokenText: {
    fontSize: "10px",
    color: "#475569",
    wordBreak: "break-all",
    marginTop: "4px",
    fontFamily: "monospace",
    background: "#f8fafc",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
  warningBox: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  warningIcon: {
    fontSize: "20px",
  },
  warningText: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#9a3412",
  },
  toast: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 20px",
    borderRadius: "100px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
  },
  successToast: {
    background: "#059669",
  },
  errorToast: {
    background: "#dc2626",
  },
};

export default App;