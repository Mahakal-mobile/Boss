import { useEffect, useRef, useState } from "react";

export default function VoiceButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-IN";

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    return () => rec.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    if (!supported || disabled) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? "mic-btn-active" : ""}`}
      onClick={toggle}
      disabled={disabled || !supported}
      title={supported ? "Voice input" : "Voice input not supported in this browser"}
      aria-label="Voice input"
    >
      {listening ? "●" : "🎤"}
    </button>
  );
}
