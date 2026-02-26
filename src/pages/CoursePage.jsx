import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function CoursePage() {
  const { user } = useContext(AuthContext);

  const subHeadings = ["PDP", "PG", "ITECH", "Host Institution", "ICP"];

  const initialData = () => {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("courseData")) || {};
    } catch {
      saved = {};
    }

    const initialized = {};
    subHeadings.forEach((sub) => {
      initialized[sub] = saved[sub] || [];
    });

    return initialized;
  };

  const [data, setData] = useState(initialData);
  const [input, setInput] = useState({});

  useEffect(() => {
    localStorage.setItem("courseData", JSON.stringify(data));
  }, [data]);

  const handleAdd = (sub) => {
    if (!input[sub]) return;

    setData({
      ...data,
      [sub]: [input[sub], ...data[sub]],
    });

    setInput({ ...input, [sub]: "" });
  };

  const handleDelete = (sub, idx) => {
    const updated = data[sub].filter((_, i) => i !== idx);
    setData({ ...data, [sub]: updated });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Course
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {subHeadings.map((sub) => (
            <div
              key={sub}
              className="bg-white rounded-2xl shadow-md p-6 transition hover:shadow-lg"
            >
              {/* Heading */}
              <h3 className="text-xl font-semibold text-blue-600 mb-4">
                {sub}
              </h3>

              {/* List */}
              <ul className="space-y-2 mb-4">
                {data[sub].length === 0 && (
                  <li className="text-gray-400 italic text-sm">
                    No content yet
                  </li>
                )}

                {data[sub].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="text-gray-700">{item}</span>

                    {user?.role === "admin" && (
                      <button
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                        onClick={() => handleDelete(sub, idx)}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Admin Input */}
              {user?.role === "admin" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Add ${sub}`}
                    value={input[sub] || ""}
                    onChange={(e) =>
                      setInput({ ...input, [sub]: e.target.value })
                    }
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => handleAdd(sub)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursePage;