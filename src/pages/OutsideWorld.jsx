import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./OutsideWorld.css";

function OutsideWorld() {
  const { user } = useContext(AuthContext);

  const subHeadings = [
    "Invited Talks",
    "Workshops",
    "International Collaboration",
    "Guest Lectures"
  ];

  // ✅ Load from localStorage
  const initialData = () => {
    const saved = JSON.parse(localStorage.getItem("outsideData")) || {};
    const initialized = {};
    subHeadings.forEach((sub) => {
      initialized[sub] = saved[sub] || [];
    });
    return initialized;
  };

  const [data, setData] = useState(initialData);
  const [input, setInput] = useState({});

  // ✅ Save automatically
  useEffect(() => {
    localStorage.setItem("outsideData", JSON.stringify(data));
  }, [data]);

  // ✅ Add (latest first)
  const handleAdd = (sub) => {
    if (!input[sub]) return;

    setData({
      ...data,
      [sub]: [input[sub], ...data[sub]]
    });

    setInput({ ...input, [sub]: "" });
  };

  // ✅ Delete
  const handleDelete = (sub, index) => {
    const updated = data[sub].filter((_, i) => i !== index);
    setData({ ...data, [sub]: updated });
  };

  return (
    <div className="outside-container">
      <h2 className="outside-title">Outside World Interaction</h2>

      {subHeadings.map((sub) => (
        <div className="outside-section" key={sub}>
          <h3>{sub}</h3>

          <ul>
            {data[sub].length === 0 && <li>No content yet</li>}
            {data[sub].map((item, idx) => (
              <li key={idx}>
                {item}
                {user?.role === "admin" && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(sub, idx)}
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
                placeholder={`Add ${sub}`}
                value={input[sub] || ""}
                onChange={(e) =>
                  setInput({ ...input, [sub]: e.target.value })
                }
              />
              <button onClick={() => handleAdd(sub)}>Add</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OutsideWorld;