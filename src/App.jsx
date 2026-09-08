import { useEffect, useRef, useState } from "react";
import ChatMessage from "./components/ChatMessage";
import VoiceButton from "./components/VoiceButton";
import CameraModal from "./components/CameraModal";
import SettingsPanel from "./components/SettingsPanel";
import ShortcutBar from "./components/ShortcutBar";
import { sendChat, hasApiKey } from "./lib/gemini";
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  loadProfile,
  saveProfile,
} from "./lib/memory";
import { loadIntegrationKeys, saveIntegrationKeys } from "./lib/integrations";
import { buildSystemInstruction } from "./lib/persona";

const WELCOME = {
  role: "model",
  text:
    "Hey, I'm Guru — think of me as the friend who's a little too online and a little too helpful. 🪙 I can chat, dig up live info from the web, look at photos of your phone if something's acting up, and generally get things done. What's going on?",
};

export default function App() {
  const [messages, setMessages] = useState(() => {
    const stored = loadChatHistory();
    return stored.length ? stored : [WELCOME];
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [geminiKey, setGeminiKey] = useState(
    () => localStorage.getItem("guru_gemini_key") || ""
  );
  const [integrationKeys, setIntegrationKeysState] = useState(loadIntegrationKeys());
  const [profile, setProfileState] = useState(loadProfile());
  const scrollRef = useRef(null);

  useEffect(() => {
    saveChatHistory(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function setGeminiKeyPersist(key) {
    setGeminiKey(key);
    localStorage.setItem("guru_gemini_key", key);
  }
  function setIntegrationKeys(keys) {
    setIntegrationKeysState(keys);
    saveIntegrationKeys(keys);
  }
  function setProfile(p) {
    setProfileState(p);
    saveProfile(p);
  }

  async function handleSend(overrideText, opts = {}) {
    const text = (overrideText ?? input).trim();
    if (!text && !opts.imageBase64) return;

    if (!hasApiKey()) {
      setShowSettings(true);
      return;
    }

    const userMsg = {
      role: "user",
      text,
      imageBase64: opts.imageBase64,
    };
    const nextMessages = [...messages, userMsg, { role: "model", pending: true }];
    setMessages(nextMessages);
    setInput("");
    setPendingImage(null);
    setSending(true);

    try {
      const historyForApi = [...messages, userMsg]
        .filter((m) => !m.pending)
        .map((m) => ({
          role: m.role,
          text: m.text,
          imageBase64: m.imageBase64,
          mimeType: "image/jpeg",
        }));

      const useSearch = /\b(price|weather|news|score|flight|today|current|latest|live)\b/i.test(
        text
      );

      const { text: replyText, sources } = await sendChat(historyForApi, {
        useSearch,
        systemInstruction: buildSystemInstruction(profile),
      });

      setMessages((prev) => {
        const withoutPending = prev.filter((m) => !m.pending);
        return [...withoutPending, { role: "model", text: replyText, sources }];
      });
    } catch (err) {
      const isKeyError = String(err.message).includes("NO_API_KEY");
      setMessages((prev) => {
        const withoutPending = prev.filter((m) => !m.pending);
        return [
          ...withoutPending,
          {
            role: "model",
            text: isKeyError
              ? "I need a Gemini API key before I can respond — pop it into Settings and I'm all yours."
              : `Hit a snag talking to the model: ${err.message}. Mind trying again?`,
          },
        ];
      });
    } finally {
      setSending(false);
    }
  }

  function handleShortcut(shortcut) {
    if (shortcut.prompt === "__OPEN_CAMERA__") {
      setShowCamera(true);
      return;
    }
    handleSend(shortcut.prompt);
  }

  function handleCapture(capture) {
    setShowCamera(false);
    if (capture.type === "pdf") {
      handleSend(
        `I uploaded a PDF called "${capture.name}". (Note: full PDF text extraction needs a backend step — for now, tell me what's in it or what you need from it and I'll help.)`
      );
      return;
    }
    handleSend(
      "Here's a photo — take a look and tell me what you see. If it's a repair question, diagnose the issue as specifically as you can.",
      { imageBase64: capture.base64 }
    );
  }

  function handleNewChat() {
    clearChatHistory();
    setMessages([WELCOME]);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">🪙</span>
          <span className="brand-name">Guru AI</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={handleNewChat} title="New chat">🗑️</button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">⚙️</button>
        </div>
      </header>

      <main className="chat-area" ref={scrollRef}>
        {messages.map((m, i) => (
          <ChatMessage key={i} {...m} />
        ))}
      </main>

      <ShortcutBar onPick={handleShortcut} />

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <button
          type="button"
          className="icon-btn composer-icon"
          onClick={() => setShowCamera(true)}
          title="Camera / Media"
        >
          📎
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Guru..."
          disabled={sending}
        />
        <VoiceButton onResult={(t) => handleSend(t)} disabled={sending} />
        <button type="submit" className="send-btn" disabled={sending || !input.trim()}>
          ➤
        </button>
      </form>

      {showCamera && (
        <CameraModal onClose={() => setShowCamera(false)} onCapture={handleCapture} />
      )}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          geminiKey={geminiKey}
          setGeminiKey={setGeminiKeyPersist}
          integrationKeys={integrationKeys}
          setIntegrationKeys={setIntegrationKeys}
          profile={profile}
          setProfile={setProfile}
        />
      )}
    </div>
  );
}
