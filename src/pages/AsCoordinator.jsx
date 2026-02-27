import { useEffect, useMemo, useState, useContext } from "react";
import "./AsCoordinator.css";
import { AuthContext } from "../context/AuthContext";

const STORAGE_KEY = "as_coordinator_items_v1";

/* 🔹 RAW TEXT DATA (AS COORDINATOR) */
const RAW_TEXT = `
30.12.2024 | 48 | Polytechnics/State Govt. Engg., College/ Private Engg., College | 4500 | 10384
30.01.2025 | 19 | Polytechnics/State Govt. Engg., College/ Private Engg., College | 0 | 5015
28.03.2025 | 40 | State Govt. Engg., College - CIT Coimbatore | Nil | 29500
28.03.2025 | 29 | Polytechnics/State Govt. Engg., College/ Private Engg., College/NITs/Others | Nil | 8260
30.08.2025 | 33 | Polytechnics/State Govt. Engg., College/ Private Engg., College/NITs/Others | nil | 7788.00
29.09.2025 | 30 | Polytechnics/State Govt. Engg., College/ Private Engg., College/NITs/Others | 6000 | 8850.00
29.10.2025 | 10 | Polytechnics/State Govt. Engg., College/ Private Engg., College/NITs/Others | 6000 | 2950
22.11.2025 | 42 | Polytechnics/State Govt. Engg., College/ Private Engg., College/NITs/Others | nil | 27258
31.12.2025 | 24 | Polytechnics/State Govt. Engg., College/ Private Engg., College/NITs/Others | 3000 | 15600
`;

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

// 🔹 Convert raw lines -> items
function parseRawToItems(raw) {
  const lines = raw
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const base = Date.now() - lines.length * 1000;

  return lines.map((line, idx) => {
    const parts = line.split("|").map((p) => p.trim());

    const date = parts[0] || "—";
    const teachers = parts[1] || "—";
    const institute = parts[2] || "—";
    const spent = parts[3] || "—";
    const fee = parts[4] || "—";

    return {
      id: crypto.randomUUID(),
      date,
      teachers,
      institute,
      spent,
      fee,
      createdAt: base + idx * 1000,
    };
  });
}

const INITIAL_ITEMS = parseRawToItems(RAW_TEXT);

// ✅ Ensure every item has createdAt (important for old localStorage data)
function ensureCreatedAt(list) {
  const now = Date.now();
  return (list || []).map((it, i) => ({
    ...it,
    createdAt: typeof it.createdAt === "number" ? it.createdAt : now - i * 1000,
  }));
}

export default function AsCoordinator() {
  const { isAdmin } = useContext(AuthContext);

  const [q, setQ] = useState("");

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return ensureCreatedAt(JSON.parse(saved));
    } catch {}
    return ensureCreatedAt(INITIAL_ITEMS);
  });

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: "",
    teachers: "",
    institute: "",
    spent: "",
    fee: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = normalize(q);
    if (!query) return items;
    return items.filter((it) =>
      normalize(
        `${it.date} ${it.teachers} ${it.institute} ${it.spent} ${it.fee}`
      ).includes(query)
    );
  }, [items, q]);

  // ✅ GROUP + SORT: date groups newest first, inside group newest createdAt first
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
    setForm({ date: "", teachers: "", institute: "", spent: "", fee: "" });
  }

  function onSubmit(e) {
    e.preventDefault();

    const payload = {
      date: form.date.trim(),
      teachers: form.teachers.trim(),
      institute: form.institute.trim(),
      spent: form.spent.trim(),
      fee: form.fee.trim(),
    };

    if (!payload.date || !payload.teachers || !payload.institute) {
      alert("Please fill Date, No. of Teachers, and Institute type.");
      return;
    }

    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? { ...it, ...payload, createdAt: it.createdAt || Date.now() }
            : it
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
    setForm({
      date: item.date || "",
      teachers: item.teachers || "",
      institute: item.institute || "",
      spent: item.spent || "",
      fee: item.fee || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDelete(id) {
    if (!confirm("Delete this entry?")) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function resetAll() {
    if (!confirm("Reset to initial data?")) return;
    setItems(ensureCreatedAt(INITIAL_ITEMS));
    setQ("");
    resetForm();
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-left">
          <h1>AS Coordinator</h1>
          <p>Training Technical Teachers</p>
        </div>

        <div className="hero-right">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: date / teachers / institute / amount..."
          />
          <button className="ghost" onClick={resetAll} title="Reset">
            Reset
          </button>
        </div>
      </header>

      <div className="content">
        {grouped.length === 0 ? (
          <div className="empty">No results found.</div>
        ) : (
          grouped.map(([date, arr]) => (
            <section className="group" key={date}>
              <div className="group-head">
                <div className="group-date">{date}</div>
                <div className="group-count">
                  {arr.length} Record{arr.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="table">
                <div className="tr head">
                  <div>S.No</div>
                  <div>No. Teachers</div>
                  <div>Institute Type</div>
                  <div>Amount Spent</div>
                  <div>Fee Collected</div>
                  <div>Action</div>
                </div>

                {arr.map((it, idx) => (
                  <div className="tr as" key={it.id}>
                    <div className="muted">{idx + 1}</div>
                    <div className="code">{it.teachers}</div>
                    <div className="programme">{it.institute}</div>
                    <div className="muted">{it.spent}</div>
                    <div className="muted">{it.fee}</div>

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
          <h2>{editingId ? "Edit Record" : "Add Record"}</h2>

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
              No. of Teachers Trained
              <input
                value={form.teachers}
                onChange={(e) => setForm({ ...form, teachers: e.target.value })}
                placeholder="48"
              />
            </label>

            <label>
              Institute Type / Details
              <input
                value={form.institute}
                onChange={(e) => setForm({ ...form, institute: e.target.value })}
                placeholder="Polytechnics / State Govt. Engg. College ..."
              />
            </label>

            <label>
              Overall Amount Spent
              <input
                value={form.spent}
                onChange={(e) => setForm({ ...form, spent: e.target.value })}
                placeholder="4500 / Nil"
              />
            </label>

            <label>
              Course Fee Collected
              <input
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                placeholder="10384"
              />
            </label>

            <div className="btns">
              <button className="primary" type="submit">
                {editingId ? "Update" : "Add"}
              </button>
              <button className="ghost" type="button" onClick={resetForm}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            </div>

            <div className="note">Tip: Date / Teachers / Institute are required.</div>
          </form>
        </div>
      )}

      <footer className="footer">
        Saved locally in browser (localStorage). Later we can connect DB.
      </footer>
    </div>
  );
}