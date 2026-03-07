# Parse Class: Impayes

## Description
The `Impayes` class stores information about unpaid invoices. It includes details such as invoice number, date, amount, contact details, and the URL to the stored PDF.

## Fields

### `objectId`
- **Type**: String
- **Description**: Unique identifier for the invoice.

### `numero_facture`
- **Type**: String
- **Description**: Invoice number.

### `date`
- **Type**: Date
- **Description**: Invoice date.

### `montant`
- **Type**: Number
- **Description**: Invoice amount.

### `details_contact`
- **Type**: String
- **Description**: Contact details.

### `url_facture`
- **Type**: String
- **Description**: URL to the stored PDF.

### `facture_ftp`
- **Type**: Boolean
- **Description**: Indicates if the PDF is stored on FTP or locally.

## Relationships
- **None**: This class does not have relationships with other classes.

## Example
```json
{
  "objectId": "abc123",
  "numero_facture": "FACT-001",
  "date": "2023-01-01T00:00:00.000Z",
  "montant": 100.00,
  "details_contact": "John Doe",
  "url_facture": "https://example.com/invoices/FACT-001.pdf",
  "facture_ftp": false
}
```

## Verification
Ensure all fields and relationships are defined and follow the naming conventions.