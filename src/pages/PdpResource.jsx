import { useEffect, useMemo, useState, useContext } from "react";
import "./PdpResource.css";
import { AuthContext } from "../context/AuthContext";

const API = "http://localhost:8080/api/pdp";

/* 🔹 RAW TEXT DATA (optional for initial import) */
const RAW_TEXT = `
31.01.2026 In the PDP - Research Paper Writing made Simple: A Technology Supported Framework (05.01.2026 -09.01.2026) served as resource person (Contact mode)
31.12.2025 In the PDP - CS-40-297 Agentic AI for problem solving in real world applications (08.12.2025 – 12.12.2025) served as resource person (Physical mode)
31.12.2025 In the PDP CS-41-316 Data Science and research Analytics using R Programming (15.12.2025 to 19.12.2025) served as resource person (Contact mode)
31.12.2025 In the PDP ME-33-316 Current trends and future directions in Unmanned Aerial Vehicles (15.12.2025 to 19.12.2025) served as resource person (Contact mode)
29.09.2025 In the PDP EM-24-239 Effective Research Proposal Writing (08.09.2025 to 12.09.2025) served as resource person (Contact Mode)
29.09.2025 In the PDP CD-29-219 Application of Generative AI for Question Paper Setting Integrating with Bloom’s Taxonomy Levels (BTL) (22.09.2025 to 26.09.2025) served as resource person (Contact Mode)
29.09.2025 In the ITEC Leveraging Drone Technology for Achieving Sustainable Development Goals (SDGs) and Promoting Entrepreneurship (17.09.2025 to 30.09.2025) served as resource person (Contact Mode)
30.08.2025 In the PDP EC-10-158 Networking and Data Communication (04.08.2025 to 08.08.2025) served as resource person (Online mode)
30.08.2025 In the PDP CD-19-153 Developing a Curriculum Framework Aligned with NEP 2020, OBE, and AI (04.08.2025 to 08.08.2025) served as resource person (Online mode)
30.08.2025 In the PDP Advanced Pedagogical Strategies for Impactful STEM Learning in AI, ML, and DS Courses (04.08.2025 to 08.08.2025) served as resource person (Online mode)
30.08.2025 In the PDP Smart UAV Systems: Leveraging IoT and Image Processing (18.08.2025 to 22.08.2025) served as resource person (Online mode)
29.07.2025 In the PDP CS-13-101 Empowering Text intelligence through Natural Language Processing (07.07.2025 to 11.07.2025) served as resource person (Contact mode)
29.07.2025 In the PDP EM-15-22 Tech Driven Research paper writing – A step by step approach with Digital Tools (14.07.2025 to 18.07.2025) served as resource person (Contact mode)
28.03.2025 PDP EC-12-312 Wireless Communication
`;

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

/* ✅ Convert DD.MM.YYYY -> "MMM YYYY" (ex: 31.12.2025 -> "DEC 2025") */
function monthYearFromDDMMYYYY(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return "—";
  const [, , mm, yy] = m;

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];

  const idx = Number(mm) - 1;
  return `${months[idx] || "—"} ${yy}`;
}

/* ✅ Sort key for "MMM YYYY" */
function monthYearKey(monYear) {
  const m = /^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})$/.exec(
    (monYear || "").trim().toUpperCase()
  );
  if (!m) return 0;

  const months = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };

  const mon = months[m[1]] || "00";
  const yr = m[2];
  return Number(`${yr}${mon}00`);
}

function pillClass(mode) {
  if (mode === "Contact") return "pill contact";
  if (mode === "Online") return "pill online";
  if (mode === "Physical") return "pill physical";
  return "pill other";
}

/** DD.MM.YYYY -> YYYY-MM-DD (for backend LocalDate) */
function ddmmyyyyToIso(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((ddmmyyyy || "").trim());
  if (!m) return "";
  const [, dd, mm, yy] = m;
  return `${yy}-${mm}-${dd}`;
}

/** YYYY-MM-DD -> DD.MM.YYYY */
function isoToDdmmyyyy(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso || "").trim());
  if (!m) return "—";
  const [, yy, mm, dd] = m;
  return `${dd}.${mm}.${yy}`;
}

