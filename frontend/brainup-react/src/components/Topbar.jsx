export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search">
        🔎
        <input type="text" placeholder="Rechercher un message" />
      </div>

      <div className="topbar__right">
        <button className="icon-btn" type="button">
          🔔
        </button>

        <div className="user-pill">
          <div className="avatar">H</div>
          <div className="user-pill__text">
            Hi, <b>Frant</b>
          </div>
          <div className="caret">▾</div>
        </div>
      </div>
    </header>
  );
}