import PropertyCard from './PropertyCard';
import { PropertyCardSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import './PropertyGrid.css';

/**
 * PropertyGrid
 * Renders a responsive grid of PropertyCards, skeleton states, and empty state.
 */
const PropertyGrid = ({ properties = [], loading = false, skeletonCount = 9, onResetFilters }) => {
  if (loading) {
    return (
      <div className="property-grid" aria-busy="true" aria-label="Loading properties">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return (
      <EmptyState
        title="No properties found"
        description="Try adjusting your search or filters to see more results."
        action={onResetFilters ? { label: 'Clear all filters', onClick: onResetFilters } : undefined}
      />
    );
  }

  return (
    <div className="property-grid" role="list">
      {properties.map((property) => (
        <div key={property.id} role="listitem">
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;
