# FSA Food Alerts API - Interface Specification

This document provides detailed technical information about the Food Standards Agency (FSA) Food Alerts API and how this test harness interfaces with it.

## Table of Contents

1. [API Overview](#api-overview)
2. [Base URLs](#base-urls)
3. [Authentication](#authentication)
4. [Endpoints](#endpoints)
5. [Query Parameters](#query-parameters)
6. [Response Structure](#response-structure)
7. [Data Types and Codes](#data-types-and-codes)
8. [Proxy Server Implementation](#proxy-server-implementation)
9. [Error Handling](#error-handling)
10. [Examples](#examples)

---

## API Overview

The FSA Food Alerts API is a RESTful API that provides access to food safety alerts issued by Food Standards Agency (FSA) and Food Standards Scotland (FSS). The API follows Linked Data principles and returns data in JSON-LD format.

**API Documentation**: https://data.food.gov.uk/food-alerts/ui/reference

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production API | `https://data.food.gov.uk/food-alerts/` |
| Alert Data | `https://data.food.gov.uk/food-alerts/id` |
| Reference Data | `https://data.food.gov.uk/food-alerts/def/` |

---

## Authentication

The FSA Food Alerts API is **publicly accessible** and does not require authentication. No API keys or tokens are needed.

**CORS Note**: The API does not support CORS (Cross-Origin Resource Sharing) for browser requests. This test harness uses a proxy server to work around this limitation.

---

## Endpoints

### 1. Food Alerts Endpoint

**URL**: `GET https://data.food.gov.uk/food-alerts/id`

Returns a paginated list of food alerts matching the specified criteria.

### 2. Individual Alert Endpoint

**URL**: `GET https://data.food.gov.uk/food-alerts/id/{alert-id}`

Returns details for a specific alert by its ID.

### 3. Reference Data Endpoints

| Endpoint | Description |
|----------|-------------|
| `/def/allergens` | List of recognized allergens |
| `/def/hazard-categories` | List of hazard categories |
| `/def/alert-type` | List of alert types |
| `/def/countries` | List of country codes |

---

## Query Parameters

### Filtering Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `country` | URI | Filter by country/region | `http://data.food.gov.uk/codes/geographies/countries/GB-SCT` |
| `type` | URI | Filter by alert type | `http://data.food.gov.uk/food-alerts/def/AA` |
| `problem.hazardCategory` | String | Filter by hazard category | `Microbiological` |
| `problem.allergen` | URI | Filter by specific allergen | `http://data.food.gov.uk/food-alerts/def/allergens/Milk` |
| `since` | Date | Alerts created since date | `2024-01-01` (YYYY-MM-DD format) |

**Important**: Some parameters require the full URI format, while others accept simple string values. The `problem.` prefix is required for nested properties.

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `_limit` | Integer | 10 | Maximum number of results per page (max 500) |
| `_offset` | Integer | 0 | Number of results to skip |

### Sorting Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `_sort` | String | Field to sort by. Prefix with `-` for descending order |

**Common sort values**:
- `-created` - Most recent first (recommended)
- `created` - Oldest first
- `-modified` - Recently modified first

---

## Response Structure

### List Response

```json
{
  "@context": "http://data.food.gov.uk/food-alerts/def/context",
  "meta": {
    "publisher": "Food Standards Agency",
    "license": "http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    "version": "2.0"
  },
  "items": [...],
  "itemsPerPage": 20,
  "startIndex": 0,
  "totalResults": 150
}
```

### Alert Object Structure

```json
{
  "@id": "http://data.food.gov.uk/food-alerts/id/FSA-AA-123-2024",
  "title": "Alert title text",
  "created": "2024-01-15T10:30:00Z",
  "modified": "2024-01-15T12:00:00Z",
  "notation": "FSA-AA-123-2024",
  "type": [
    "http://data.food.gov.uk/food-alerts/def/AA"
  ],
  "country": [
    {
      "@id": "http://data.food.gov.uk/codes/geographies/countries/GB-SCT",
      "label": "Scotland"
    }
  ],
  "status": {
    "@id": "http://data.food.gov.uk/food-alerts/def/status/Published",
    "label": "Published"
  },
  "alertURL": "https://www.food.gov.uk/news-alerts/alert/fsa-aa-123-2024",
  "shortTitle": "Short alert title",
  "description": "Full description of the alert",
  "problem": {
    "allergen": [...],
    "hazardCategory": "Allergens",
    "riskStatement": "Risk description"
  },
  "productDetails": [
    {
      "productName": "Product Name",
      "packSizeDescription": "400g",
      "batchDescription": "All batches",
      "productCode": "12345",
      "productCategory": "Category"
    }
  ],
  "actionTaken": {
    "label": "The product is being recalled"
  },
  "consumerAdvice": "Advice for consumers",
  "SMSText": "SMS notification text",
  "twitterText": "Twitter notification text"
}
```

### Key Alert Fields

| Field | Type | Description |
|-------|------|-------------|
| `@id` | URI | Unique API identifier for the alert |
| `alertURL` | URL | Human-readable alert page on FSA website |
| `title` | String | Full title of the alert |
| `shortTitle` | String | Abbreviated title |
| `created` | DateTime | ISO 8601 creation timestamp |
| `modified` | DateTime | ISO 8601 last modification timestamp |
| `notation` | String | Alert reference number (e.g., FSA-AA-123-2024) |
| `type` | Array[URI] | Alert type(s) - see Alert Types below |
| `country` | Array[Object] | Countries where alert applies |
| `status` | Object | Publication status |
| `problem` | Object | Details about the food safety issue |
| `productDetails` | Array[Object] | Affected products |
| `actionTaken` | Object | Actions taken by business/authority |
| `consumerAdvice` | String | Advice for consumers |

### Problem Object Structure

```json
{
  "allergen": [
    {
      "@id": "http://data.food.gov.uk/food-alerts/def/allergens/Milk",
      "label": "Milk",
      "notation": "Milk",
      "rpiNotation": "AC7"
    }
  ],
  "hazardCategory": "Allergens",
  "riskStatement": "This product contains milk which is not mentioned on the label."
}
```

### Product Details Object Structure

```json
{
  "productName": "Example Product",
  "productCode": "5012345678901",
  "batchDescription": "Best before: 31 Dec 2024",
  "packSizeDescription": "500g pack",
  "productCategory": "Ready meals"
}
```

---

## Data Types and Codes

### Alert Types

| Code | URI Suffix | Label | Description |
|------|------------|-------|-------------|
| AA | `/def/AA` | Allergy Alert | Alerts for undeclared allergens |
| PRIN | `/def/PRIN` | Product Recall Information Notice | Product recalls for safety reasons |
| FAFA | `/def/FAFA` | Food Alert for Action | Alerts requiring action by local authorities |

**Full URI format**: `http://data.food.gov.uk/food-alerts/def/{CODE}`

### Country Codes

| Code | Label | Description |
|------|-------|-------------|
| GB-SCT | Scotland | Food Standards Scotland jurisdiction |
| GB-ENG | England | FSA England jurisdiction |
| GB-WLS | Wales | FSA Wales jurisdiction |
| GB-NIR | Northern Ireland | FSA Northern Ireland jurisdiction |

**Full URI format**: `http://data.food.gov.uk/codes/geographies/countries/{CODE}`

### Hazard Categories

| Value | Description |
|-------|-------------|
| Microbiological | Bacterial contamination (Salmonella, E. coli, Listeria, etc.) |
| Chemical | Chemical contamination or residues |
| ForeignBody | Physical contamination (glass, metal, plastic, etc.) |
| Allergens | Undeclared allergens or incorrect allergen labelling |
| Labelling | Incorrect or missing label information |
| Other | Other food safety issues |

### Common Allergens

The API recognizes the 14 major allergens required by UK/EU food law:

| Notation | Label |
|----------|-------|
| Celery | Celery |
| Cereals | Cereals containing gluten |
| Crustaceans | Crustaceans |
| Eggs | Eggs |
| Fish | Fish |
| Lupin | Lupin |
| Milk | Milk |
| Molluscs | Molluscs |
| Mustard | Mustard |
| Nuts | Tree nuts |
| Peanuts | Peanuts |
| Sesame | Sesame |
| Soybeans | Soya |
| SulphurDioxide | Sulphur dioxide and sulphites |

**Full URI format**: `http://data.food.gov.uk/food-alerts/def/allergens/{Notation}`

---

## Proxy Server Implementation

This test harness uses an Express.js proxy server to handle CORS restrictions.

### Proxy Endpoints

| Local Endpoint | Proxies To |
|----------------|------------|
| `GET /api/alerts` | `https://data.food.gov.uk/food-alerts/id` |
| `GET /api/ref/:type` | `https://data.food.gov.uk/food-alerts/def/:type` |
| `GET /api/health` | Health check (local) |

### Parameter Mapping

The proxy server maps some parameters to their correct FSA API equivalents:

| Client Parameter | FSA API Parameter |
|------------------|-------------------|
| `hazardCategory` | `problem.hazardCategory` |
| `allergen` | `problem.allergen` |

This allows the frontend to use simpler parameter names while the proxy handles the translation.

### Server Configuration

```javascript
// Default configuration
const PORT = process.env.PORT || 3001;
const FSA_API_BASE = 'https://data.food.gov.uk/food-alerts';
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid parameters, unrecognized query params |
| 404 | Not Found | Invalid endpoint or alert ID |
| 500 | Server Error | FSA API internal error |
| 503 | Service Unavailable | FSA API temporarily unavailable |

### Common Error Scenarios

1. **Unrecognized Parameters**: The FSA API strictly validates query parameters. Using incorrect parameter names (e.g., `hazardCategory` instead of `problem.hazardCategory`) returns a 400 error.

2. **Invalid URI Format**: Country and type filters require full URI format. Using just the code (e.g., `GB-SCT`) without the full URI will not filter correctly.

3. **Rate Limiting**: While not explicitly documented, heavy usage may be throttled. Implement appropriate delays between requests.

---

## Examples

### Example 1: Fetch Scottish Allergy Alerts

**Request**:
```
GET /api/alerts?country=http://data.food.gov.uk/codes/geographies/countries/GB-SCT&type=http://data.food.gov.uk/food-alerts/def/AA&_limit=20&_sort=-created
```

**Response** (truncated):
```json
{
  "items": [
    {
      "@id": "http://data.food.gov.uk/food-alerts/id/FSA-AA-01-2024",
      "title": "Product X recalled due to undeclared milk",
      "alertURL": "https://www.food.gov.uk/news-alerts/alert/fsa-aa-01-2024",
      "type": ["http://data.food.gov.uk/food-alerts/def/AA"],
      "country": [{"@id": "...", "label": "Scotland"}],
      "created": "2024-01-15T10:00:00Z",
      "problem": {
        "allergen": [{"label": "Milk", "notation": "Milk"}],
        "hazardCategory": "Allergens"
      }
    }
  ],
  "totalResults": 45,
  "itemsPerPage": 20
}
```

### Example 2: Fetch Alerts Since a Date

**Request**:
```
GET /api/alerts?since=2024-01-01&_limit=50&_sort=-created
```

### Example 3: Fetch Microbiological Hazards

**Request**:
```
GET /api/alerts?problem.hazardCategory=Microbiological&_limit=20&_sort=-created
```

### Example 4: Fetch Allergen Reference Data

**Request**:
```
GET /api/ref/allergens
```

**Response**:
```json
{
  "items": [
    {
      "@id": "http://data.food.gov.uk/food-alerts/def/allergens/Milk",
      "notation": "Milk",
      "label": "Milk",
      "prefLabel": {"@value": "Milk", "@language": "en"},
      "rpiNotation": "AC7"
    }
  ]
}
```

---

## Rate Limits and Best Practices

1. **Pagination**: Always use pagination for large result sets. The default limit is 10; maximum is 500.

2. **Caching**: Alert data doesn't change frequently. Consider caching responses for a reasonable period (e.g., 5-15 minutes).

3. **Error Retry**: Implement exponential backoff for transient errors (500, 503).

4. **Date Filtering**: Use the `since` parameter to limit results to recent alerts when full history isn't needed.

5. **Specific Queries**: Use filters to request only the data you need rather than fetching all alerts.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-02-04 | Initial specification |

---

## Additional Resources

- **FSA Open Data Portal**: https://data.food.gov.uk/
- **FSA Food Alerts Page**: https://www.food.gov.uk/news-alerts/search/alerts
- **Food Standards Scotland**: https://www.foodstandards.gov.scot/
- **API Terms of Use**: https://data.food.gov.uk/terms