/** Parse duration input like:
 *  "05.01.2026 - 09.01.2026"
 *  "05.01.2026 – 09.01.2026"
 *  "05.01.2026 to 09.01.2026"
 */
function parseDurationToIsoRange(duration) {
  const s = (duration || "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return { startIso: "", endIso: "" };

  // support "to"
  const parts = s.includes(" to ")
    ? s.split(" to ")
    : s.split("-").map((x) => x.trim());

  const start = (parts[0] || "").trim();
  const end = (parts[1] || "").trim();

  return {
    startIso: ddmmyyyyToIso(start),
    endIso: ddmmyyyyToIso(end),
  };
}

function makeDurationDdMm(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  return `${isoToDdmmyyyy(startIso)} - ${isoToDdmmyyyy(endIso)}`;
}

// 🔹 Convert text -> items (for optional import)
function parseRawToItems(raw) {
  const lines = raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const dateMatch = line.match(/^\d{2}\.\d{2}\.\d{4}/);
    const durationMatch = line.match(/\((.*?)\)/);
    const modeMatch = line.match(/\((Contact|Online|Physical)\s*mode\)/i);
    const codeMatch = line.match(/([A-Z]{2,}-?\d+-?\d*)/);

    const rawDate = dateMatch ? dateMatch[0] : "—";
    const date = monthYearFromDDMMYYYY(rawDate); // ✅ group label = MONTH YEAR

    const duration = durationMatch
      ? durationMatch[1].replace(/[–—]/g, "-").replace(/\s+/g, " ").trim()
      : "—";
    const mode = modeMatch
      ? modeMatch[1][0].toUpperCase() + modeMatch[1].slice(1).toLowerCase()
      : "—";
    const code = codeMatch ? codeMatch[1] : "PDP";

    const title = line
      .replace(rawDate, "")
      .replace(code, "")
      .replace(/\(.*?\)/g, "")
      .replace(/served as resource person.*$/i, "")
      .replace(/In the PDP\s*-?/gi, "")
      .replace(/In the ITEC\s*-?/gi, "")
      .replace(/\bPDP\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return {
<<<<<<< HEAD
      id: crypto.randomUUID(),
      date,        // ✅ now like "DEC 2025"
      rawDate,     // ✅ keep original for searching if needed
=======
      // UI fields (DD.MM.YYYY, duration string)
      date,
>>>>>>> 3aec7ea59936cbdfe079ff32d2cdb3041879a015
      code,
      title: title || "—",
      duration: duration || "—",
      mode: mode || "—",
    };
  });
}

export default function PdpResource() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]); // items from DB
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "",
    code: "",
    title: "",
    duration: "",
    mode: "Contact",
  });

  // ✅ Load from DB on page load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(API);
        if (!res.ok) throw new Error(`GET failed: ${res.status}`);
        const data = await res.json();

        // Convert DB → UI fields
        const ui = (data || []).map((x) => ({
          id: x.id,
          date: isoToDdmmyyyy(x.displayDate),
          code: x.code || "—",
          title: x.programme || "—",
          duration: makeDurationDdMm(x.startDate, x.endDate),
          mode: x.mode || "—",
          // keep originals if needed
          _displayDateIso: x.displayDate,
          _startIso: x.startDate,
          _endIso: x.endDate,
        }));

        setItems(ui);
      } catch (e) {
        console.error(e);
        setErrMsg(
          "Could not load data from backend. Check: Spring Boot running on 8080 and CORS allowed."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    // ✅ Search will match: "DEC 2025", "2025", "DEC", also old "31.12.2025"
    return items.filter((it) =>
<<<<<<< HEAD
      normalize(
        `${it.date} ${it.rawDate || ""} ${it.code} ${it.title} ${it.duration} ${it.mode}`
      ).includes(query)
    );
  }, [items, q]);

  // ✅ GROUP + SORT: month-year groups newest first, inside group newest createdAt first
=======
      normalize(`${it.date} ${it.code} ${it.title} ${it.duration} ${it.mode}`).includes(query)
    );
  }, [items, q]);

  // ✅ GROUP + SORT: date groups newest first
