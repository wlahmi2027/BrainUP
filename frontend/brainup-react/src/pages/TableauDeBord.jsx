import { useEffect, useState } from "react";
import { dashboardData } from "../mock/dashboardData";
import { api } from "../api/client";

export default function TableauDeBord() {
  // start with mock progress
  const [progress, setProgress] = useState(dashboardData.progress);

  useEffect(() => {
    const fetchProgressPercent = async () => {
      try {
        const res = await api.get("/etudiants/999/progression/"); // backend fetch
        console.log("Backend response:", res.data);
        setProgress((prev) => ({
          ...prev,
          percent: res.data.progression, // map backend field to percent
        }));
      } catch (error) {
        console.error("Error fetching progress percent:", error);
      }
    };

    fetchProgressPercent();
  }, []);

  const { user, statsCards, suggestions, topQuiz } = dashboardData;

  return (
    <section className="page">
      <div className="dashhead">
        <h1 className="dashhead__title">Tableau de Bord</h1>
        <button className="btn btn--soft">Mes dernières ▾</button>
      </div>

      <div className="dashgrid">
        {/* LEFT COL */}
        <div className="dashleft">
          {/* Progress */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Ma Progression</h2>
              <span className="dots">•••</span>
            </div>

            <div className="progressrow">
              <div className="donutwrap">
                <div className="donut" style={{ "--p": progress.percent }}>
                  <div className="donut__inner">
                    <div className="donut__num">{progress.percent}%</div>
                    <div className="donut__label">Complété</div>
                  </div>
                </div>
              </div>

              <div className="progstats">
                <div className="progstats__big">
                  <div className="progstats__label">Objectifs</div>
                  <div className="progstats__value">{progress.percent}%</div>
                  <div className="progstats__sub">{progress.objectifsLabel}</div>
                </div>

                <ul className="checklist">
                  {progress.checklist.map((item, idx) => (
                    <li key={idx}>
                      <span className="check">✓</span> {item.text}{" "}
                      <span className="muted">— {item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Course stats */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Statistiques de Cours</h2>
              <a className="tinyLink" href="#">Voir plus</a>
            </div>

            <div className="statcards">
              {statsCards.map((c, idx) => (
                <article className="statmedia" key={idx}>
                  <div className={`statmedia__thumb ${idx === 0 ? "statmedia__thumb--blue" : "statmedia__thumb--navy"}`}>
                    <div className="statmedia__kpi">
                      <div className="kpi__top">{c.kpi}</div>
                      <div className="kpi__name">{c.name}</div>
                    </div>
                  </div>

                  <div className="statmedia__actions">
                    <button className="btn btn--ghost">{c.ctaLeft}</button>
                    <button className="btn btn--primary">{c.ctaRight}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COL */}
        <aside className="dashright">
          {/* Quiz suggestions */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Suggestions de Quiz</h2>
              <span className="dots">•••</span>
            </div>

            <div className="suglist">
              {suggestions.map((s, idx) => (
                <div className="sugitem" key={idx}>
                  <div className="sugicon">{s.icon}</div>
                  <div className="sugtext">
                    <div className="sugtitle">{s.title}</div>
                  </div>
                </div>
              ))}

              <button className="btn btn--soft" style={{ width: "100%", marginTop: 10 }}>
                Your Picks ▾
              </button>
            </div>
          </section>

          {/* Top quiz */}
          <section className="card card--pad">
            <div className="card__head">
              <h2 className="card__title">Top Quiz</h2>
              <span className="dots">•••</span>
            </div>

            <div className="toplist">
              {topQuiz.map((t, idx) => (
                <div className="toprow" key={idx}>
                  <div className="topleft">
                    <div className="topicon">{t.icon}</div>
                    <div>
                      <div className="topname">{t.name}</div>
                      <div className="topsub">{t.period}</div>
                    </div>
                  </div>
                  <div className="topscore">
                    <div className="topbig">{t.score}</div>
                    <div className="topsub">{t.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Floating assistant */}
      <div className="assistFloat">
        <div className="assistFloat__avatar">{user.initial}</div>
        <div className="assistFloat__bubble">Bonjour! Comment puis-je vous aider?</div>
      </div>
    </section>
  );
}