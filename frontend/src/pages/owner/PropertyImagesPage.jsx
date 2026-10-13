import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPropertyById } from '../../services/property.service';
import ImageUploader from '../../components/property/ImageUploader';
import Loader    from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import Button    from '../../components/common/Button';
import './OwnerPages.css';

const PropertyImagesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty]   = useState(null);
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetchPropertyById(id)
      .then((res) => {
        const prop = res.data?.property;
        setProperty(prop);
        setImages(prop?.images || []);
      })
      .catch((err) => setError(err.message || 'Failed to load property.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage label="Loading..." />;
  if (error)   return (
    <div className="container section">
      <ErrorState type="page" title="Could not load property" description={error} />
    </div>
  );

  return (
    <div className="owner-page">
      <div className="owner-page__header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <h1 className="owner-page__title">Manage Images</h1>
              <p className="owner-page__sub">{property?.title}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/owner/properties')}>
              Back to listings
            </Button>
          </div>
        </div>
      </div>

      <div className="container owner-page__body">
        <div style={{ maxWidth: 720 }}>
          <ImageUploader
            propertyId={id}
            existingImages={images}
            onImagesChange={setImages}
          />

          <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Link to={`/properties/${id}`} className="btn btn--ghost btn--md">
              View public listing
            </Link>
            <Link to="/owner/properties" className="btn btn--primary btn--md">
              Done
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyImagesPage;
