import { useEffect, useRef, useState } from "react";

// Handles three input paths: live camera capture, gallery image upload, and
// PDF upload. Returns a base64 image (camera/gallery) or file info (PDF) to
// the parent via onCapture.
export default function CameraModal({ onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("camera"); // camera | idle

  useEffect(() => {
    if (mode !== "camera") return;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Camera permission was denied or no camera is available."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mode]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function handleClose() {
    stopStream();
    onClose();
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
    stopStream();
    onCapture({ type: "image", base64, mimeType: "image/jpeg" });
  }

  function handleFile(e, expectedKind) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      onCapture({
        type: expectedKind,
        base64,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Camera &amp; Media</h3>
          <button className="icon-btn" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        {mode === "camera" && (
          <div className="camera-wrap">
            {error ? (
              <p className="error-text">{error}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
            )}
            <button className="primary-btn" onClick={takePhoto} disabled={!!error}>
              📸 Capture
            </button>
          </div>
        )}

        <div className="modal-actions">
          <label className="secondary-btn">
            🖼️ Gallery
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e, "image")}
            />
          </label>
          <label className="secondary-btn">
            📄 PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => handleFile(e, "pdf")}
            />
          </label>
        </div>
        <p className="hint-text">
          Tip: for repair diagnosis, get close and well-lit shots of the component or damage.
        </p>
      </div>
    </div>
  );
}
