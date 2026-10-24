import { useEffect, useRef, useState } from 'react';
import { createPreviewUrl, revokePreviewUrl, validateImageFile } from '../../services/storage.service';

const MAX_IMAGES = 10;

const PropertyPhotoPicker = ({ onFilesChange, disabled = false }) => {
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => photosRef.current.forEach((photo) => revokePreviewUrl(photo.previewUrl));
  }, []);

  const addFiles = (files) => {
    setError('');
    const incoming = Array.from(files);
    if (photos.length + incoming.length > MAX_IMAGES) {
      setError(`Choose up to ${MAX_IMAGES} photos for this property.`);
      return;
    }

    const invalid = incoming.map((file) => validateImageFile(file)).find((result) => !result.valid);
    if (invalid) {
      setError(invalid.error);
      return;
    }

    const added = incoming.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: createPreviewUrl(file),
    }));
    const nextPhotos = [...photos, ...added];
    setPhotos(nextPhotos);
    onFilesChange(nextPhotos.map((photo) => photo.file));
  };

  const removePhoto = (id) => {
    const nextPhotos = photos.filter((photo) => photo.id !== id);
    const removedPhoto = photos.find((photo) => photo.id === id);
    if (removedPhoto) revokePreviewUrl(removedPhoto.previewUrl);
    setPhotos(nextPhotos);
    onFilesChange(nextPhotos.map((photo) => photo.file));
    setError('');
  };

  return (
    <section className="pf-section" id="pf-images">
      <h2 className="pf-section__title">Property photos</h2>
      <div className="pf-section__body pf-photos">
        <div className="pf-photos__intro">
          <div className="pf-photos__icon" aria-hidden="true">▧</div>
          <div>
            <p className="pf-photos__title">Show renters what makes this home special</p>
            <p className="pf-field-hint">
              Add bedrooms, kitchen, bathroom, living room, and exterior photos. The first photo will be the main listing image.
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          className="pf-photos__input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          disabled={disabled || photos.length >= MAX_IMAGES}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
          aria-label="Choose property photos"
        />
        <button
          type="button"
          className="pf-photos__add"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || photos.length >= MAX_IMAGES}
        >
          <span aria-hidden="true">＋</span>
          {photos.length ? 'Add more photos' : 'Choose property photos'}
        </button>
        <p className="pf-field-hint">JPG, PNG, or WEBP · 5 MB maximum per photo · {photos.length}/{MAX_IMAGES}</p>

        {error && <p className="pf-photos__error" role="alert">{error}</p>}

        {photos.length > 0 && (
          <div className="pf-photos__grid">
            {photos.map((photo, index) => (
              <div className="pf-photos__item" key={photo.id}>
                <img src={photo.previewUrl} alt={`Property preview ${index + 1}`} />
                {index === 0 && <span className="pf-photos__primary">Main photo</span>}
                <button
                  type="button"
                  className="pf-photos__remove"
                  onClick={() => removePhoto(photo.id)}
                  disabled={disabled}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyPhotoPicker;
