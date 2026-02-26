import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./GalleryPages.css";

function GalleryPage() {
  const { user } = useContext(AuthContext);

  const [images, setImages] = useState([]);

  // ✅ Load images
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("galleryData")) || [];
    setImages(saved);
  }, []);

  // ✅ Save images
  useEffect(() => {
    localStorage.setItem("galleryData", JSON.stringify(images));
  }, [images]);

  // ✅ Handle Image Upload
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImages([reader.result, ...images]); // latest first
    };

    reader.readAsDataURL(file);
  };

  // ✅ Delete Image
  const handleDelete = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Gallery</h2>

      {/* ✅ IMAGE GRID */}
      <div className="gallery-grid">
        {images.length === 0 && <p>No images added</p>}

        {images.map((img, index) => (
          <div className="gallery-card" key={index}>
            <img src={img} alt="gallery" />

            {user?.role === "admin" && (
              <button onClick={() => handleDelete(index)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ✅ ADMIN UPLOAD */}
      {user?.role === "admin" && (
        <div className="admin-box">
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>
      )}
    </div>
  );
}

export default GalleryPage;