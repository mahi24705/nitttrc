import React, { useMemo, useRef, useState } from "react";
import "./PublicationPage.css";

/* SAMPLE DATA */
const SAMPLE = [
  {
    id: 1,
    type: "Journal",
    year: 2012,
    title:
      "Implementation of Threshold Detection Technique for extraction of composite signals against ambient noises in underwater communication using Empirical Mode Decomposition",
    authors: "S. Sakthivel Murugan, V. Natarajan",
    venue: "Fluctuation and Noise Letters, Vol.11, No.4 (2012)",
    doi: "10.1142/S0219477512500230",
  },
  {
    id: 2,
    type: "Conference",
    year: 2015,
    title:
      "Design and Prototype Implementation of an Automatic Energy Harvesting system for Low power Devices from Vibration of Vehicles",
    authors: "S. Sakthivel Murugan, Ann Agneta Chandru",
    venue: "12th IEEE INDICON 2015, New Delhi (Best Paper Award)",
    doi: "",
  },
  {
    id: 3,
    type: "Book",
    year: 2018,
    title: "Communication Theory",
    authors: "—",
    venue: "McGraw Hill (2018)",
    doi: "",
  },
  {
    id: 4,
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

export default function PublicationPage() {
  const [pubs, setPubs] = useState(SAMPLE);

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All years");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    type: "Journal",
    year: "",
    title: "",
    authors: "",
    venue: "",
    doi: "",
  });

  const formRef = useRef(null);

  const years = useMemo(() => {
    return Array.from(new Set(pubs.map((p) => p.year))).sort((a, b) => b - a);
  }, [pubs]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return pubs.filter((p) => {
      const matchesType = typeFilter === "All" ? true : p.type === typeFilter;

      const matchesYear =
        yearFilter === "All years" ? true : p.year === Number(yearFilter);

      const matchesQuery =
        !query ||
        (p.title || "").toLowerCase().includes(query) ||
        (p.authors || "").toLowerCase().includes(query) ||
        (p.venue || "").toLowerCase().includes(query) ||
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

  function resetForm() {
    setEditingId(null);
    setForm({
      type: "Journal",
      year: "",
      title: "",
      authors: "",
      venue: "",
      doi: "",
    });
  }

  function onSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.authors || !form.year) {
      alert("Please fill Title, Authors, and Year.");
      return;
    }

    const payload = {
      ...form,
      year: Number(form.year),
    };

    if (editingId) {
      setPubs((prev) =>
        prev.map((p) => (p.id === editingId ? { ...payload, id: editingId } : p))
      );
    } else {
      setPubs((prev) => [{ ...payload, id: Date.now() }, ...prev]);
    }

    resetForm();
  }

  function onEdit(p) {
    setEditingId(p.id);
    setForm({
      type: p.type || "Journal",
      year: p.year || "",
      title: p.title || "",
      authors: p.authors || "",
      venue: p.venue || "",
      doi: p.doi || "",
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function onDelete(id) {
    if (!confirm("Delete this publication?")) return;
    setPubs((prev) => prev.filter((p) => p.id !== id));
  }

  async function copyCitation(p) {
    const doiPart = p.doi ? ` DOI: ${doiUrl(p.doi)}` : "";
    const citation = `${p.authors} (${p.year}). ${p.title}. ${p.venue}.${doiPart}`;

    try {
      await navigator.clipboard.writeText(citation);
      alert("Citation copied!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = citation;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Citation copied!");
    }
  }

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
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="divider" />

            <h3>FILTER BY YEAR</h3>
            <div className="year-list">
              <button
                className={`year-item ${yearFilter === "All years" ? "active" : ""}`}
                onClick={() => setYearFilter("All years")}
                type="button"
              >
                <span>All years</span>
                <span className="count">{pubs.length}</span>
              </button>

              {years.map((y) => (
                <button
                  key={y}
                  className={`year-item ${String(yearFilter) === String(y) ? "active" : ""}`}
                  onClick={() => setYearFilter(String(y))}
                  type="button"
                >
                  <span>{y}</span>
                  <span className="count">{pubs.filter((p) => p.year === y).length}</span>
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
                <div className="pub-head-row">
                  <div className={badgeClass(p.type)}>
                    {p.type} • {p.year}
                  </div>

                  <div className="pub-actions">
                    <button className="btn mini" onClick={() => copyCitation(p)} type="button">
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

                    <button className="btn mini" onClick={() => onEdit(p)} type="button">
                      Edit
                    </button>

                    <button className="btn mini danger" onClick={() => onDelete(p.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>

                <h2 className="pub-title">{p.title}</h2>

                <div className="pub-meta">
                  <div>
                    <b>Authors:</b> {p.authors}
                  </div>
                  <div>
                    <b>Venue:</b> {p.venue}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && <div className="empty">No publications found.</div>}
          </div>

          {/* ADD / EDIT FORM AT BOTTOM */}
          <div className="pub-form" ref={formRef}>
            <h2>{editingId ? "Edit Publication" : "Add Publication"}</h2>

            <form onSubmit={onSubmit}>
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <input
                placeholder="Authors"
                value={form.authors}
                onChange={(e) => setForm({ ...form, authors: e.target.value })}
              />

              <input
                placeholder="Venue / Publisher"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />

              <input
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />

              <input
                placeholder="DOI"
                value={form.doi}
                onChange={(e) => setForm({ ...form, doi: e.target.value })}
              />

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Journal</option>
                <option>Conference</option>
                <option>Book</option>
              </select>

              <div className="pub-form-actions">
                <button className="btn primary" type="submit">
                  {editingId ? "Update" : "Add"}
                </button>

                <button className="btn" type="button" onClick={resetForm}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}