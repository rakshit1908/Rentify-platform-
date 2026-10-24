import { useState, useEffect, useCallback } from 'react';
import Input    from '../common/Input';
import Select   from '../common/Select';
import Button   from '../common/Button';
import Loader   from '../common/Loader';
import PropertyPhotoPicker from './PropertyPhotoPicker';
import { fetchAmenities } from '../../services/property.service';
import './PropertyForm.css';

const PROPERTY_TYPES = [
  { value: 'apartment',  label: 'Apartment' },
  { value: 'house',      label: 'House' },
  { value: 'villa',      label: 'Villa' },
  { value: 'studio',     label: 'Studio' },
  { value: 'pg',         label: 'PG / Hostel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plot',       label: 'Plot / Land' },
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'rented',    label: 'Rented' },
];

const EMPTY_FORM = {
  title: '', description: '', property_type: '',
  rent: '', security_deposit: '',
  bedrooms: '', bathrooms: '', area: '',
  address: '', city: '', state: '', pincode: '',
  latitude: '', longitude: '',
  status: 'available',
  amenities: [],
};

/**
 * PropertyForm
 * mode: 'create' | 'edit'
 * initialData: property object for edit mode
 * onSubmit(formData): called with validated form data
 * onCancel(): called when user cancels
 */
const PropertyForm = ({
  mode = 'create',
  initialData = null,
  onSubmit,
  onCancel,
  onFormChange,
  submitting = false,
}) => {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [amenityList, setAmenityList] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [amenitiesError, setAmenitiesError] = useState('');
  const [serverErrors, setServerErrors] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const loadAmenities = useCallback(async () => {
    setLoadingAmenities(true);
    setAmenitiesError('');
    try {
      const res = await fetchAmenities();
      setAmenityList(res.data?.amenities || []);
    } catch (error) {
      console.error('[PropertyForm] Failed to load amenities:', error);
      setAmenitiesError(error.message || 'Could not load amenities.');
    } finally {
      setLoadingAmenities(false);
    }
  }, []);

  useEffect(() => {
    loadAmenities();
  }, [loadAmenities]);

  /* Populate form in edit mode */
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        title:            initialData.title            || '',
        description:      initialData.description      || '',
        property_type:    initialData.property_type    || '',
        rent:             initialData.rent?.toString() || '',
        security_deposit: initialData.security_deposit?.toString() || '',
        bedrooms:         initialData.bedrooms?.toString() || '',
        bathrooms:        initialData.bathrooms?.toString() || '',
        area:             initialData.area?.toString() || '',
        address:          initialData.address          || '',
        city:             initialData.city             || '',
        state:            initialData.state            || '',
        pincode:          initialData.pincode          || '',
        latitude:         initialData.latitude?.toString() || '',
        longitude:        initialData.longitude?.toString() || '',
        status:           initialData.status           || 'available',
        amenities:        (initialData.amenities || []).map((a) => a.id),
      });
    }
  }, [mode, initialData]);

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((e2) => ({ ...e2, [field]: '' }));
    setServerErrors([]);
  };

  const toggleAmenity = (id) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter((a) => a !== id)
        : [...f.amenities, id],
    }));
  };

  /* ── Validation ─────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title         = 'Title is required.';
    else if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters.';
    else if (form.title.trim().length > 200) e.title = 'Title cannot exceed 200 characters.';
    if (form.description.length > 2000) e.description = 'Description cannot exceed 2,000 characters.';
    if (!form.property_type)       e.property_type  = 'Property type is required.';
    if (!form.rent) e.rent = 'Monthly rent is required.';
    else if (!Number.isFinite(Number(form.rent)) || Number(form.rent) < 1) e.rent = 'Rent must be at least ₹1.';
    if (form.security_deposit && (!Number.isFinite(Number(form.security_deposit)) || Number(form.security_deposit) < 0))
      e.security_deposit = 'Enter a valid deposit amount of ₹0 or more.';
    if (form.bedrooms && (!Number.isInteger(Number(form.bedrooms)) || Number(form.bedrooms) < 0 || Number(form.bedrooms) > 20))
      e.bedrooms = 'Bedrooms must be a whole number between 0 and 20.';
    if (form.bathrooms && (!Number.isInteger(Number(form.bathrooms)) || Number(form.bathrooms) < 0 || Number(form.bathrooms) > 20))
      e.bathrooms = 'Bathrooms must be a whole number between 0 and 20.';
    if (form.area && (!Number.isFinite(Number(form.area)) || Number(form.area) <= 0))
      e.area = 'Area must be greater than 0 sq ft.';
    if (!form.address.trim())      e.address        = 'Address is required.';
    else if (form.address.trim().length > 500) e.address = 'Address cannot exceed 500 characters.';
    if (!form.city.trim())         e.city           = 'City is required.';
    else if (form.city.trim().length > 100) e.city = 'City cannot exceed 100 characters.';
    if (!form.state.trim())        e.state          = 'State is required.';
    else if (form.state.trim().length > 100) e.state = 'State cannot exceed 100 characters.';
    if (!form.pincode.trim())      e.pincode        = 'Pincode is required.';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Pincode must be 6 digits.';
    if (form.latitude && (!Number.isFinite(Number(form.latitude)) || Number(form.latitude) < -90 || Number(form.latitude) > 90))
      e.latitude = 'Latitude must be between -90 and 90.';
    if (form.longitude && (!Number.isFinite(Number(form.longitude)) || Number(form.longitude) < -180 || Number(form.longitude) > 180))
      e.longitude = 'Longitude must be between -180 and 180.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      title:            form.title.trim(),
      description:      form.description.trim() || null,
      property_type:    form.property_type,
      rent:             parseFloat(form.rent),
      security_deposit: parseFloat(form.security_deposit || 0),
      bedrooms:         form.bedrooms  ? parseInt(form.bedrooms)  : null,
      bathrooms:        form.bathrooms ? parseInt(form.bathrooms) : null,
      area:             form.area      ? parseFloat(form.area)    : null,
      address:          form.address.trim(),
      city:             form.city.trim(),
      state:            form.state.trim(),
      pincode:          form.pincode.trim(),
      latitude:         form.latitude  ? parseFloat(form.latitude)  : null,
      longitude:        form.longitude ? parseFloat(form.longitude) : null,
      status:           form.status,
      amenities:        form.amenities,
    };

    const result = await onSubmit(payload, selectedPhotos);
    if (result?.errors) setServerErrors(result.errors);
  };

  const fieldErr = (name) =>
    serverErrors.find((e) => e.field === name)?.message || errors[name] || '';
  return (
    <form className="property-form" onSubmit={handleSubmit} noValidate>

      {/* ── Basic Information ──────────────────────────── */}
      <section className="pf-section" id="pf-basic">
        <h2 className="pf-section__title">Basic Information</h2>
        <div className="pf-section__body">
          <Input
            label="Property title"
            placeholder="e.g. Spacious 2BHK in Bandra West"
            value={form.title}
            onChange={set('title')}
            error={fieldErr('title')}
            required
            maxLength={200}
            hint="Use 5–200 characters. Include the home type and neighbourhood."
            disabled={submitting}
          />
          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-description">
              Description <span className="pf-optional">(optional)</span>
            </label>
            <textarea
              id="pf-description"
              className={`pf-textarea ${fieldErr('description') ? 'pf-textarea--error' : ''}`}
              placeholder="Describe the property, surroundings, nearby landmarks..."
              value={form.description}
              onChange={set('description')}
              rows={4}
              maxLength={2000}
              disabled={submitting}
            />
            {fieldErr('description') && (
              <span className="pf-field-error">{fieldErr('description')}</span>
            )}
            {!fieldErr('description') && (
              <span className="pf-field-hint">{form.description.length}/2,000 characters</span>
            )}
          </div>
          <Select
            label="Property type"
            options={PROPERTY_TYPES}
            placeholder="Select type"
            value={form.property_type}
            onChange={set('property_type')}
            error={fieldErr('property_type')}
            required
            disabled={submitting}
          />
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <section className="pf-section" id="pf-pricing">
        <h2 className="pf-section__title">Pricing</h2>
        <div className="pf-section__body pf-section__body--2col">
          <Input
            label="Monthly rent (₹)"
            type="number"
            placeholder="25000"
            value={form.rent}
            onChange={set('rent')}
            error={fieldErr('rent')}
            required
            min={1}
            step={1}
            inputMode="numeric"
            hint="Enter the monthly rent in Indian rupees."
            disabled={submitting}
          />
          <Input
            label="Security deposit (₹)"
            type="number"
            placeholder="50000"
            value={form.security_deposit}
            onChange={set('security_deposit')}
            error={fieldErr('security_deposit')}
            min={0}
            step={1}
            inputMode="numeric"
            hint="Leave blank if not applicable."
            disabled={submitting}
          />
        </div>
      </section>

      {/* ── Details ───────────────────────────────────── */}
      <section className="pf-section" id="pf-details">
        <h2 className="pf-section__title">Property Details</h2>
        <div className="pf-section__body pf-section__body--3col">
          <Input
            label="Bedrooms"
            type="number"
            placeholder="2"
            value={form.bedrooms}
            onChange={set('bedrooms')}
            error={fieldErr('bedrooms')}
            min={0}
            max={20}
            step={1}
            inputMode="numeric"
            disabled={submitting}
          />
          <Input
            label="Bathrooms"
            type="number"
            placeholder="1"
            value={form.bathrooms}
            onChange={set('bathrooms')}
            error={fieldErr('bathrooms')}
            min={0}
            max={20}
            step={1}
            inputMode="numeric"
            disabled={submitting}
          />
          <Input
            label="Area (sq ft)"
            type="number"
            placeholder="850"
            value={form.area}
            onChange={set('area')}
            error={fieldErr('area')}
            min={1}
            step={1}
            inputMode="numeric"
            disabled={submitting}
          />
        </div>
      </section>

      {/* ── Location ──────────────────────────────────── */}
      <section className="pf-section" id="pf-location">
        <h2 className="pf-section__title">Location</h2>
        <div className="pf-section__body">
          <Input
            label="Full address"
            placeholder="Flat 4B, Green Heights, MG Road"
            value={form.address}
            onChange={set('address')}
            error={fieldErr('address')}
            required
            maxLength={500}
            disabled={submitting}
          />
          <div className="pf-section__body pf-section__body--3col pf-section__body--no-gap">
            <Input
              label="City"
              placeholder="Mumbai"
              value={form.city}
              onChange={set('city')}
              error={fieldErr('city')}
              required
              maxLength={100}
              disabled={submitting}
            />
            <Input
              label="State"
              placeholder="Maharashtra"
              value={form.state}
              onChange={set('state')}
              error={fieldErr('state')}
              required
              maxLength={100}
              disabled={submitting}
            />
            <Input
              label="Pincode"
              type="text"
              placeholder="400001"
              value={form.pincode}
              onChange={set('pincode')}
              error={fieldErr('pincode')}
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              hint="Enter a 6-digit Indian PIN code."
              disabled={submitting}
            />
          </div>
          <div className="pf-section__body pf-section__body--2col pf-section__body--no-gap">
            <Input
              label="Latitude (optional)"
              type="number"
              placeholder="19.0760"
              value={form.latitude}
              onChange={set('latitude')}
              error={fieldErr('latitude')}
              step="any"
              min={-90}
              max={90}
              hint="Decimal degrees, from -90 to 90."
              disabled={submitting}
            />
            <Input
              label="Longitude (optional)"
              type="number"
              placeholder="72.8777"
              value={form.longitude}
              onChange={set('longitude')}
              error={fieldErr('longitude')}
              step="any"
              min={-180}
              max={180}
              hint="Decimal degrees, from -180 to 180."
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      {/* ── Amenities ─────────────────────────────────── */}
      <section className="pf-section" id="pf-amenities">
        <h2 className="pf-section__title">Amenities</h2>
        <div className="pf-section__body">
          {loadingAmenities ? (
            <div className="pf-amenities-loader">
              <Loader size="sm" /> <span className="text-muted text-sm">Loading amenities...</span>
            </div>
          ) : amenitiesError ? (
            <div className="pf-amenities-error" role="status">
              <p>{amenitiesError} You can retry or continue without amenities.</p>
              <Button type="button" variant="outline" size="sm" onClick={loadAmenities}>
                Retry loading amenities
              </Button>
            </div>
          ) : amenityList.length === 0 ? (
            <p className="pf-field-hint">No amenities are available for selection.</p>
          ) : (
            <div className="pf-amenities">
              {amenityList.map((a) => {
                const checked = form.amenities.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={`pf-amenity ${checked ? 'pf-amenity--checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="pf-amenity__checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(a.id)}
                      disabled={submitting}
                    />
                    <span className="pf-amenity__label">{a.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {mode === 'create' && (
        <PropertyPhotoPicker
          onFilesChange={setSelectedPhotos}
          disabled={submitting}
        />
      )}

      {/* ── Availability (edit only) ───────────────────── */}
      {mode === 'edit' && (
        <section className="pf-section" id="pf-availability">
          <h2 className="pf-section__title">Availability</h2>
          <div className="pf-section__body">
            <Select
              label="Listing status"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={set('status')}
              error={fieldErr('status')}
              required
              disabled={submitting}
            />
          </div>
        </section>
      )}

      {/* ── Server errors ──────────────────────────────── */}
      {serverErrors.length > 0 && (
        <div className="pf-server-errors" role="alert">
          <p className="pf-server-errors__title">Please fix the following:</p>
          <ul className="pf-server-errors__list">
            {serverErrors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Actions ────────────────────────────────────── */}
      <div className="pf-actions">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={submitting}
        >
          {mode === 'create' ? 'Create property' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
