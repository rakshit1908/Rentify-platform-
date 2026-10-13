import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPropertyById, updateProperty } from '../../services/property.service';
import PropertyForm from '../../components/forms/PropertyForm';
import Loader    from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import './OwnerPages.css';

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPropertyById(id)
      .then((res) => setProperty(res.data?.property || null))
      .catch((err) => setError(err.message || 'Failed to load property.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await updateProperty(id, data);
      navigate('/owner/properties');
      return null;
    } catch (err) {
      setSubmitting(false);
      return { errors: err.errors || [{ field: '_', message: err.message }] };
    }
  };

  if (loading) return <Loader fullPage label="Loading property..." />;
  if (error)   return (
    <div className="container section">
      <ErrorState type="page" title="Could not load property" description={error} />
    </div>
  );

  return (
    <div className="owner-page">
      <div className="owner-page__header">
        <div className="container">
          <h1 className="owner-page__title">Edit Property</h1>
          <p className="owner-page__sub">{property?.title}</p>
        </div>
      </div>
      <div className="container owner-page__body">
        <PropertyForm
          mode="edit"
          initialData={property}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/owner/properties')}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default EditPropertyPage;
