import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function NetworkIncharge() {
  const { user } = useContext(AuthContext);

  // ===== STATE =====
  const [list, setList] = useState(() =>
    JSON.parse(localStorage.getItem("networkIncharge")) || []
  );

  const [date, setDate] = useState("");
  const [content, setContent] = useState("");

  // ===== SAVE =====
  useEffect(() => {
    localStorage.setItem("networkIncharge", JSON.stringify(list));
  }, [list]);

  // ===== ADD =====
  const addItem = () => {
    if (!date || !content.trim()) return;

    const newItem = { date, content };

    setList([newItem, ...list]); // latest first
    setDate("");
    setContent("");
  };

  // ===== DELETE =====
  const deleteItem = (index) => {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  };

  return (
    <div style={styles.container}>
      <h2>Network Incharge</h2>

      {/* ===== LIST ===== */}
      <div>
        {list.map((item, index) => (
          <div key={index} style={styles.card}>
            
            {/* DATE BOX */}
            <div style={styles.dateBox}>
              {item.date}
            </div>

            {/* CONTENT */}
            <div style={styles.contentBox}>
              {item.content}
            </div>

            {/* DELETE */}
            {user?.role === "admin" && (
              <button
                onClick={() => deleteItem(index)}
                style={styles.delete}
              >
                ✖
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ===== ADMIN INPUT ===== */}
      {user?.role === "admin" && (
        <div style={styles.inputBox}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            //type="text"
            placeholder="Enter content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button onClick={addItem}>Add</button>
        </div>
      )}
    </div>
  );
}

export default NetworkIncharge;


const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
    color: "#000"
  },

 card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "15px auto",
    width: "600px",

    background: "rgba(255,255,255,0.85)", // ✅ more visible
    backdropFilter: "blur(10px)",

    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",

    color: "#000" // ✅ ensure text is dark
  },

 dateBox: {
    minWidth: "120px",
    background: "#00c6ff",
    color: "#000",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "bold",
    textAlign: "center"
  },

   contentBox: {
    flex: 1,
    marginLeft: "20px",
    textAlign: "left",
    color: "#000" // ✅ ensure visibility
  },

 delete: {
    marginLeft: "10px",
    background: "#ff4d4f",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer"
  },

   inputBox: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  }
};