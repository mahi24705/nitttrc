import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./GalleryPage.css";

// ✅ Backend base (change IP if needed)
const API_BASE = "http://10.22.39.232:8080";
const API = `${API_BASE}/api/gallery`;

function GalleryPage() {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ Load from backend
  async function fetchImages() {
    try {
      setLoading(true);
      setErrMsg("");
      const res = await fetch(API);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErrMsg("Could not load gallery. Check backend /api/gallery");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchImages();
  }, []);

  // ✅ Upload to backend
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      alert("Please choose an image and enter title");
      return;
    }

    try {
      setErrMsg("");

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("file", file);

      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await res.text());

      const saved = await res.json();
      setImages((prev) => [saved, ...prev]);

      setTitle("");
      setFile(null);
      // reset file input
      document.getElementById("galleryFileInput").value = "";
    } catch (e2) {
      console.error(e2);
      setErrMsg("Upload failed. Check backend logs / file size / CORS.");
    }
  };

  // ✅ Delete from backend
  const handleDelete = async (id) => {
    if (!confirm("Delete this image?")) return;

    try {
      setErrMsg("");
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (e) {
      console.error(e);
      setErrMsg("Delete failed. Check backend logs / CORS.");
    }
  };

  // ✅ Update title (needs backend PUT endpoint)
  const handleUpdate = async (id) => {
    if (!editTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    try {
      setErrMsg("");

      // backend should accept JSON: { "title": "new title" }
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();

      setImages((prev) => prev.map((img) => (img.id === id ? updated : img)));
      setEditingId(null);
      setEditTitle("");
    } catch (e) {
      console.error(e);
      setErrMsg("Update failed. (Backend PUT /api/gallery/{id} not added?)");
    }
  };

  const filteredImages = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return images;
    return images.filter((img) => (img.title || "").toLowerCase().includes(q));
  }, [images, search]);

  return (
    <div className="gallery-container">
      <h1 className="header">Gallery</h1>

      {errMsg && <p className="empty-text">{errMsg}</p>}

      <div className="control-panel">
        {/* ✅ Upload form */}
        <form className="upload-section" onSubmit={handleUpload}>
          <input
            type="text"
            placeholder="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            id="galleryFileInput"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button type="submit" className="view-btn">
            Upload
          </button>
        </form>

        <input
          type="text"
          placeholder="Search images..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="gallery-grid">
        <AnimatePresence>
          {loading ? (
            <p className="empty-text">Loading...</p>
          ) : filteredImages.length === 0 ? (
            <p className="empty-text">Gallery is empty 📷</p>
          ) : (
            filteredImages.map((img) => {
              const imgUrl = `${API_BASE}/uploads/${img.fileName}`;

              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="gallery-card">
                    <img
                      src={imgUrl}
                      alt={img.title || "gallery"}
                      className="gallery-image"
                      onError={(e) => {
                        // if file not found, show placeholder message
                        e.currentTarget.alt = "Image not found in uploads folder";
                      }}
                    />

                    <div className="card-body">
                      <div className="action-buttons">
                        <button onClick={() => setPreview({ ...img, url: imgUrl })} className="view-btn">
                          View Details
                        </button>

                        <button
                          onClick={() => {
                            setEditingId(img.id);
                            setEditTitle(img.title || "");
                          }}
                          className="edit-btn"
                        >
                          Edit
                        </button>

                        <button onClick={() => handleDelete(img.id)} className="delete-btn">
                          Delete
                        </button>
                      </div>

                      {editingId === img.id && (
                        <div className="edit-section">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="edit-input"
                          />
                          <button onClick={() => handleUpdate(img.id)} className="save-btn">
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="modal-overlay"
            onClick={() => setPreview(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <img src={preview.url} alt="preview" />
              <h2>{preview.title}</h2>
              <button onClick={() => setPreview(null)} className="close-btn">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryPage;