// Long-term memory layer for Guru AI.
//
// This runs entirely in the browser via localStorage, so it persists across
// sessions on the same device/browser indefinitely (there's no 1-year cap —
// it lasts until the user clears site data). It is NOT synced across devices.
// For real cross-device long-term memory, pair this with a small backend
// (e.g. Supabase/Postgres) keyed by a logged-in user id.

const CHAT_KEY = "guru_chat_history_v1";
const PROFILE_KEY = "guru_user_profile_v1";
const MAX_MESSAGES = 400; // keep storage bounded; oldest are summarized away

export function loadChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveChatHistory(messages) {
  const trimmed = messages.slice(-MAX_MESSAGES);
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_KEY);
}

export function loadProfile() {
  try {
    return JSON.parse(
      localStorage.getItem(PROFILE_KEY) ||
        JSON.stringify({
          name: "",
          device: "Nothing 3a Lite (Nothing OS)",
          notes: [],
        })
    );
  } catch {
    return { name: "", device: "Nothing 3a Lite (Nothing OS)", notes: [] };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function rememberFact(fact) {
  const profile = loadProfile();
  profile.notes = [...(profile.notes || []), { fact, at: Date.now() }].slice(
    -200
  );
  saveProfile(profile);
}
