import React, { useRef } from 'react';
import { Plus, Trash2, Camera, Video, AlertCircle } from "lucide-react";

const MediaStep = ({ formData, setFormData }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData({
      ...formData,
      images: [...(formData.images || []), ...newImages].slice(0, 3)
    });
  };

  const removeImage = (index) => {
    if (formData.images[index]?.preview) {
      URL.revokeObjectURL(formData.images[index].preview);
    }
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="form-section fade-in">
      <h3 className="section-title">Service Gallery</h3>

      <div className="media-guidelines">
        <div className="guideline-item">
          <AlertCircle size={16} />
          <span>Upload images that showcase your best AI work. (Max 3)</span>
        </div>
      </div>

      <div className="upload-grid-enhanced">
        {formData.images && formData.images[0] ? (
          <div className="preview-box main">
            <img src={formData.images[0].preview} alt="Primary" />
            <button className="remove-media-btn" onClick={() => removeImage(0)}><Trash2 size={16} /></button>
            <div className="media-tag">PRIMARY</div>
          </div>
        ) : (
          <div className="upload-box main" onClick={triggerUpload}>
            <div className="upload-icon-circle">
              <Camera size={32} />
            </div>
            <span>Upload Main Image</span>
            <p>High resolution (1280x720) recommended</p>
          </div>
        )}

        {formData.images && formData.images[1] ? (
          <div className="preview-box">
            <img src={formData.images[1].preview} alt="Gallery 1" />
            <button className="remove-media-btn" onClick={() => removeImage(1)}><Trash2 size={14} /></button>
          </div>
        ) : (
          <div className="upload-box small" onClick={triggerUpload}>
            <Plus size={24} />
            <span>Add Image</span>
          </div>
        )}

        {formData.images && formData.images[2] ? (
          <div className="preview-box">
            <img src={formData.images[2].preview} alt="Gallery 2" />
            <button className="remove-media-btn" onClick={() => removeImage(2)}><Trash2 size={14} /></button>
          </div>
        ) : (
          <div className="upload-box small" onClick={triggerUpload}>
            <Plus size={24} />
            <span>Add Image</span>
          </div>
        )}

        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          accept="image/*" 
          multiple 
          onChange={handleFileChange} 
        />
      </div>

      <div className="form-group" style={{ marginTop: '2rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Video size={16} style={{ color: '#60a5fa' }} />
          VIDEO DEMO (OPTIONAL)
        </label>
        <div className="video-input-wrapper">
          <input 
            type="text" 
            placeholder="Paste YouTube, Vimeo or Loom URL here..." 
            className="video-url-input"
            value={formData.videoLink || ""}
            onChange={(e) => setFormData({...formData, videoLink: e.target.value})}
          />
        </div>
        <p className="help-text">Video samples are shown to increase conversions by up to 25%.</p>
      </div>
    </div>
  );
};

export default MediaStep;
