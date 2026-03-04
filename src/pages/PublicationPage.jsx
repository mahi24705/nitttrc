import React, { useMemo, useState } from "react";
import "./PublicationPage.css";

/**
 * TEMPLATE DATA (replace with DB later)
 * pdfUrl optional, doi optional
 */
const SAMPLE = [
  {
    id: "p1",
    type: "Journal",
    year: 2012,
    title:
      "Implementation of Threshold Detection Technique for extraction of composite signals against ambient noises in underwater communication using Empirical Mode Decomposition",
    authors: "S. Sakthivel Murugan, V. Natarajan",
    venue: "Fluctuation and Noise Letters, Vol.11, No.4 (2012)",
    doi: "10.1142/S0219477512500230",
  },
  {
    id: "p2",
    type: "Conference",
    year: 2015,
    title:
      "Design and Prototype Implementation of an Automatic Energy Harvesting system for Low power Devices from Vibration of Vehicles",
    authors: "S. Sakthivel Murugan, Ann Agneta Chandru",
    venue: "12th IEEE INDICON 2015, New Delhi (Best Paper Award)",
    doi: "",
  },
  {
    id: "p3",
    type: "Book",
    year: 2018,
    title: "Communication Theory",
    authors: "—",
    publisher: "McGraw Hill (2018)", // ✅ changed
  },
  {
    id: "p4",
    type: "Journal",
    year: 2011,
    title:
      "Noise Model Analysis and Estimation of Effect due to Wind Driven Ambient Noise in Shallow Water",
    authors: "S. Sakthivel Murugan, V. Natarajan, R. Rajesh Kumar",
    venue: "International Journal of Oceanography (2011)",
    doi: "10.1155/2011/123456",
  },
];

function doiUrl(doi) {
  if (!doi) return "";
  if (doi.startsWith("http")) return doi;
  return `https://doi.org/${doi}`;
}

function badgeClass(type) {
  if (type === "Journal") return "badge badge-journal";
  if (type === "Conference") return "badge badge-conf";
  return "badge badge-book";
}

function toCitation(p) {
  const doiPart = p.doi ? ` DOI: ${doiUrl(p.doi)}` : "";
  const extra = p.type === "Book" ? p.publisher : p.venue; // ✅ book uses publisher
  return `${p.authors} (${p.year}). ${p.title}. ${extra}.${doiPart}`;
}

export default function PublicationPage() {
  const [pubs] = useState(SAMPLE);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All years");

  const years = useMemo(() => {
    return Array.from(new Set(pubs.map((p) => p.year))).sort((a, b) => b - a);
  }, [pubs]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return pubs.filter((p) => {
      const matchesType = typeFilter === "All" ? true : p.type === typeFilter;
      const matchesYear =
        yearFilter === "All years" ? true : p.year === Number(yearFilter);

      const textDetails = p.type === "Book" ? p.publisher || "" : p.venue || "";

      const matchesQuery =
        !query ||
        (p.title || "").toLowerCase().includes(query) ||
        (p.authors || "").toLowerCase().includes(query) ||
        textDetails.toLowerCase().includes(query) ||
        String(p.year).includes(query) ||
        (p.type || "").toLowerCase().includes(query);

      return matchesType && matchesYear && matchesQuery;
    });
  }, [pubs, q, typeFilter, yearFilter]);

  const resetAll = () => {
    setQ("");
    setTypeFilter("All");
    setYearFilter("All years");
  };

  const copyCitation = async (p) => {
    const text = toCitation(p);
    try {
      await navigator.clipboard.writeText(text);
      alert("Citation copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Citation copied!");
    }
  };

  return (
    <div className="pub-page">
      {/* TOP HEADER */}
      <div className="pub-topbar">
        <div className="pub-topbar-left">
          <h1>Publications</h1>
          <div className="pub-sub">
            Sidebar filters • Research cards • Copy citation • DOI links
          </div>
        </div>

        <div className="pub-topbar-right">
          <div className="search-wrap">
            <input
              className="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title / authors / venue / year / type..."
            />
          </div>
          <button className="btn soft" onClick={resetAll}>
            Reset
          </button>
        </div>
      </div>

      <div className="pub-layout">
        {/* SIDEBAR */}
        <aside className="pub-sidebar">
          <div className="card">
            <h3>FILTER BY TYPE</h3>
            <div className="pill-row">
              {["All", "Journal", "Conference", "Book"].map((t) => (
                <button
                  key={t}
                  className={`pill ${typeFilter === t ? "active" : ""}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="divider" />

            <h3>FILTER BY YEAR</h3>
            <div className="year-list">
              <button
                className={`year-item ${
                  yearFilter === "All years" ? "active" : ""
                }`}
                onClick={() => setYearFilter("All years")}
              >
                <span>All years</span>
                <span className="count">{pubs.length}</span>
              </button>

              {years.map((y) => (
                <button
                  key={y}
                  className={`year-item ${
                    String(yearFilter) === String(y) ? "active" : ""
                  }`}
                  onClick={() => setYearFilter(String(y))}
                >
                  <span>{y}</span>
                  <span className="count">
                    {pubs.filter((p) => p.year === y).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="pub-main">
          <div className="stats-row">
            <div className="stat">
              <div className="stat-label">SHOWING</div>
              <div className="stat-value">{filtered.length}</div>
            </div>
            <div className="stat">
              <div className="stat-label">TOTAL</div>
              <div className="stat-value">{pubs.length}</div>
            </div>
          </div>

          <div className="grid">
            {filtered.map((p) => (
              <div key={p.id} className="pub-card">
                <div className="pub-card-head">
                  <div className="pub-head-row">
                    <div className={badgeClass(p.type)}>
                      {p.type} • {p.year}
                    </div>

                    <div className="pub-actions">
                      <button
                        className="btn mini"
                        onClick={() => copyCitation(p)}
                      >
                        Copy
                      </button>

                      {p.doi ? (
                        <a
                          className="btn mini"
                          href={doiUrl(p.doi)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          DOI
                        </a>
                      ) : null}

                      <button className="btn mini danger">Delete</button>
                    </div>
                  </div>
                </div>

                <h2 className="pub-title">{p.title}</h2>

                <div className="pub-meta">
                  <div>
                    <b>Authors:</b> {p.authors}
                  </div>

                  {/* ✅ Book => Publisher, others => Details */}
                  {p.type === "Book" ? (
                    <div>
                      <b>Publisher:</b> {p.publisher}
                    </div>
                  ) : (
                    <div>
                      <b>Details:</b> {p.venue}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="empty">No publications found.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}