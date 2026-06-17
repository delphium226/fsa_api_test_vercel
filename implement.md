# Implementation Plan - FSS API Test Harness

**Goal**: Build a user-friendly frontend to query the Food Standards Scotland (FSA) Primary Alerts API, featuring cascading filters and a "premium" UI design.

## User Review Required
> [!IMPORTANT]
> **Proxy Strategy**: We will use a lightweight Express.js server to proxy requests to `data.food.gov.uk`. This avoids CORS issues and allows us to potentially cache reference data (dictionaries) if needed.
>
> **Reference Data**: We rely on the FSA's "Reference" endpoints (e.g., `/food-alerts/def/hazards`) to populate dropdowns. If these change, the UI will need updates.

## Proposed Changes

### Project Structure
Directory: `FSAAPITest/`
- `client/`: Vite + React Frontend
- `server/`: Node.js Express Proxy

### Backend (Server)
#### [NEW] [server.js](file:///c:/Users/User/Documents/FSAAPITest/server/server.js)
- **Framework**: Express.js
- **Functionality**:
    - Proxy `/api/alerts` -> `https://data.food.gov.uk/food-alerts/id`
    - Proxy `/api/ref/*` -> `https://data.food.gov.uk/food-alerts/def/*`
    - Handle CORS headers.

### Frontend (Client)
#### [NEW] [App.jsx](file:///c:/Users/User/Documents/FSAAPITest/client/src/App.jsx)
- **Framework**: React (via Vite)
- **Styling**: Vanilla CSS (CSS Modules) or Tailwind (if requested, but sticking to "Rich Aesthetics" via CSS as per general rules). *Decision: Use robust custom CSS for "premium" look.*

#### [NEW] [SearchForm.jsx](file:///c:/Users/User/Documents/FSAAPITest/client/src/components/SearchForm.jsx)
- **Logic**:
    - Fetch reference lists on mount.
    - **Inputs**:
        - **Country**: Fixed to include 'Scotland' (GB-SCT) by default, or selectable.
        - **Alert Type**: Dropdown (Allergy, PRIN, FAFA).
        - **Hazard Category**: Dropdown (Micro, Chemical, Foreign Body).
    - **Relationships**:
        - Selecting 'Allergy' type should show 'Allergen' specific dropdown?
        - Selecting 'Micro' hazard might show specific pathogens? (Will investigate if API supports this granularity in filters).

#### [NEW] [ResultsDisplay.jsx](file:///c:/Users/User/Documents/FSAAPITest/client/src/components/ResultsDisplay.jsx)
- **Layout**: Grid of Cards.
- **Content**: Title, Date, Country tags, Problem Description (parsed from complex list).

## Verification Plan
### Automated Tests
- Run `npm run dev` and verifying the proxy connects.
- Check browser console for CORS errors (should be none).

### Manual Verification
- **Scenario 1**: User selects "Scotland" and "Allergy".
    - *Expected*: Only allergy alerts tagged GB-SCT appear.
- **Scenario 2**: Check functionality of the 'Load More' or Pagination (since API is paginated).
