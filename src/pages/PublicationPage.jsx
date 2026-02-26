import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./PublicationPage.css";

function PublicationPage() {
  const { user } = useContext(AuthContext);

  const subHeadings = ["Journal", "Conference", "Book"];

  // ✅ Initialize data from localStorage
  const initialData = () => {
    const saved = JSON.parse(localStorage.getItem("publicationData")) || {};
    const initialized = {};
    subHeadings.forEach((sub) => {
      initialized[sub] = saved[sub] || [];
    });
    return initialized;
  };

  const [data, setData] = useState(initialData);
  const [input, setInput] = useState({});

  // ✅ Save data
  useEffect(() => {
    localStorage.setItem("publicationData", JSON.stringify(data));
  }, [data]);

  // ✅ Add content (latest first)
  const handleAdd = (sub) => {
    if (!input[sub]) return;

    const updated = {
      ...data,
      [sub]: [input[sub], ...data[sub]],
    };

    setData(updated);
    setInput({ ...input, [sub]: "" });
  };

  // ✅ Delete content
  const handleDelete = (sub, index) => {
    const updatedList = data[sub].filter((_, i) => i !== index);
    setData({ ...data, [sub]: updatedList });
  };

  return (
    <div className="publication-container">
      <h2 className="publication-title">Publications</h2>

      <div className="publication-flex">
        {subHeadings.map((sub) => (
          <div className="publication-column" key={sub}>
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
    </div>
  );
}

export default PublicationPage;