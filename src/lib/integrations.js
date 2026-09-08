// Storage + capability map for third-party integrations.
//
// IMPORTANT — read this before wiring a "Connect" button to something real:
// A static React app running in the browser cannot silently read a user's
// WhatsApp messages, SMS inbox, or OS notifications. Those require either:
//   1. An official, permissioned API with OAuth consent (Gmail API, X API,
//      Meta Graph API for a Facebook Page), called from a backend that can
//      keep a client secret safe, or
//   2. A native Android/iOS app with the user explicitly granting a
//      Notification Listener / SMS permission — a web app cannot do this.
//
// So: Gmail (read-only, via Google Identity Services) can genuinely be wired
// up client-side and is scaffolded for real below. WhatsApp Business Cloud
// API, Facebook Graph API, and X API all require a server component (to
// hold the app secret and receive webhooks) — this file stores the keys the
// user provides and exposes a clear `configured` flag, but actually sending/
// receiving messages needs the small backend described in README.md.

const KEY_STORAGE = "guru_integration_keys_v1";

const DEFAULT_KEYS = {
  gmailClientId: "",
  whatsappToken: "",
  whatsappPhoneId: "",
  facebookToken: "",
  twitterBearerToken: "",
};

export function loadIntegrationKeys() {
  try {
    return { ...DEFAULT_KEYS, ...JSON.parse(localStorage.getItem(KEY_STORAGE) || "{}") };
  } catch {
    return { ...DEFAULT_KEYS };
  }
}

export function saveIntegrationKeys(keys) {
  localStorage.setItem(KEY_STORAGE, JSON.stringify(keys));
}

// What Guru AI can ACTUALLY do today, per integration, purely from the browser.
export const INTEGRATION_STATUS = {
  gmail: {
    label: "Gmail",
    liveInBrowser: true,
    note: "Read-only inbox summaries work directly from the browser once you sign in with Google.",
  },
  whatsapp: {
    label: "WhatsApp Business",
    liveInBrowser: false,
    note: "Needs a small backend to hold your access token and receive the webhook — the token field here is saved for when that backend is deployed.",
  },
  facebook: {
    label: "Facebook Page",
    liveInBrowser: false,
    note: "Facebook Graph API calls with a Page token should go through a backend, not the browser, so the token isn't exposed.",
  },
  twitter: {
    label: "X / Twitter",
    liveInBrowser: false,
    note: "X API v2 blocks browser CORS for most endpoints — this also needs a backend relay.",
  },
};
