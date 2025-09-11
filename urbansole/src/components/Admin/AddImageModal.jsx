import { useState } from "react";
import axios from "axios";


export default function AddProductImages({ productId, onClose }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [hover, setHover] = useState(null);
  const [sides, setSides] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      if (thumbnail) formData.append("thumbnail", thumbnail);
      if (hover) formData.append("hover", hover);
      sides.forEach((file) => formData.append("sides", file));

      await axios.post(
        `https://api-shoe-ecommerce.onrender.com/api/v1/product-images/${productId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      alert("Images uploaded successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add Product Images</h2>
        <form onSubmit={handleSubmit}>
          <label>Thumbnail</label>
          <input type="file" onChange={(e) => setThumbnail(e.target.files[0])} />

          <label>Hover</label>
          <input type="file" onChange={(e) => setHover(e.target.files[0])} />

          <label>Sides (3–5 images)</label>
          <input
            type="file"
            multiple
            onChange={(e) => setSides(Array.from(e.target.files))}
          />

          <button type="submit">Upload</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
