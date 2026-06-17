import { useState, useEffect } from 'react';

const COUNTRIES = [
  { value: '', label: 'All Countries' },
  { value: 'GB-SCT', label: 'Scotland' },
  { value: 'GB-ENG', label: 'England' },
  { value: 'GB-WLS', label: 'Wales' },
  { value: 'GB-NIR', label: 'Northern Ireland' }
];

const ALERT_TYPES = [
  { value: '', label: 'All Alert Types' },
  { value: 'AA', label: 'Allergy Alert' },
  { value: 'PRIN', label: 'Product Recall' },
  { value: 'FAFA', label: 'Food Alert for Action' }
];

const HAZARD_CATEGORIES = [
  { value: '', label: 'All Hazard Categories' },
  { value: 'Microbiological', label: 'Microbiological' },
  { value: 'Chemical', label: 'Chemical' },
  { value: 'ForeignBody', label: 'Foreign Body' },
  { value: 'Allergens', label: 'Allergens' },
  { value: 'Labelling', label: 'Labelling' },
  { value: 'Other', label: 'Other' }
];

const TIME_PERIODS = [
  { value: '', label: 'All Time' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '180', label: 'Last 6 Months' },
  { value: '365', label: 'Last Year' }
];

export default function SearchForm({ onSearch, isLoading }) {
  const [country, setCountry] = useState('GB-SCT');
  const [alertType, setAlertType] = useState('');
  const [hazardCategory, setHazardCategory] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [allergens, setAllergens] = useState([]);
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [showAllergenFilter, setShowAllergenFilter] = useState(false);

  // Fetch allergens reference data
  useEffect(() => {
    async function fetchAllergens() {
      try {
        const response = await fetch('/api/ref/allergens');
        if (response.ok) {
          const data = await response.json();
          // Parse the allergens from the API response
          if (data.items) {
            const allergenList = data.items.map(item => ({
              value: item.notation || item['@id'],
              label: item.label || item.prefLabel?.['@value'] || item.notation
            }));
            setAllergens(allergenList);
          }
        }
      } catch (error) {
        console.error('Failed to fetch allergens:', error);
      }
    }
    fetchAllergens();
  }, []);

  // Show allergen dropdown when Allergy Alert is selected
  useEffect(() => {
    setShowAllergenFilter(alertType === 'AA');
    if (alertType !== 'AA') {
      setSelectedAllergen('');
    }
  }, [alertType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {};

    if (country) {
      filters.country = country;
    }
    if (alertType) {
      filters.type = alertType;
    }
    if (hazardCategory) {
      filters.hazardCategory = hazardCategory;
    }
    if (selectedAllergen && showAllergenFilter) {
      filters.allergen = selectedAllergen;
    }
    if (timePeriod) {
      // Calculate the date X days ago
      const daysAgo = parseInt(timePeriod, 10);
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - daysAgo);
      filters.since = sinceDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }

    onSearch(filters);
  };

  const handleReset = () => {
    setCountry('GB-SCT');
    setAlertType('');
    setHazardCategory('');
    setTimePeriod('');
    setSelectedAllergen('');
    onSearch({ country: 'GB-SCT' });
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h2 className="search-form__title">Search Food Alerts</h2>

      <div className="search-form__grid">
        <div className="form-group">
          <label className="form-group__label" htmlFor="country">
            Country / Region
          </label>
          <select
            id="country"
            className="form-group__select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-group__label" htmlFor="alertType">
            Alert Type
          </label>
          <select
            id="alertType"
            className="form-group__select"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
          >
            {ALERT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-group__label" htmlFor="hazardCategory">
            Hazard Category
          </label>
          <select
            id="hazardCategory"
            className="form-group__select"
            value={hazardCategory}
            onChange={(e) => setHazardCategory(e.target.value)}
          >
            {HAZARD_CATEGORIES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-group__label" htmlFor="timePeriod">
            Time Period
          </label>
          <select
            id="timePeriod"
            className="form-group__select"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            {TIME_PERIODS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {showAllergenFilter && allergens.length > 0 && (
          <div className="form-group">
            <label className="form-group__label" htmlFor="allergen">
              Specific Allergen
            </label>
            <select
              id="allergen"
              className="form-group__select"
              value={selectedAllergen}
              onChange={(e) => setSelectedAllergen(e.target.value)}
            >
              <option value="">All Allergens</option>
              {allergens.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="search-form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading__spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Searching...
            </>
          ) : (
            'Search Alerts'
          )}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset Filters
        </button>
      </div>
    </form>
  );
}
