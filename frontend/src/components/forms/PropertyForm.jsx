import { useState, useEffect } from 'react';
import Input    from '../common/Input';
import Select   from '../common/Select';
import Button   from '../common/Button';
import Loader   from '../common/Loader';
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
const PropertyForm = ({ mode = 'create', initialData = null, onSubmit, onCancel, submitting = false }) => {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [amenityList, setAmenityList] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [serverErrors, setServerErrors] = useState([]);

  /* Load amenity options */
  useEffect(() => {
    fetchAmenities()
      .then((res) => setAmenityList(res.data?.amenities || []))
      .catch(() => setAmenityList([]))
      .finally(() => setLoadingAmenities(false));
  }, []);

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
    else if (form.title.length < 5) e.title        = 'Title must be at least 5 characters.';
    if (!form.property_type)       e.property_type  = 'Property type is required.';
    if (!form.rent)                e.rent           = 'Rent is required.';
    else if (isNaN(form.rent) || +form.rent <= 0)  e.rent = 'Rent must be a positive number.';
    if (form.security_deposit && +form.security_deposit < 0)
      e.security_deposit = 'Security deposit cannot be negative.';
    if (!form.address.trim())      e.address        = 'Address is required.';
    if (!form.city.trim())         e.city           = 'City is required.';
    if (!form.state.trim())        e.state          = 'State is required.';
    if (!form.pincode.trim())      e.pincode        = 'Pincode is required.';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Pincode must be 6 digits.';
    if (form.latitude  && isNaN(form.latitude))  e.latitude  = 'Invalid latitude.';
    if (form.longitude && isNaN(form.longitude)) e.longitude = 'Invalid longitude.';
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

    const result = await onSubmit(payload);
    if (result?.errors) setServerErrors(result.errors);
  };

  const fieldErr = (name) =>
    serverErrors.find((e) => e.field === name)?.message || errors[name] || '';

  return (
    <form className="property-form" onSubmit={handleSubmit} noValidate>

      {/* ── Basic Information ──────────────────────────── */}
      <section className="pf-section">
        <h2 className="pf-section__title">Basic Information</h2>
        <div className="pf-section__body">
          <Input
            label="Property title"
            placeholder="e.g. Spacious 2BHK in Bandra West"
            value={form.title}
            onChange={set('title')}
            error={fieldErr('title')}
            required
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
              disabled={submitting}
            />
            {fieldErr('description') && (
              <span className="pf-field-error">{fieldErr('description')}</span>
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
      <section className="pf-section">
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
            hint="Leave blank if not applicable."
            disabled={submitting}
          />
        </div>
      </section>

      {/* ── Details ───────────────────────────────────── */}
      <section className="pf-section">
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
            disabled={submitting}
          />
        </div>
      </section>

      {/* ── Location ──────────────────────────────────── */}
      <section className="pf-section">
        <h2 className="pf-section__title">Location</h2>
        <div className="pf-section__body">
          <Input
            label="Full address"
            placeholder="Flat 4B, Green Heights, MG Road"
            value={form.address}
            onChange={set('address')}
            error={fieldErr('address')}
            required
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
              disabled={submitting}
            />
            <Input
              label="State"
              placeholder="Maharashtra"
              value={form.state}
              onChange={set('state')}
              error={fieldErr('state')}
              required
              disabled={submitting}
            />
            <Input
              label="Pincode"
              placeholder="400001"
              value={form.pincode}
              onChange={set('pincode')}
              error={fieldErr('pincode')}
              required
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
              disabled={submitting}
            />
          </div>
        </div>
      </section>

      {/* ── Amenities ─────────────────────────────────── */}
      <section className="pf-section">
        <h2 className="pf-section__title">Amenities</h2>
        <div className="pf-section__body">
          {loadingAmenities ? (
            <div className="pf-amenities-loader">
              <Loader size="sm" /> <span className="text-muted text-sm">Loading amenities...</span>
            </div>
          ) : amenityList.length === 0 ? (
            <p className="text-muted text-sm">No amenities available.</p>
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

      {/* ── Availability (edit only) ───────────────────── */}
      {mode === 'edit' && (
        <section className="pf-section">
          <h2 className="pf-section__title">Availability</h2>
          <div className="pf-section__body">
            <Select
              label="Status"
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
