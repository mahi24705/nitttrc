import { useContext, useEffect, useMemo, useState } from "react";
import "./CrudTablePage.css";
import { AuthContext } from "../context/AuthContext";

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

// DD.MM.YYYY -> sortable number
function dateKey(ddmmyyyy) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy || "");
  if (!m) return 0;
  const [, dd, mm, yy] = m;
  return Number(`${yy}${mm}${dd}`);
}

function ensureCreatedAt(list) {
  const now = Date.now();
  return (list || []).map((it, i) => ({
    ...it,
    createdAt: typeof it.createdAt === "number" ? it.createdAt : now - i * 1000,
  }));
}

export default function CrudTablePage({
  title,
  subtitle,
  storageKey,
  columns, // [{ key, label, className? }]
  formFields, // [{ key, label, placeholder, type?, required?, options? }]
  defaultForm, // object
}) {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return ensureCreatedAt(JSON.parse(saved));
    } catch {}
    return []; // ✅ no RAW data; start empty and add via CRUD
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;

    return items.filter((it) =>
      normalize(
        columns.map((c) => String(it[c.key] ?? "")).join(" ")
      ).includes(query)
    );
  }, [items, q, columns]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of filteredItems) {
      const key = it.date || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    }

    const entries = Array.from(map.entries());

    for (const [, arr] of entries) {
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    entries.sort((a, b) => dateKey(b[0]) - dateKey(a[0]));
    return entries;
  }, [filteredItems]);

  function resetForm() {
    setEditingId(null);
    setForm(defaultForm);
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {};
    for (const f of formFields) {
      payload[f.key] = String(form[f.key] ?? "").trim();
    }

    // required validation
    for (const f of formFields) {
      if (f.required && !payload[f.key]) {
        alert(`Please fill ${f.label}.`);
        return;
      }
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId ? { ...it, ...payload } : it
        )
      );
    } else {
      setItems((prev) => [
        { id: crypto.randomUUID(), createdAt: Date.now(), ...payload },
        ...prev,
      ]);
    }

    resetForm();
  }

  function onEdit(item) {
    setEditingId(item.id);
    const next = { ...defaultForm };
    for (const f of formFields) next[f.key] = item[f.key] ?? "";
    setForm(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!confirm("Delete this entry?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function resetAll() {
    if (!confirm("Clear all saved data?")) return;
    localStorage.removeItem(storageKey);
    setItems([]);
    setQ("");
    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
          />
          {isAdmin && (
            <button className="ghost" onClick={resetAll} title="Clear">
              Clear
            </button>
          )}
        </div>
      </header>

      <div className="content">
        {grouped.length === 0 ? (
          <div className="empty">No data yet.</div>
        ) : (
          grouped.map(([date, arr]) => (
            <section className="group" key={date}>
              <div className="group-head">
                <div className="group-date">{date}</div>
                <div className="group-count">
                  {arr.length} Item{arr.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="table">
                <div className="tr head">
                  <div>S.No</div>
                  {columns.map((c) => (
                    <div key={c.key}>{c.label}</div>
                  ))}
                  <div>Action</div>
                </div>

                {arr.map((it, idx) => (
                  <div className="tr" key={it.id}>
                    <div className="muted">{idx + 1}</div>

                    {columns.map((c) => (
                      <div key={c.key} className={c.className || ""}>
                        {it[c.key] || "—"}
                      </div>
                    ))}

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
          <h2>{editingId ? "Edit" : "Add"}</h2>

          <form onSubmit={onSubmit} className="form">
            {formFields.map((f) => (
              <label key={f.key}>
                {f.label}
                {f.options ? (
                  <select
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  >
                    {f.options.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type || "text"}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder || ""}
                  />
                )}
              </label>
            ))}

            <div className="btns">
              <button className="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="footer">
        Saved locally in browser (localStorage). Later we can connect DB.
      </footer>
    </div>
  );
}