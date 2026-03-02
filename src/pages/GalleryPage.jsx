import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./GalleryPages.css";

function GalleryPage() {
  const { user } = useContext(AuthContext);

  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  // 🔄 Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("galleryData")) || [];
    setImages(saved);
  }, []);

  // 💾 Save to localStorage
  useEffect(() => {
    localStorage.setItem("galleryData", JSON.stringify(images));
  }, [images]);

  // 📤 Upload Image (Admin Only)
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !title.trim()) return alert("Add title and image");

    const reader = new FileReader();

    reader.onloadend = () => {
      const newImage = {
        id: Date.now(),
        url: reader.result,
        title: title.trim(),
      };

      setImages([newImage, ...images]);
      setTitle("");
      e.target.value = null;
    };

    reader.readAsDataURL(file);
  };

  // ❌ Delete Image
  const handleDelete = (id) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
  };

  // 🔎 Search filter
  const filteredImages = images.filter((img) =>
    img.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gallery-container">
      <h1 className="gallery-heading">✨ 3D Gallery CRUD</h1>

      {/* 🔍 Search */}
      <input
        className="search-input"
        type="text"
        placeholder="🔎 Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 👑 Admin Upload */}
      {user?.role === "admin" && (
        <div className="admin-box">
          <input
            type="text"
            placeholder="Image title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>
      )}

      {/* 🖼️ Image Grid */}
      <div className="gallery-grid">
        {filteredImages.length === 0 && (
          <p className="empty">Gallery is empty 📷</p>
        )}

        {filteredImages.map((img) => (
          <div className="gallery-card" key={img.id}>
            <img src={img.url} alt={img.title} />
            <div className="card-footer">
              <span>{img.title}</span>

              {user?.role === "admin" && (
                <button onClick={() => handleDelete(img.id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GalleryPage;