>>>>>>> 3aec7ea59936cbdfe079ff32d2cdb3041879a015
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of filteredItems) {
      const key = it.date || "—"; // ✅ month-year group
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    const entries = Array.from(map.entries());

<<<<<<< HEAD
=======
    // sort items inside date group by id desc (latest first) (simple)
>>>>>>> 3aec7ea59936cbdfe079ff32d2cdb3041879a015
    for (const [, arr] of entries) {
      arr.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

<<<<<<< HEAD
    entries.sort((a, b) => monthYearKey(b[0]) - monthYearKey(a[0]));
=======
    // sort date groups newest date first
    entries.sort((a, b) => dateKey(b[0]) - dateKey(a[0]));

>>>>>>> 3aec7ea59936cbdfe079ff32d2cdb3041879a015
    return entries;
  }, [filteredItems]);

  function resetForm() {
    setEditingId(null);
    setForm({ date: "", code: "", title: "", duration: "", mode: "Contact" });
  }

  async function onSubmit(e) {
    e.preventDefault();

    const payloadUI = {
      date: form.date.trim(),
      code: form.code.trim(),
      title: form.title.trim(),
      duration: form.duration.trim(),
      mode: form.mode,
    };

    if (!payloadUI.date || !payloadUI.code || !payloadUI.title) {
      alert("Please fill Date, Code, and Title.");
      return;
    }

<<<<<<< HEAD
    // ✅ IMPORTANT: Admin enters date as DD.MM.YYYY in form.
    // Convert it to month-year for grouping, but keep rawDate too.
    const rawDate = payload.date;
    const monthYear = monthYearFromDDMMYYYY(rawDate);

    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? {
                ...it,
                ...payload,
                date: monthYear,
                rawDate,
                createdAt: it.createdAt || Date.now(),
              }
            : it
        )
      );
    } else {
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          ...payload,
          date: monthYear,
          rawDate,
        },
        ...prev,
      ]);
