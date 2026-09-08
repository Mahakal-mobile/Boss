export default function ChatMessage({ role, text, imageBase64, sources, pending }) {
  const isUser = role === "user";
  return (
    <div className={`msg-row ${isUser ? "msg-row-user" : "msg-row-ai"}`}>
      {!isUser && <div className="avatar">🪙</div>}
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
        {imageBase64 && (
          <img
            className="bubble-image"
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt="attachment"
          />
        )}
        {pending ? (
          <span className="typing">
            <span></span>
            <span></span>
            <span></span>
          </span>
        ) : (
          <p>{text}</p>
        )}
        {sources && sources.length > 0 && (
          <div className="sources">
            <span className="sources-label">Sources</span>
            {sources.slice(0, 4).map((s, i) => (
              <a key={i} href={s.uri} target="_blank" rel="noreferrer">
                {s.title || new URL(s.uri).hostname}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
