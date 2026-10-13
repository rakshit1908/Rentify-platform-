import { useState, useRef, useCallback } from 'react';
import { validateImageFile, createPreviewUrl, revokePreviewUrl } from '../../services/storage.service';
import { uploadPropertyImages, deletePropertyImage, setPrimaryImage } from '../../services/property.service';
import './ImageUploader.css';

/**
 * ImageUploader
 *
 * Props:
 *   propertyId      — required for saving to DB
 *   existingImages  — [{ id, image_url, is_primary }] already saved
 *   onImagesChange  — called when saved images list changes
 */
const ImageUploader = ({ propertyId, existingImages = [], onImagesChange }) => {
  // Pending files (not yet uploaded)
  const [pending, setPending] = useState([]);   // [{ id, file, previewUrl, error }]
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [globalError, setGlobalError] = useState('');
  const fileInputRef = useRef(null);

  /* ── Add files from input ────────────────────────────── */
  const addFiles = useCallback((files) => {
    setGlobalError('');
    const totalAfter = existingImages.length + pending.length + files.length;
    if (totalAfter > 10) {
      setGlobalError(`You can upload at most 10 images per property.`);
      return;
    }

    const newItems = [];
    for (const file of files) {
      const { valid, error } = validateImageFile(file);
      newItems.push({
        id:         `pending-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: createPreviewUrl(file),
        error:      valid ? null : error,
      });
    }
    setPending((p) => [...p, ...newItems]);
  }, [existingImages.length, pending.length]);

  const onInputChange = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  /* ── Remove pending file before upload ───────────────── */
  const removePending = (id) => {
    setPending((p) => {
      const item = p.find((x) => x.id === id);
      if (item) revokePreviewUrl(item.previewUrl);
      return p.filter((x) => x.id !== id);
    });
  };

  /* ── Upload all valid pending files ─────────────────── */
  const handleUpload = async () => {
    const valid = pending.filter((p) => !p.error);
    if (!valid.length) return;

    setUploading(true);
    setUploadProgress(0);
    setGlobalError('');

    try {
      const files = valid.map((p) => p.file);
      const res   = await uploadPropertyImages(propertyId, files);

      // Revoke preview URLs
      valid.forEach((p) => revokePreviewUrl(p.previewUrl));

      // Remove uploaded pending items
      const uploadedIds = new Set(valid.map((p) => p.id));
      setPending((p) => p.filter((x) => !uploadedIds.has(x.id)));

      // Notify parent
      const newImages = res.data?.images || [];
      onImagesChange?.([...existingImages, ...newImages]);

      if (res.data?.errors?.length) {
        setGlobalError(`${res.data.errors.length} file(s) failed to upload.`);
      }

      setUploadProgress(100);
    } catch (err) {
      setGlobalError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete existing image ───────────────────────────── */
  const handleDeleteExisting = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deletePropertyImage(propertyId, imageId);
      onImagesChange?.(existingImages.filter((img) => img.id !== imageId));
    } catch (err) {
      setGlobalError(err.message || 'Failed to delete image.');
    }
  };

  /* ── Set primary image ───────────────────────────────── */
  const handleSetPrimary = async (imageId) => {
    try {
      await setPrimaryImage(propertyId, imageId);
      onImagesChange?.(
        existingImages.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
    } catch (err) {
      setGlobalError(err.message || 'Failed to set primary image.');
    }
  };

  const validPending = pending.filter((p) => !p.error);
  const invalidPending = pending.filter((p) => p.error);

  return (
    <div className="image-uploader">
      {/* ── Saved images ─────────────────────────────── */}
      {existingImages.length > 0 && (
        <div className="iup-saved">
          <p className="iup-section-label">Uploaded images ({existingImages.length}/10)</p>
          <div className="iup-grid">
            {existingImages.map((img) => (
              <div key={img.id} className={`iup-thumb ${img.is_primary ? 'iup-thumb--primary' : ''}`}>
                <img src={img.image_url} alt="" className="iup-thumb__img" loading="lazy" />
                {img.is_primary && (
                  <span className="iup-thumb__badge">Primary</span>
                )}
                <div className="iup-thumb__actions">
                  {!img.is_primary && (
                    <button
                      className="iup-thumb__btn iup-thumb__btn--star"
                      onClick={() => handleSetPrimary(img.id)}
                      title="Set as primary"
                      aria-label="Set as primary image"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.3l-3.7 2 .7-4.1-3-2.9 4.2-.7L7 1z"
                          stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <button
                    className="iup-thumb__btn iup-thumb__btn--del"
                    onClick={() => handleDeleteExisting(img.id)}
                    title="Delete image"
                    aria-label="Delete image"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Drop zone ────────────────────────────────── */}
      {existingImages.length + pending.length < 10 && (
        <div
          className="iup-dropzone"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Click or drag images to upload"
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="iup-file-input"
            onChange={onInputChange}
            disabled={uploading}
          />
          <div className="iup-dropzone__icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4v16M8 12l8-8 8 8" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 24v2a2 2 0 002 2h20a2 2 0 002-2v-2" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="iup-dropzone__text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="iup-dropzone__hint">JPG, PNG, WEBP — max 5 MB each</p>
        </div>
      )}

      {/* ── Pending previews ─────────────────────────── */}
      {pending.length > 0 && (
        <div className="iup-pending">
          <p className="iup-section-label">Ready to upload ({validPending.length} valid)</p>
          <div className="iup-grid">
            {pending.map((item) => (
              <div key={item.id} className={`iup-thumb ${item.error ? 'iup-thumb--error' : ''}`}>
                <img src={item.previewUrl} alt="" className="iup-thumb__img" />
                {item.error && (
                  <div className="iup-thumb__error-msg" title={item.error}>!</div>
                )}
                <div className="iup-thumb__actions">
                  <button
                    className="iup-thumb__btn iup-thumb__btn--del"
                    onClick={() => removePending(item.id)}
                    title="Remove"
                    aria-label="Remove from queue"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {invalidPending.length > 0 && (
            <ul className="iup-errors">
              {invalidPending.map((item) => (
                <li key={item.id}>{item.error}</li>
              ))}
            </ul>
          )}

          {validPending.length > 0 && (
            <div className="iup-upload-bar">
              {uploading && (
                <div className="iup-progress">
                  <div className="iup-progress__bar" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              <button
                className="btn btn--secondary btn--md"
                onClick={handleUpload}
                disabled={uploading || !validPending.length}
              >
                {uploading
                  ? `Uploading ${validPending.length} file(s)…`
                  : `Upload ${validPending.length} image(s)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Global error ─────────────────────────────── */}
      {globalError && (
        <p className="iup-global-error" role="alert">{globalError}</p>
      )}
    </div>
  );
};

export default ImageUploader;
