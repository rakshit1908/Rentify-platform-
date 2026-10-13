import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../../services/property.service';
import PropertyForm from '../../components/forms/PropertyForm';
import './OwnerPages.css';

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await createProperty(data);
      const propertyId = res.data?.property?.id;
      setSuccess(propertyId);
      // Redirect to image upload for the new property
      setTimeout(() => navigate(`/owner/properties/${propertyId}/images`), 800);
      return null;
    } catch (err) {
      setSubmitting(false);
      return { errors: err.errors || [{ field: '_', message: err.message }] };
    }
  };

  return (
    <div className="owner-page">
      <div className="owner-page__header">
        <div className="container">
          <h1 className="owner-page__title">Add New Property</h1>
          <p className="owner-page__sub">Fill in the details below to list your property.</p>
        </div>
      </div>
      <div className="container owner-page__body">
        {success ? (
          <div className="owner-page__success">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--color-secondary-500)" strokeWidth="2"/>
              <path d="M12 20l6 6 10-12" stroke="var(--color-secondary-500)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Property created! Redirecting to image upload...</p>
          </div>
        ) : (
          <PropertyForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/owner/properties')}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default CreatePropertyPage;
