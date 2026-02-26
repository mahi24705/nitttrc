import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Dc() {
  const { user } = useContext(AuthContext);

  const [points, setPoints] = useState(() =>
    JSON.parse(localStorage.getItem("dcPoints")) || []
  );

  const [newPoint, setNewPoint] = useState("");

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("dcPoints", JSON.stringify(points));
  }, [points]);

  // ADD
  const addPoint = () => {
    if (!newPoint.trim()) return;
    setPoints([newPoint, ...points]); // newest first
    setNewPoint("");
  };

  // DELETE
  const deletePoint = (index) => {
    const updated = [...points];
    updated.splice(index, 1);
    setPoints(updated);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>DC</h2>

      {/* BULLET POINTS */}
      <ul>
        {points.map((p, i) => (
          <li key={i} style={{ marginBottom: "10px" }}>
            {p}

            {user?.role === "admin" && (
              <button
                onClick={() => deletePoint(i)}
                style={{
                  marginLeft: "10px",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* ADMIN ADD */}
      {user?.role === "admin" && (
        <div style={{ marginTop: "20px" }}>
          <input
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            placeholder="Add DC point"
            style={{ padding: "6px", marginRight: "10px" }}
          />
          <button
            onClick={addPoint}
            style={{
              padding: "6px 12px",
              background: "green",
              color: "white",
              border: "none"
            }}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default Dc;