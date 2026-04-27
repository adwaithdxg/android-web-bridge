import React from "react";
import { 
  Video, 
  MapPin, 
  ShieldCheck, 
  User, 
  Building2, 
  XCircle, 
  CheckCircle2, 
  Locate,
  KeyRound,
  FileImage
} from "lucide-react";

// Modularized Imports
import { styles } from "./styles/AppStyles";
import ActionCard from "./components/ActionCard";
import StatusToast from "./components/StatusToast";
import { useAndroidBridge } from "./hooks/useAndroidBridge";

const App = () => {
  const {
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
  } = useAndroidBridge();

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
              title="Capture Worker 1 Photo" 
              description="Primary personnel verification"
              icon={User} 
              color="#2563eb"
              onClick={() => capturePhoto("worker_1")}
            />
            <ActionCard 
              title="Capture Worker 2 Photo" 
              description="Witness or partner capture"
              icon={User} 
              color="#4f46e5"
              onClick={() => capturePhoto("worker_2")}
            />
            <ActionCard 
              title="Capture Premises Photo" 
              description="Premises and surrounding area"
              icon={Building2} 
              color="#7c3aed"
              onClick={() => capturePhoto("premises")}
            />
            <ActionCard 
              title="Verify Face" 
              description="Biometric identity validation"
              icon={ShieldCheck} 
              color="#10b981"
              onClick={verifyFace}
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

            {Object.entries(photos).map(([key, data]) => (
              <div key={key} style={{ ...styles.previewCard, gridColumn: 'span 2' }}>
                <div style={styles.previewImageContainerFull}>
                  <img src={data.url} style={styles.imageFull} alt={key} />
                  <div style={styles.previewBadge}>{key.replace("_", " ")}</div>
                </div>
                <div style={styles.imageDetails}>
                  <div style={styles.detailRow}>
                    <Locate size={14} color="#64748b" />
                    <span>{data.location ? `${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}` : 'No location data'}</span>
                  </div>
                  <div style={styles.urlBox}>
                    <p style={styles.urlLabel}>Image URL:</p>
                    <a href={data.url} target="_blank" rel="noreferrer" style={styles.urlLink}>{data.url}</a>
                  </div>
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

export default App;