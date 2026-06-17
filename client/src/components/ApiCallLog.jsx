export default function ApiCallLog({ calls }) {
  if (!calls || calls.length === 0) {
    return (
      <div className="api-log">
        <h2 className="api-log__title">API Call Log</h2>
        <div className="api-log__empty">
          No API calls recorded yet. Make a search to see the log.
        </div>
      </div>
    );
  }

  return (
    <div className="api-log">
      <h2 className="api-log__title">API Call Log</h2>
      <div className="api-log__table-wrapper">
        <table className="api-log__table">
          <thead>
            <tr>
              <th>#</th>
              <th>API Call / Parameters</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {[...calls].reverse().map((call) => (
              <tr key={call.id}>
                <td className="api-log__num">{call.id}</td>
                <td className="api-log__call">
                  <div className="api-log__endpoint">
                    GET /api/alerts
                  </div>
                  <div className="api-log__params">
                    {Object.entries(call.params).map(([key, value]) => (
                      <div key={key} className="api-log__param">
                        <span className="api-log__param-key">{key}:</span>
                        <span className="api-log__param-value">{formatParamValue(value)}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="api-log__response">
                  <div className="api-log__response-status">
                    Status: <span className="api-log__status-code">{call.response.status}</span>
                  </div>
                  <div className="api-log__response-count">
                    Items: <strong>{call.response.itemCount}</strong>
                  </div>
                  <div className="api-log__response-total">
                    Total: <strong>{call.response.totalResults}</strong>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatParamValue(value) {
  // Shorten long URIs for display
  if (typeof value === 'string' && value.includes('data.food.gov.uk')) {
    const parts = value.split('/');
    return parts[parts.length - 1];
  }
  return value;
}
