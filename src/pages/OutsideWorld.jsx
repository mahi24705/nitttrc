import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./OutsideWorld.css";

function OutsideWorld() {
  const { user } = useContext(AuthContext);

  const subHeadings = [
    { title: "Invited Talks", subtitle: "Speeches & Sessions" },
    { title: "Workshops", subtitle: "Training & Hands-on" },
    { title: "International Collaboration", subtitle: "Collaborations & Work" },
    { title: "Guest Lectures", subtitle: "Lectures & Interaction" },
  ];

  const headingTitles = subHeadings.map((x) => x.title);

  // ✅ Load from localStorage
  const initialData = () => {
    const saved = JSON.parse(localStorage.getItem("outsideData")) || {};
    const initialized = {};
    headingTitles.forEach((sub) => {
      initialized[sub] = saved[sub] || [];
    });
    return initialized;
  };

  const [data, setData] = useState(initialData);
  const [input, setInput] = useState({});
  const [active, setActive] = useState(null); // ✅ which card opened

  // ✅ Save automatically
  useEffect(() => {
    localStorage.setItem("outsideData", JSON.stringify(data));
  }, [data]);

  // ✅ Add (latest first)
  const handleAdd = (sub) => {
    const value = (input[sub] || "").trim();
    if (!value) return;

    setData({
      ...data,
      [sub]: [value, ...data[sub]],
    });

    setInput({ ...input, [sub]: "" });
  };

  // ✅ Delete
  const handleDelete = (sub, index) => {
    const updated = data[sub].filter((_, i) => i !== index);
    setData({ ...data, [sub]: updated });
  };

  // ✅ CARD VIEW (like screenshot)
  if (!active) {
    return (
      <div className="outside-page">
        <h2 className="outside-main-title">Outside World Interaction</h2>

        <div className="outside-card-grid">
          {subHeadings.map((item) => (
            <div
              key={item.title}
              className="outside-dashboard-card"
              onClick={() => setActive(item.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActive(item.title)}
            >
              <h3 className="dash-title">{item.title}</h3>
              <p className="dash-subtitle">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ DETAIL VIEW (when card clicked)
  return (
    <div className="outside-page">
      <div className="outside-header-row">
        <button className="back-btn" onClick={() => setActive(null)}>
          ← Back
        </button>
        <h2 className="outside-main-title">{active}</h2>
      </div>

      <div className="outside-detail-card">
        <ul className="detail-list">
          {data[active]?.length === 0 && (
            <li className="empty-text">No content yet</li>
          )}

          {data[active]?.map((item, idx) => (
            <li className="detail-item" key={idx}>
              <span className="detail-text">{item}</span>

              {user?.role === "admin" && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(active, idx)}
                  type="button"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>

        {user?.role === "admin" && (
          <div className="admin-box">
            <input
              type="text"
              placeholder={`Add ${active}`}
              value={input[active] || ""}
              onChange={(e) => setInput({ ...input, [active]: e.target.value })}
              className="admin-input"
            />
            <button
              onClick={() => handleAdd(active)}
              className="admin-add-btn"
              type="button"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutsideWorld;