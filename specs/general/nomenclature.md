# Nomenclature

## Project Structure

### Folders
- **`/app`**: Contains the Flask backend application.
- **`/templates`**: Contains HTML templates for the frontend.
  - **`/partials`**: Contains reusable Alpine.js components.
  - **`/layouts`**: Contains layout templates for pages.
- **`/static`**: Contains static files like CSS, JS, and images.
  - **`/js`**: Contains JavaScript files, including Alpine.js stores.
  - **`/css`**: Contains CSS files.
- **`/specs`**: Contains specifications and design documents.
  - **`/features`**: Contains feature-specific design documents.
  - **`/general`**: Contains general design documents like nomenclature, sitemap, layouts, and data models.

### Files
- **`/templates/partials/*.html`**: Reusable Alpine.js components.
- **`/templates/layouts/*.html`**: Layout templates for pages.
- **`/static/js/stores/*.js`**: Alpine.js stores for state management.
- **`/specs/features/FXXX_nom_de_la_feature/use_cases/USXXX_nom_du_use_case_design.md`**: Design documents for specific use cases.
- **`/specs/general/nomenclature.md`**: Describes the organization of the project into folders and files.
- **`/specs/general/sitemap.md`**: Lists all routes and endpoints for the application.
- **`/specs/general/layouts.md`**: Describes the layouts used in the application.
- **`/specs/general/data-model/*.md`**: Contains one file per Parse class (e.g., `Invoice.md`, `Campaign.md`).

## Naming Conventions

### Files
- **Components**: Use lowercase with underscores (e.g., `upload_component.html`).
- **Stores**: Use camelCase (e.g., `invoiceUploadStore.js`).
- **Layouts**: Use lowercase with underscores (e.g., `base_layout.html`).

### Variables
- **Alpine.js Stores**: Use camelCase (e.g., `invoiceUpload`).
- **Parse Classes**: Use PascalCase (e.g., `Impayes`).
- **Fields**: Use snake_case (e.g., `numero_facture`).

### Routes
- **Flask Routes**: Use lowercase with hyphens (e.g., `/import-invoices`).
- **API Endpoints**: Use lowercase with hyphens (e.g., `/api/import-invoices`).

## Best Practices

### Components
- Each component should have a single responsibility.
- Components should be reusable and modular.
- Use Alpine.js for reactivity and state management.

### Stores
- Stores should mirror Parse data models with additional manipulations.
- Use stores for shared state across components.

### Layouts
- Layouts should define the overall structure of a page.
- Use layouts to include common elements like headers, footers, and sidebars.

### Data Models
- Each Parse class should have a corresponding design document in `/specs/general/data-model/`.
- Data models should include all fields and their types.

### Routes
- Routes should be defined in `/specs/general/sitemap.md`.
- Each route should have a clear purpose and corresponding template.

### Error Handling
- Always include error handling in methods that perform asynchronous operations.
- Provide clear and concise error messages to users.

### Validation
- Validate user inputs on both the frontend and backend.
- Provide feedback to users for invalid inputs.

### Security
- Store sensitive data securely.
- Use HTTPS for all communications.
- Sanitize user inputs to prevent injection attacks.

## Verification
Ensure all files and folders follow the defined nomenclature and best practices.