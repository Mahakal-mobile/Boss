import { useState } from "react";
import { INTEGRATION_STATUS } from "../lib/integrations";

export default function SettingsPanel({
  onClose,
  geminiKey,
  setGeminiKey,
  integrationKeys,
  setIntegrationKeys,
  profile,
  setProfile,
}) {
  const [local, setLocal] = useState(integrationKeys);
  const [name, setName] = useState(profile.name || "");
  const [device, setDevice] = useState(profile.device || "");

  function save() {
    setIntegrationKeys(local);
    setProfile({ ...profile, name, device });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet settings-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="settings-section">
          <h4>Your profile</h4>
          <label className="field-label">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should I call you?" />
          <label className="field-label">Device</label>
          <input value={device} onChange={(e) => setDevice(e.target.value)} placeholder="e.g. Nothing 3a Lite (Nothing OS)" />
        </div>

        <div className="settings-section">
          <h4>Gemini API key</h4>
          <p className="hint-text">
            Needed for chat, search, and camera diagnosis. Get one free at Google AI Studio.
          </p>
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIza..."
          />
        </div>

        <div className="settings-section">
          <h4>Integrations</h4>
          {Object.entries(INTEGRATION_STATUS).map(([key, info]) => (
            <div key={key} className="integration-row">
              <div className="integration-label">
                <strong>{info.label}</strong>
                <span className={`badge ${info.liveInBrowser ? "badge-live" : "badge-soon"}`}>
                  {info.liveInBrowser ? "Works now" : "Needs backend"}
                </span>
              </div>
              <p className="hint-text">{info.note}</p>
              {key === "gmail" && (
                <input
                  placeholder="Google OAuth Client ID"
                  value={local.gmailClientId}
                  onChange={(e) => setLocal({ ...local, gmailClientId: e.target.value })}
                />
              )}
              {key === "whatsapp" && (
                <>
                  <input
                    placeholder="WhatsApp access token"
                    value={local.whatsappToken}
                    onChange={(e) => setLocal({ ...local, whatsappToken: e.target.value })}
                  />
                  <input
                    placeholder="WhatsApp phone number ID"
                    value={local.whatsappPhoneId}
                    onChange={(e) => setLocal({ ...local, whatsappPhoneId: e.target.value })}
                  />
                </>
              )}
              {key === "facebook" && (
                <input
                  placeholder="Facebook Page access token"
                  value={local.facebookToken}
                  onChange={(e) => setLocal({ ...local, facebookToken: e.target.value })}
                />
              )}
              {key === "twitter" && (
                <input
                  placeholder="X API bearer token"
                  value={local.twitterBearerToken}
                  onChange={(e) => setLocal({ ...local, twitterBearerToken: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <button className="primary-btn" onClick={save}>Save</button>
      </div>
    </div>
  );
}
