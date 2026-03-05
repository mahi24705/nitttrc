import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import "./AwardPage.css";

function AwardPage() {
  const { user } = useContext(AuthContext);

  const categories = ["Student Awards", "Faculty Awards"];

  const initialData = () => {
    const saved = JSON.parse(localStorage.getItem("awardData")) || {};
    const initialized = {};
    categories.forEach((cat) => {
      initialized[cat] = saved[cat] || [];
    });
    return initialized;
  };

  const [data, setData] = useState(initialData);
  const [input, setInput] = useState({});
  const [year, setYear] = useState({});
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    localStorage.setItem("awardData", JSON.stringify(data));
  }, [data]);

  // ➕ Add Award
  const handleAdd = (cat) => {
    if (!input[cat]?.trim() || !year[cat]) return;

    const newAward = {
      text: input[cat],
      year: year[cat],
    };

    setData({
      ...data,
      [cat]: [newAward, ...data[cat]],
    });

    setInput({ ...input, [cat]: "" });
    setYear({ ...year, [cat]: "" });
  };

  // ❌ Delete
  const handleDelete = (cat, idx) => {
    const updated = data[cat].filter((_, i) => i !== idx);
    setData({ ...data, [cat]: updated });
  };

  // ✏ Edit
  const handleEdit = (cat, idx) => {
    const item = data[cat][idx];
    setInput({ ...input, [cat]: item.text });
    setYear({ ...year, [cat]: item.year });
    setEditing({ cat, idx });
  };

  const handleUpdate = (cat) => {
    const updated = [...data[cat]];
    updated[editing.idx] = {
      text: input[cat],
      year: year[cat],
    };

    setData({ ...data, [cat]: updated });
    setEditing(null);
    setInput({ ...input, [cat]: "" });
    setYear({ ...year, [cat]: "" });
  };

  return (
    <div className="award-container">
      <h2 className="award-title">🏆 Awards & Recognition</h2>

      <div className="award-flex">
        {categories.map((cat) => (
          <motion.div
            key={cat}
            className="award-column"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>{cat}</h3>

            <ul className="award-list">
              {data[cat].length === 0 && <li>No content yet</li>}

              {data[cat].map((item, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  className="award-item"
                >
                  <div className="award-text">
                    🎖 <span>{item.text}</span>
                    <span className="award-year">{item.year}</span>
                  </div>

                  {user?.role === "admin" && (
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(cat, idx)}>✏</button>
                      <button onClick={() => handleDelete(cat, idx)}>✖</button>
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>

            {user?.role === "admin" && (
              <div className="admin-box">
                <input
                  type="text"
                  placeholder={`Award title`}
                  value={input[cat] || ""}
                  onChange={(e) =>
                    setInput({ ...input, [cat]: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Year"
                  value={year[cat] || ""}
                  onChange={(e) =>
                    setYear({ ...year, [cat]: e.target.value })
                  }
                />

                {editing?.cat === cat ? (
                  <button onClick={() => handleUpdate(cat)}>Update</button>
                ) : (
                  <button onClick={() => handleAdd(cat)}>Add</button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AwardPage;