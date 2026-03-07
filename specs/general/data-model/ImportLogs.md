# Parse Class: ImportLogs

## Description
The `ImportLogs` class stores logs of import operations. It includes details such as timestamp, status, number of invoices imported, and errors encountered.

## Fields

### `objectId`
- **Type**: String
- **Description**: Unique identifier for the import log entry.

### `timestamp`
- **Type**: DateTime
- **Description**: Timestamp of the import operation.

### `status`
- **Type**: String
- **Description**: Status of the import operation (success or error).

### `factures_imported`
- **Type**: Number
- **Description**: Number of invoices imported.

### `errors`
- **Type**: Number
- **Description**: Number of errors encountered.

### `error_details`
- **Type**: String
- **Description**: Details of errors encountered.

## Relationships
- **None**: This class does not have relationships with other classes.

## Example
```json
{
  "objectId": "def456",
  "timestamp": "2023-01-01T10:00:00.000Z",
  "status": "success",
  "factures_imported": 10,
  "errors": 0,
  "error_details": ""
}
```

## Verification
Ensure all fields and relationships are defined and follow the naming conventions.