=======
    const displayDateIso = ddmmyyyyToIso(payloadUI.date);
    if (!displayDateIso) {
      alert("Date format must be DD.MM.YYYY (example: 31.12.2025)");
      return;
>>>>>>> 3aec7ea59936cbdfe079ff32d2cdb3041879a015
    }

    const { startIso, endIso } = parseDurationToIsoRange(payloadUI.duration);
    if (!startIso || !endIso) {
      alert("Duration must contain start and end date in DD.MM.YYYY format.\nExample: 05.01.2026 - 09.01.2026");
      return;
    }

    // Backend payload
    const body = {
      displayDate: displayDateIso,
      code: payloadUI.code,
      programme: payloadUI.title,
      startDate: startIso,
      endDate: endIso,
      mode: payloadUI.mode,
    };

    try {
      setErrMsg("");

      if (editingId) {
        const res = await fetch(`${API}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
        const saved = await res.json();

        // Update UI list
        const updated = {
          id: saved.id,
          date: isoToDdmmyyyy(saved.displayDate),
          code: saved.code,
          title: saved.programme,
          duration: makeDurationDdMm(saved.startDate, saved.endDate),
          mode: saved.mode,
        };

        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
      } else {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`POST failed: ${res.status}`);
        const saved = await res.json();

        const created = {
          id: saved.id,
          date: isoToDdmmyyyy(saved.displayDate),
          code: saved.code,
          title: saved.programme,
          duration: makeDurationDdMm(saved.startDate, saved.endDate),
          mode: saved.mode,
        };

        setItems((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (e) {
      console.error(e);
      setErrMsg("Save failed. Check backend logs / CORS / date formats.");
    }
  }

  function onEdit(item) {
    setEditingId(item.id);
    setForm({
      // ✅ Show original DD.MM.YYYY in input
      date: item.rawDate || "",
      code: item.code || "",
      title: item.title || "",
      duration: item.duration || "",
      mode: item.mode || "Contact",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!confirm("Delete this programme?")) return;

    try {
      setErrMsg("");
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      setErrMsg("Delete failed. Check backend logs / CORS.");
    }
  }

  // Optional: import RAW_TEXT into DB (one click)
  async function importInitialToDb() {
    if (!confirm("Import RAW_TEXT items into DB? (This will add many rows)")) return;

    const list = parseRawToItems(RAW_TEXT);

    // Convert to backend payload list
    const payloads = list
      .map((it) => {
        const displayDate = ddmmyyyyToIso(it.date);
        const { startIso, endIso } = parseDurationToIsoRange(it.duration);
        if (!displayDate || !startIso || !endIso) return null;

        return {
          displayDate,
          code: it.code,
          programme: it.title,
          startDate: startIso,
          endDate: endIso,
          mode: it.mode,
        };
      })
      .filter(Boolean);

    try {
      setErrMsg("");
      // Insert one by one (simple)
      for (const p of payloads) {
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
        if (!res.ok) throw new Error(`Import POST failed: ${res.status}`);
      }

      // Reload after import
      const res2 = await fetch(API);
      const data = await res2.json();
      const ui = (data || []).map((x) => ({
        id: x.id,
        date: isoToDdmmyyyy(x.displayDate),
        code: x.code || "—",
        title: x.programme || "—",
        duration: makeDurationDdMm(x.startDate, x.endDate),
        mode: x.mode || "—",
      }));
      setItems(ui);
      alert("Import completed ✅");
    } catch (e) {
      console.error(e);
      setErrMsg("Import failed. Check backend logs / CORS / date formats.");
    }
  }

  async function refreshFromDb() {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await fetch(API);
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const data = await res.json();

      const ui = (data || []).map((x) => ({
        id: x.id,
        date: isoToDdmmyyyy(x.displayDate),
        code: x.code || "—",
        title: x.programme || "—",
        duration: makeDurationDdMm(x.startDate, x.endDate),
        mode: x.mode || "—",
      }));
      setItems(ui);
    } catch (e) {
      console.error(e);
      setErrMsg("Refresh failed. Check backend logs / CORS.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>Professional Development Programmes (PDP)</h1>
          <p>5 Days Training Program</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: month / year / code / title / mode..."
          />
          <button className="ghost" onClick={refreshFromDb} title="Reload from DB">
            Refresh
          </button>

          {isAdmin && (
            <button className="ghost" onClick={importInitialToDb} title="Import RAW_TEXT to DB">
              Import
            </button>
          )}
        </div>
      </header>

      {errMsg && <div className="empty" style={{ marginBottom: 12 }}>{errMsg}</div>}

      <div className="content">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : grouped.length === 0 ? (
          <div className="empty">No results found.</div>
        ) : (
          grouped.map(([date, arr]) => (
            <section className="group" key={date}>
              <div className="group-head">
                <div className="group-date">{date}</div>
                <div className="group-count">
                  {arr.length} Programme{arr.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="table">
                <div className="tr head">
                  <div>S.No</div>
                  <div>Code</div>
                  <div>Programme</div>
                  <div>Duration</div>
                  <div>Mode</div>
                  <div>Action</div>
                </div>

                {arr.map((it, idx) => (
                  <div className="tr" key={it.id}>
                    <div className="muted">{idx + 1}</div>
                    <div className="code">{it.code}</div>
                    <div className="programme">{it.title}</div>
                    <div className="muted">{it.duration}</div>
                    <div>
                      <span className={pillClass(it.mode)}>{it.mode}</span>
                    </div>

                    <div className="actions">
                      {isAdmin && (
                        <>
                          <button className="edit" onClick={() => onEdit(it)}>
                            Edit
                          </button>
                          <button className="del" onClick={() => onDelete(it.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {isAdmin && (
        <div className="panel bottom-form">
          <h2>{editingId ? "Edit Programme" : "Add Programme"}</h2>

          <form onSubmit={onSubmit} className="form">
            <label>
              Date (DD.MM.YYYY)
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="31.12.2025"
              />
            </label>

            <label>
              Code
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="CS-40-297"
              />
            </label>

            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Programme title..."
              />
            </label>

            <label>
              Duration (Start - End)
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="05.01.2026 - 09.01.2026"
              />
            </label>

            <label>
              Mode
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option>Contact</option>
                <option>Online</option>
                <option>Physical</option>
              </select>
            </label>

            <div className="btns">
              <button className="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            </div>

            <div className="note">Tip: Date / Code / Title are required. Duration must be DD.MM.YYYY - DD.MM.YYYY</div>
          </form>
        </div>
      )}

      <footer className="footer">
        Now connected to DB (Spring Boot → MySQL). Workbench is only for verifying data.
      </footer>
    </div>
  );
}