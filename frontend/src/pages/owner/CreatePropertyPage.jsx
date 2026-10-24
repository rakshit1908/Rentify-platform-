import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createProperty, uploadPropertyImages } from '../../services/property.service';
import PropertyForm from '../../components/forms/PropertyForm';
import Button from '../../components/common/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ImageUploader from '../../components/property/ImageUploader';
import propertyImage from '../../assets/rentify_luxury_home_4x_large(1).png';
import './OwnerPages.css';

const OWNER_NAV_ITEMS = [
  { to: '/dashboard/owner', label: 'Dashboard', exact: true },
  { to: '/owner/properties', label: 'My Properties', exact: true },
  { to: '/owner/properties/new', label: 'Add New Property', exact: true },
  { to: '/owner/inquiries', label: 'Inquiries' },
];

const PROPERTY_STEPS = [
  { number: '01', label: 'Basic details', target: 'pf-basic' },
  { number: '02', label: 'Location & pricing', target: 'pf-location' },
  { number: '03', label: 'Amenities', target: 'pf-amenities' },
  { number: '04', label: 'Photos', target: 'pf-images' },
];

const formatRent = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return '₹ —';
  return `₹ ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
};

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  const [retryPhotos, setRetryPhotos] = useState([]);
  const [photoUploadError, setPhotoUploadError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleSubmit = async (data, photos = []) => {
    setSubmitting(true);
    try {
      const res = await createProperty(data);
      const propertyId = res.data?.property?.id;
      if (!propertyId) {
        throw new Error('The property was saved, but its listing ID was not returned. Please check My Properties before submitting again.');
      }
      setPhotoUploadError('');
      if (photos.length) {
        const savedImages = [];
        const failedPhotos = [];
        const failureDetails = [];
        for (const photo of photos) {
          try {
            const uploadRes = await uploadPropertyImages(propertyId, [photo]);
            const images = uploadRes.data?.images || [];
            if (images.length) {
              savedImages.push(...images);
            } else {
              failedPhotos.push(photo);
              failureDetails.push(`${photo.name}: ${uploadRes.data?.errors?.[0]?.error || 'The server returned no saved image.'}`);
            }
          } catch (uploadError) {
            failedPhotos.push(photo);
            failureDetails.push(`${photo.name}: ${uploadError.message || 'Upload failed.'}`);
          }
        }
        setUploadedImages(savedImages);
        setRetryPhotos(failedPhotos);
        if (failedPhotos.length) {
          setPhotoUploadError(`${failedPhotos.length} photo(s) could not be uploaded. They are still queued below so you can retry. ${failureDetails.join(' ')}`);
        }
      }
      setSuccess(propertyId);
      setSubmitting(false);
      return null;
    } catch (err) {
      setSubmitting(false);
      return {
        errors: err.errors?.length
          ? err.errors
          : [{ field: '_', message: err.message || 'Could not create the property. Please try again.' }],
      };
    }
  };

  return (
    <DashboardLayout navItems={OWNER_NAV_ITEMS} role="owner">
      <div className="owner-page owner-page--create">
        <div className="owner-page__header">
          <div className="container owner-create__hero-content">
            <div className="owner-create__heading">
              <span className="owner-create__eyebrow">Owner workspace · New listing</span>
              <h1 className="owner-page__title">Add New Property</h1>
              <p className="owner-page__sub">Create a clear, detailed listing and help the right renter find their next home.</p>
            </div>
            <nav className="owner-create__steps" aria-label="Property listing sections">
              {PROPERTY_STEPS.map((step, index) => (
                <div className="owner-create__step-wrap" key={step.target}>
                  <button
                    type="button"
                    className="owner-create__step"
                    onClick={() => document.getElementById(step.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    <span className="owner-create__step-number">{step.number}</span>
                    <span className="owner-create__step-label">{step.label}</span>
                  </button>
                  {index < PROPERTY_STEPS.length - 1 && <span className="owner-create__step-divider" aria-hidden="true" />}
                </div>
              ))}
            </nav>
          </div>
        </div>
        <div className="container owner-page__body owner-page__body--form">
          {success ? (
            <div className="owner-page__success">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#2d7a4f" strokeWidth="2"/>
                <path d="M12 20l6 6 10-12" stroke="#2d7a4f" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2>Your property is listed</h2>
              <p>Your property details are saved. You can manage its photos here or later from My Properties.</p>
              {photoUploadError && <p className="owner-page__upload-error" role="alert">{photoUploadError}</p>}
              <section className="owner-page__success-upload" aria-label="Add property photos">
                <ImageUploader
                  propertyId={success}
                  existingImages={uploadedImages}
                  initialFiles={retryPhotos}
                  onImagesChange={setUploadedImages}
                />
              </section>
              <div className="owner-page__success-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/owner/properties/${success}/images`)}
                >
                  Manage photos
                </Button>
                <Link to="/owner/properties" className="btn btn--outline btn--lg">
                  Finish and view My Properties
                </Link>
              </div>
            </div>
          ) : (
            <>
              <PropertyForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={() => navigate('/owner/properties')}
                onFormChange={setPreview}
                submitting={submitting}
              />
              <aside className="owner-create__sidebar" aria-label="Live property preview and listing tips">
                <section className="owner-create__preview-card">
                  <div className="owner-create__preview-heading">
                    <div>
                      <span className="owner-create__preview-kicker">Live preview</span>
                      <h2>Your listing card</h2>
                    </div>
                    <span className="owner-create__live"><i /> Preview</span>
                  </div>
                  <div className="owner-create__preview-image">
                    <img src={propertyImage} alt="Example rental property" />
                    <span className="owner-create__preview-status">
                      {preview.status === 'rented' ? 'Rented' : 'Available'}
                    </span>
                  </div>
                  <div className="owner-create__preview-body">
                    <span className="owner-create__preview-type">
                      {preview.property_type
                        ? preview.property_type.replace('_', ' ')
                        : 'Property type'}
                    </span>
                    <h3>{preview.title?.trim() || 'Your property title'}</h3>
                    <p className="owner-create__preview-location">
                      {[preview.city, preview.state].filter(Boolean).join(', ') || 'City, State'}
                    </p>
                    <strong className="owner-create__preview-rent">{formatRent(preview.rent)}<small> / month</small></strong>
                    <div className="owner-create__preview-facts">
                      <span>{preview.bedrooms || '—'} beds</span>
                      <span>{preview.bathrooms || '—'} baths</span>
                      <span>{preview.area ? `${preview.area} sq ft` : 'Area —'}</span>
                    </div>
                    <p className="owner-create__preview-amenities">
                      {preview.amenities?.length
                        ? `${preview.amenities.length} amenities selected`
                        : 'Selected amenities will appear here'}
                    </p>
                  </div>
                </section>

                <section className="owner-create__tips-card">
                  <h2><span aria-hidden="true">✦</span> Tips for a great listing</h2>
                  <ul>
                    <li>Use a clear title with the home type and area.</li>
                    <li>Describe nearby landmarks and useful details.</li>
                    <li>Choose an accurate monthly rent and amenities.</li>
                    <li>Add property photos after saving your listing.</li>
                  </ul>
                </section>
              </aside>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreatePropertyPage;
