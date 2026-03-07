# Design: Display Follow-ups in a Table

## Technical Approach
The display follow-ups in a table feature will allow users to view follow-ups in a tabular format. The system will provide a table view with search, filtering, and sorting options to display follow-ups based on their status (sent, not sent, paid, unpaid). The frontend will use Alpine.js for reactivity and state management, while the backend will handle data retrieval via Flask.

## Architecture Decisions

### Decision: Use Alpine.js for Frontend Reactivity
- **Description**: Alpine.js will manage the state and reactivity of the table display and filtering process.
- **Rationale**: Alpine.js is lightweight and integrates seamlessly with HTML, making it ideal for this use case.
- **Impact**: Simplifies frontend logic and improves user experience.

### Decision: Use Flask for Backend Processing
- **Description**: Flask will handle the retrieval of follow-ups from the `Relances` class.
- **Rationale**: Flask is lightweight and well-suited for handling HTTP requests and integrating with Parse.
- **Impact**: Ensures robust backend processing and easy integration with the database.

### Decision: Use Table View
- **Description**: The system will display follow-ups in a table view for easy navigation and management.
- **Rationale**: A table view provides a clear and structured way to view follow-ups.
- **Impact**: Improves user experience by providing a familiar and organized view of follow-ups.

### Decision: Provide Search, Filtering, and Sorting Options
- **Description**: The system will provide search, filtering, and sorting options to allow users to find and organize specific follow-ups.
- **Rationale**: These options enhance usability by allowing users to quickly locate and manage relevant follow-ups.
- **Impact**: Improves user experience by making it easier to find and manage follow-ups.

## Data Flow
```mermaid
graph TD
    A[User accesses follow-ups table page] --> B[System displays follow-ups in table]
    B --> C[User uses search bar to filter follow-ups]
    C --> D[User applies filters]
    D --> E[User sorts follow-ups]
    E --> F[System updates table view]
    F --> G[User clicks on a follow-up to view details]
```

## Data Mapping

### Parse Class: `Relances`
- **Fields**:
  - `date`: DateTime (date and time of the follow-up).
  - `statut`: String (status of the follow-up: sent, not sent, paid, unpaid).
  - `facture`: Pointer (pointer to the associated invoice in the `Impayes` class).
  - `message`: String (message content of the follow-up).

### Alpine.js Store: `followUpTable`
- **Fields**:
  - `followUps`: Array (list of follow-ups to display).
  - `filteredFollowUps`: Array (list of filtered follow-ups based on search and filter criteria).
  - `searchQuery`: String (search query for filtering follow-ups).
  - `filters`: Object (selected filters for displaying follow-ups).
  - `sortCriteria`: String (selected sorting criteria).
  - `selectedFollowUp`: Object (selected follow-up for viewing details).

### Data Flow
1. **Input Data**:
   - The user accesses the follow-ups table page.
   - The system retrieves the list of follow-ups from the `Relances` class.

2. **Display**:
   - The system displays the follow-ups in a table view.

3. **Search and Filtering**:
   - The user inputs a search query or applies filters to narrow down the list of follow-ups.
   - The system updates the table view based on the search query and selected filters.

4. **Sorting**:
   - The user selects sorting criteria to organize the list of follow-ups.
   - The system updates the table view based on the selected sorting criteria.

5. **View Details**:
   - The user clicks on a follow-up to view its details.
   - The system displays the details of the selected follow-up.

## Screen ASCII

### Screen 1: Follow-ups Table
```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                                                                               │
│  Follow-ups Table                                                           │
│  View follow-ups in a table                                                 │
│                                                                               │
│  [Search Bar]                                                                │
│                                                                               │
│  Filters:                                                                   │
│  [Sent Emails]  [Unsent Emails]  [Paid Invoices]  [Unpaid Invoices]            │
│                                                                               │
│  Sort by:                                                                   │
│  [Date]  [Status]  [Amount]                                                 │
│                                                                               │
│  Table View:                                                                │
│  Date  │  Time  │  Status  │  Invoice  │  Message                        │
│  15/01  │  10:00  │  Sent  │  INV001  │  Follow-up email sent to client. │
│  16/01  │  11:00  │  Not Sent  │  INV002  │  Follow-up email not sent.  │
│  17/01  │  12:00  │  Paid  │  INV003  │  Invoice paid.                │
│                                                                               │
│  Follow-up Details:                                                         │
│  Date: 15/01/2023                                                           │
│  Time: 10:00 AM                                                              │
│  Status: Sent                                                                │
│  Invoice: INV001                                                             │
│  Message: Follow-up email sent to client.                                    │
│                                                                               │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Components and Layouts

### Components/Partials Usage

#### Follow-ups Table Component
- **File**: `/templates/partials/follow_up_table_component.html`
- **Role**: Displays the follow-ups in a table view with search, filtering, and sorting options.
- **Dependencies**:
  - `followUpTable` store for managing state.
  - `axiosParse` for API calls to Parse.

#### Follow-up Details Component
- **File**: `/templates/partials/follow_up_details_component.html`
- **Role**: Displays the details of a selected follow-up.
- **Dependencies**:
  - `followUpTable` store for managing state.

### Layouts

#### Base Layout
- **File**: `/templates/layouts/base_layout.html`
- **Role**: Provides the basic structure for all pages, including the header, footer, and main content area.

#### Dashboard Layout
- **File**: `/templates/layouts/dashboard_layout.html`
- **Role**: Provides the structure for dashboard pages, including the header, sidebar, and main content area.
- **Components Used**:
  - `sidebarComponent`

## Data Parse Changes

### Class: `Relances`
- **Changes**: No changes required.

## File Changes

### New Files
- `/templates/partials/follow_up_table_component.html`: Component for displaying follow-ups in a table.
- `/templates/partials/follow_up_details_component.html`: Component for displaying follow-up details.
- `/static/js/stores/followUpTableStore.js`: Alpine.js store for managing follow-up table state.

### Modified Files
- `/templates/layouts/base_layout.html`: Include the follow-ups table component.
- `/templates/layouts/dashboard_layout.html`: Include the follow-up details component.

## Verification
Ensure the output file is created in the correct folder with the specified structure.