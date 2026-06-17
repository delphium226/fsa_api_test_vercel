import { useState, useEffect, useCallback, Component } from 'react';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import ApiCallLog from './components/ApiCallLog';

const PAGE_SIZE = 20;

// Error Boundary to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fee', border: '2px solid red', margin: '1rem' }}>
          <h2>Something went wrong!</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
            {this.state.error?.toString()}
          </pre>
          <details>
            <summary>Stack trace</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState({ country: 'GB-SCT' });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [apiCallLog, setApiCallLog] = useState([]);

  const fetchAlerts = useCallback(async (filters, loadMore = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add filters
      if (filters.country) {
        params.append('country', `http://data.food.gov.uk/codes/geographies/countries/${filters.country}`);
      }
      if (filters.type) {
        params.append('type', `http://data.food.gov.uk/food-alerts/def/${filters.type}`);
      }
      if (filters.hazardCategory) {
        params.append('hazardCategory', filters.hazardCategory);
      }
      if (filters.allergen) {
        params.append('allergen', filters.allergen);
      }
      if (filters.since) {
        params.append('since', filters.since);
      }

      // Pagination
      const currentOffset = loadMore ? offset : 0;
      params.append('_limit', PAGE_SIZE.toString());
      params.append('_offset', currentOffset.toString());
      params.append('_sort', '-created');

      const apiUrl = `/api/alerts?${params.toString()}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();

      // Log the API call
      setApiCallLog(prev => [...prev, {
        id: prev.length + 1,
        timestamp: new Date().toISOString(),
        endpoint: apiUrl,
        params: Object.fromEntries(params.entries()),
        response: {
          status: response.status,
          itemCount: data.items?.length || 0,
          totalResults: data.totalResults || data.items?.length || 0
        }
      }]);

      // Parse the response - FSA API returns items in 'items' array
      const newAlerts = data.items || [];
      const total = data.totalResults || data.itemsPerPage || newAlerts.length;

      if (loadMore) {
        setAlerts(prev => [...prev, ...newAlerts]);
      } else {
        setAlerts(newAlerts);
      }

      setTotalCount(total);
      setOffset(currentOffset + newAlerts.length);
      setHasMore(newAlerts.length === PAGE_SIZE && (currentOffset + newAlerts.length) < total);

    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  const handleSearch = (filters) => {
    setCurrentFilters(filters);
    setOffset(0);
    setAlerts([]);
    fetchAlerts(filters, false);
  };

  const handleLoadMore = () => {
    fetchAlerts(currentFilters, true);
  };

  // Initial load with Scotland filter
  useEffect(() => {
    fetchAlerts({ country: 'GB-SCT' }, false);
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="header">
          <h1 className="header__title">Food Safety Alerts</h1>
          <p className="header__subtitle">
            Search and browse food alerts from Food Standards Scotland
          </p>
          <div className="header__badge">
            Powered by FSA Open Data API
          </div>
        </header>

        <main>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          <div className="split-view">
            <div className="split-view__left">
              <ResultsDisplay
                alerts={alerts}
                isLoading={isLoading}
                error={error}
                totalCount={totalCount}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </div>
            <div className="split-view__right">
              <ApiCallLog calls={apiCallLog} />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
