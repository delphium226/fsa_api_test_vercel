function getAlertTypeClass(type) {
  if (!type) return 'alert-card__type--default';

  // Handle type being an array or object
  let typeValue = type;
  if (Array.isArray(type)) {
    typeValue = type[0];
  }
  if (typeof typeValue === 'object' && typeValue !== null) {
    typeValue = typeValue['@id'] || typeValue.label || typeValue.notation || '';
  }
  if (typeof typeValue !== 'string') {
    return 'alert-card__type--default';
  }

  const typeStr = typeValue.toLowerCase();
  if (typeStr.includes('allergy') || typeStr.includes('aa')) {
    return 'alert-card__type--allergy';
  }
  if (typeStr.includes('prin') || typeStr.includes('recall')) {
    return 'alert-card__type--prin';
  }
  if (typeStr.includes('fafa') || typeStr.includes('action')) {
    return 'alert-card__type--fafa';
  }
  return 'alert-card__type--default';
}

function getAlertTypeLabel(type) {
  if (!type) return 'Alert';

  // Handle type being an array or object
  let typeValue = type;
  if (Array.isArray(type)) {
    typeValue = type[0];
  }
  if (typeof typeValue === 'object' && typeValue !== null) {
    typeValue = typeValue['@id'] || typeValue.label || typeValue.notation || '';
  }

  // Handle both URI format and simple codes
  const typeStr = typeof typeValue === 'string' ? typeValue : '';

  if (typeStr.includes('AA') || typeStr.toLowerCase().includes('allergy')) {
    return 'Allergy Alert';
  }
  if (typeStr.includes('PRIN') || typeStr.toLowerCase().includes('recall')) {
    return 'Product Recall';
  }
  if (typeStr.includes('FAFA') || typeStr.toLowerCase().includes('action')) {
    return 'Food Alert';
  }

  // Try to extract label from URI
  const parts = typeStr.split('/');
  return parts[parts.length - 1] || 'Alert';
}

function formatDate(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function extractDescription(alert) {
  // Try to get problem description from various possible locations
  if (alert.problemStatement) {
    return alert.problemStatement;
  }
  if (alert.description) {
    return alert.description;
  }
  if (alert.problem) {
    if (typeof alert.problem === 'string') {
      return alert.problem;
    }
    if (alert.problem.description) {
      return alert.problem.description;
    }
  }
  if (alert.textDescription) {
    return alert.textDescription;
  }
  return 'No description available.';
}

function extractCountries(alert) {
  const countries = [];

  // Check for country field
  if (alert.country) {
    const countryData = Array.isArray(alert.country) ? alert.country : [alert.country];
    countryData.forEach(c => {
      if (typeof c === 'string') {
        // Extract country code from URI if needed
        const code = c.includes('/') ? c.split('/').pop() : c;
        countries.push(code);
      } else if (c.notation) {
        countries.push(c.notation);
      } else if (c.label) {
        countries.push(c.label);
      }
    });
  }

  // Check for notifyingCountry
  if (alert.notifyingCountry) {
    const nc = alert.notifyingCountry;
    if (typeof nc === 'string') {
      const code = nc.includes('/') ? nc.split('/').pop() : nc;
      if (!countries.includes(code)) countries.push(code);
    }
  }

  return countries;
}

function getCountryLabel(code) {
  const countryMap = {
    'GB-SCT': 'Scotland',
    'GB-ENG': 'England',
    'GB-WLS': 'Wales',
    'GB-NIR': 'N. Ireland',
    'SCT': 'Scotland',
    'ENG': 'England',
    'WLS': 'Wales',
    'NIR': 'N. Ireland'
  };
  return countryMap[code] || code;
}

function AlertCard({ alert }) {
  const type = alert.type || alert['@type'] || '';
  const title = alert.title || alert.label || 'Untitled Alert';
  const created = alert.created || alert.modified || alert.dateModified;
  const description = extractDescription(alert);
  const countries = extractCountries(alert);
  // Use alertURL (human-readable FSA page) if available, fallback to API endpoint
  const alertUrl = alert.alertURL || alert['@id'] || alert.id;

  return (
    <article className="alert-card">
      <header className="alert-card__header">
        <span className={`alert-card__type ${getAlertTypeClass(type)}`}>
          {getAlertTypeLabel(type)}
        </span>
        <h3 className="alert-card__title">{title}</h3>
      </header>

      <div className="alert-card__body">
        <div className="alert-card__meta">
          {created && (
            <span className="alert-card__date">
              {formatDate(created)}
            </span>
          )}
          {countries.map((country, idx) => (
            <span
              key={idx}
              className={`alert-card__tag ${country.includes('SCT') ? 'alert-card__tag--scotland' : ''}`}
            >
              {getCountryLabel(country)}
            </span>
          ))}
        </div>

        <p className="alert-card__description">{description}</p>

        {alertUrl && (
          <a
            href={alertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="alert-card__link"
          >
            View Full Alert
          </a>
        )}
      </div>
    </article>
  );
}

export default function ResultsDisplay({ alerts, isLoading, error, totalCount, onLoadMore, hasMore }) {
  if (error) {
    return (
      <div className="error">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (isLoading && alerts.length === 0) {
    return (
      <div className="loading">
        <div className="loading__spinner" />
        <p className="loading__text">Searching for food alerts...</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h3 className="empty-state__title">No Alerts Found</h3>
        <p className="empty-state__text">
          Try adjusting your search filters or search for all alerts.
        </p>
      </div>
    );
  }

  return (
    <section className="results">
      <header className="results__header">
        <h2 className="results__title">Food Alerts</h2>
        <span className="results__count">
          Showing {alerts.length} {totalCount ? `of ${totalCount}` : ''} results
        </span>
      </header>

      <div className="results__grid">
        {alerts.map((alert, index) => (
          <AlertCard key={alert['@id'] || alert.id || index} alert={alert} />
        ))}
      </div>

      {hasMore && (
        <div className="pagination">
          <button
            className="pagination__btn"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More Alerts'}
          </button>
        </div>
      )}
    </section>
  );
}
