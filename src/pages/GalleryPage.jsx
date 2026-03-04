import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./GalleryPage.css";

function GalleryPage() {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [preview, setPreview] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("galleryImages")) || [];
    setImages(saved);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("galleryImages", JSON.stringify(images));
  }, [images]);

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (!file || !title.trim()) {
      alert("Please add image and title");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = {
        id: Date.now(),
        url: reader.result,
        title,
      };

      setImages((prev) => [newImage, ...prev]);
      setTitle("");
      e.target.value = null;
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleUpdate = (id) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, title: editTitle } : img
    );

    setImages(updated);
    setEditingId(null);
    setEditTitle("");
  };

  const filteredImages = images.filter((img) =>
    img.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gallery-container">
      <h1 className="header">Gallery</h1>

      <div className="control-panel">
        <div className="upload-section">
          <input
            type="text"
            placeholder="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>

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
          {filteredImages.length === 0 ? (
            <p className="empty-text">Gallery is empty 📷</p>
          ) : (
            filteredImages.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="gallery-card">
                  <img
                    src={img.url}
                    alt="gallery"
                    className="gallery-image"
                  />

                  <div className="card-body">
                    <div className="action-buttons">
                      <button
                        onClick={() => setPreview(img)}
                        className="view-btn"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(img.id);
                          setEditTitle(img.title);
                        }}
                        className="edit-btn"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(img.id)}
                        className="delete-btn"
                      >
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
                        <button
                          onClick={() => handleUpdate(img.id)}
                          className="save-btn"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
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
              <button
                onClick={() => setPreview(null)}
                className="close-btn"
              >
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