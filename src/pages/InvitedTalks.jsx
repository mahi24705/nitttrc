import { useEffect, useMemo, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // ✅ if your file is inside src/pages/OutsideWorld/
import "./InvitedTalks.css";

function InvitedTalks() {
  const { user } = useContext(AuthContext);

  // ✅ LocalStorage Key
  const STORAGE_KEY = "invited_talks_pdp";

  // ✅ Each record structure:
  // { dateGroup:"31.01.2026", code:"PDP", programme:"...", duration:"05.01.2026 - 09.01.2026", mode:"Contact" }

  const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const [rows, setRows] = useState(load);

  // header search
  const [query, setQuery] = useState("");

  // admin form (optional)
  const [form, setForm] = useState({
    dateGroup: "",
    code: "",
    programme: "",
    duration: "",
    mode: "Contact",
  });

  // edit state
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      return (
        (r.dateGroup || "").toLowerCase().includes(q) ||
        (r.code || "").toLowerCase().includes(q) ||
        (r.programme || "").toLowerCase().includes(q) ||
        (r.duration || "").toLowerCase().includes(q) ||
        (r.mode || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  // group by dateGroup
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((r) => {
      map[r.dateGroup] = map[r.dateGroup] || [];
      map[r.dateGroup].push(r);
    });

    // sort groups newest-first by dd.mm.yyyy
    const toSortable = (d) => {
      const [dd, mm, yyyy] = (d || "").split(".");
      return `${yyyy || "0000"}-${mm || "00"}-${dd || "00"}`;
    };

    return Object.keys(map)
      .sort((a, b) => (toSortable(b) > toSortable(a) ? 1 : -1))
      .map((dateGroup) => ({ dateGroup, items: map[dateGroup] }));
  }, [filtered]);

  const resetSearch = () => setQuery("");

  const clearForm = () => {
    setForm({ dateGroup: "", code: "", programme: "", duration: "", mode: "Contact" });
    setEditingIndex(null);
  };

  const addOrUpdate = () => {
    const dateGroup = form.dateGroup.trim();
    const programme = form.programme.trim();

    if (!dateGroup || !programme) return;

    const payload = {
      dateGroup,
      code: form.code.trim() || "-",
      programme,
      duration: form.duration.trim() || "-",
      mode: form.mode || "Contact",
    };

    if (editingIndex !== null) {
      setRows((prev) => prev.map((r, i) => (i === editingIndex ? payload : r)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }

    clearForm();
  };

  const onEdit = (globalIndex) => {
    const r = rows[globalIndex];
    setForm({
      dateGroup: r.dateGroup || "",
      code: r.code || "",
      programme: r.programme || "",
      duration: r.duration || "",
      mode: r.mode || "Contact",
    });
    setEditingIndex(globalIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = (globalIndex) => {
    setRows((prev) => prev.filter((_, i) => i !== globalIndex));
  };

  // To map grouped rows back to original index for edit/delete
  const findGlobalIndex = (item) => {
    // because objects are saved by value, safest match by fields
    return rows.findIndex(
      (r) =>
        r.dateGroup === item.dateGroup &&
        r.code === item.code &&
        r.programme === item.programme &&
        r.duration === item.duration &&
        r.mode === item.mode
    );
  };

  return (
    <div className="pdp-page">
      {/* ✅ TOP HEADER BAR (like PDP screenshot) */}
      <div className="pdp-hero">
        <div className="pdp-hero-left">
          <h1>Invited Talks</h1>
          <p>PDP Format Template</p>
        </div>

        <div className="pdp-hero-right">
          <input
            className="pdp-search"
            placeholder="Search: date / code / title / mode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="pdp-reset" onClick={resetSearch} type="button">
            Reset
          </button>
        </div>
      </div>

      {/* ✅ ADMIN ADD / EDIT FORM (optional but useful) */}
      {user?.role === "admin" && (
        <div className="pdp-form-card">
          <div className="pdp-form-grid">
            <input
              placeholder="Date Group (dd.mm.yyyy) e.g., 31.01.2026"
              value={form.dateGroup}
              onChange={(e) => setForm({ ...form, dateGroup: e.target.value })}
            />
            <input
              placeholder="Code (optional) e.g., PDP / CONF"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              placeholder="Duration (optional) e.g., 05.01.2026 - 09.01.2026"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
            >
              <option value="Contact">Contact</option>
              <option value="Physical">Physical</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <textarea
              placeholder="Programme / Talk Title + Details (you will paste your content here)"
              value={form.programme}
              onChange={(e) => setForm({ ...form, programme: e.target.value })}
              rows={3}
            />

            <div className="pdp-form-actions">
              <button className="btn-primary" type="button" onClick={addOrUpdate}>
                {editingIndex !== null ? "Update" : "Add"}
              </button>
              <button className="btn-ghost" type="button" onClick={clearForm}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ GROUPED SECTIONS */}
      <div className="pdp-body">
        {grouped.length === 0 ? (
          <div className="pdp-empty">No content yet</div>
        ) : (
          grouped.map((g) => (
            <div className="pdp-section" key={g.dateGroup}>
              <div className="pdp-section-head">
                <span className="pdp-date">{g.dateGroup}</span>
                <span className="pdp-badge">{g.items.length} Programme{g.items.length > 1 ? "s" : ""}</span>
              </div>

              {/* ✅ TABLE (like screenshot) */}
              <div className="pdp-table">
                <div className="pdp-row pdp-row-head">
                  <div>S.NO</div>
                  <div>CODE</div>
                  <div>PROGRAMME</div>
                  <div>DURATION</div>
                  <div>MODE</div>
                  <div>ACTION</div>
                </div>

                {g.items.map((item, idx) => {
                  const globalIndex = findGlobalIndex(item);
                  return (
                    <div className="pdp-row" key={idx}>
                      <div>{idx + 1}</div>
                      <div className="pdp-code">{item.code}</div>
                      <div className="pdp-programme">{item.programme}</div>
                      <div className="pdp-duration">{item.duration}</div>
                      <div>
                        <span className={`pdp-pill ${item.mode?.toLowerCase()}`}>
                          {item.mode}
                        </span>
                      </div>
                      <div className="pdp-actions">
                        <button
                          className="pdp-edit"
                          type="button"
                          onClick={() => onEdit(globalIndex)}
                          disabled={user?.role !== "admin"}
                          title={user?.role !== "admin" ? "Admin only" : "Edit"}
                        >
                          Edit
                        </button>
                        <button
                          className="pdp-delete"
                          type="button"
                          onClick={() => onDelete(globalIndex)}
                          disabled={user?.role !== "admin"}
                          title={user?.role !== "admin" ? "Admin only" : "Delete"}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InvitedTalks;