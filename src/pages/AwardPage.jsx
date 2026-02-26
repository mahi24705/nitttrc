import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AwardPage.css";

function AwardPage() {
  const { user } = useContext(AuthContext);

  const subHeadings = ["Student Award", "Faculty Award"];

  const initialData = () => {
    const saved = JSON.parse(localStorage.getItem("awardData")) || {};
    const initialized = {};
    subHeadings.forEach((sub) => {
      initialized[sub] = saved[sub] || [];
    });
    return initialized;
  };

  const [data, setData] = useState(initialData);
  const [input, setInput] = useState({});

  useEffect(() => {
    localStorage.setItem("awardData", JSON.stringify(data));
  }, [data]);

  const handleAdd = (sub) => {
    if (!input[sub]?.trim()) return;

    setData({
      ...data,
      [sub]: [input[sub], ...data[sub]]
    });

    setInput({ ...input, [sub]: "" });
  };

  const handleDelete = (sub, idx) => {
    const updatedList = data[sub].filter((_, i) => i !== idx);
    setData({ ...data, [sub]: updatedList });
  };

  return (
    <div className="award-container">
      <h2 className="award-title">Awards & Recognition</h2>

      <div className="award-flex">

        {subHeadings.map((sub) => (
          <div key={sub} className="award-column">
            <h3>{sub}</h3>

            {/* ✅ POINT STYLE LIST */}
            <ul className="award-list">
              {data[sub].length === 0 && <li>No content yet</li>}

              {data[sub].map((item, idx) => (
                <li key={idx}>
                  <span>{item}</span>

                  {user?.role === "admin" && (
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(sub, idx)}
                    >
                      ✖
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {/* ✅ ADMIN INPUT */}
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
    </div>
  );
}

export default AwardPage;