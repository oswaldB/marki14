# Data Model

## Entities

### 1. **Impayes (Unpaid Invoices)**
- **Attributes:**
  - `id` (Primary Key)
  - `numero_facture` (Invoice Number)
  - `date` (Date)
  - `montant` (Amount)
  - `url_facture` (Invoice URL)
  - `facture_ftp` (Boolean: Indicates if stored on FTP or locally)
  - `acquéreur_nom` (Acquirer Name)
  - `acquéreur_email` (Acquirer Email)
  - `acquéreur_telephone` (Acquirer Phone)
  - `apporteur_affaire_nom` (Business Bringer Name)
  - `apporteur_affaire_email` (Business Bringer Email)
  - `apporteur_affaire_telephone` (Business Bringer Phone)
  - `payeur_nom` (Payer Name)
  - `payeur_email` (Payer Email)
  - `payeur_telephone` (Payer Phone)
  - `proprietaire_nom` (Owner Name)
  - `proprietaire_email` (Owner Email)
  - `proprietaire_telephone` (Owner Phone)
  - `notaire_nom` (Notary Name)
  - `notaire_email` (Notary Email)
  - `notaire_telephone` (Notary Phone)
  - `sequence_id` (Foreign Key: References `Sequences`)
  - `contact_id` (Foreign Key: References `Contacts`)
  - `statut` (Status: Payé, Non Payé)

### 2. **Contacts**
- **Attributes:**
  - `id` (Primary Key)
  - `nom` (Name)
  - `email` (Email)
  - `telephone` (Phone)
  - `type` (Type: Payeur, Propriétaire, Apporteur, Notaire)

### 3. **Sequences (Email Sequences)**
- **Attributes:**
  - `id` (Primary Key)
  - `nom` (Name)
  - `description` (Description)
  - `statut` (Status: Brouillon, Publiée)
  - `templates` (List of Email Templates)
  - `delais` (Delays for each email in the sequence)
  - `rules` (Automatic assignment rules)

### 4. **EmailTemplates**
- **Attributes:**
  - `id` (Primary Key)
  - `sequence_id` (Foreign Key: References `Sequences`)
  - `objet` (Subject)
  - `contenu` (Content)
  - `delai` (Delay in days)
  - `smtp_profile_id` (Foreign Key: References `SMTPProfiles`)

### 5. **SMTPProfiles**
- **Attributes:**
  - `id` (Primary Key)
  - `nom` (Name)
  - `serveur_smtp` (SMTP Server)
  - `port` (Port)
  - `nom_utilisateur` (Username)
  - `mot_de_passe` (Encrypted Password)
  - `signature_html` (HTML Signature)

### 6. **PaymentLinks**
- **Attributes:**
  - `id` (Primary Key)
  - `url_base` (Base URL)
  - `variables_dynamiques` (Dynamic Variables: e.g., `[[nfacture]]`, `[[montant]]`)

### 7. **Users**
- **Attributes:**
  - `id` (Primary Key)
  - `nom` (Name)
  - `email` (Email)
  - `mot_de_passe` (Encrypted Password)

### 8. **Relances (Follow-ups)**
- **Attributes:**
  - `id` (Primary Key)
  - `impaye_id` (Foreign Key: References `Impayes`)
  - `email_template_id` (Foreign Key: References `EmailTemplates`)
  - `date_envoi` (Sending Date)
  - `statut` (Status: Envoyé, Non Envoyé, Erreur)
  - `error` (Boolean: Indicates if an error occurred)
  - `error_details` (Error Details)

### 9. **Variables (Dynamic Variables)**
- **Attributes:**
  - `id` (Primary Key)
  - `nom` (Name)
  - `description` (Description)
  - `format` (Format: e.g., `[[nfacture]]`, `[[montant]]`)

### 10. **Logs (Logs)**
- **Attributes:**
  - `id` (Primary Key)
  - `action` (Action: e.g., Synchronization, Email Sending)
  - `details` (Details of the action)
  - `timestamp` (Timestamp of the action)
  - `status` (Status: Success, Error)

## Relationships

1. **Impayes to Contacts:**
   - One-to-Many: One `Impayes` record can reference multiple `Contacts` (e.g., acquéreur, payeur, propriétaire, notaire).

2. **Impayes to Sequences:**
   - Many-to-One: Multiple `Impayes` records can be assigned to one `Sequences` record.

3. **Sequences to EmailTemplates:**
   - One-to-Many: One `Sequences` record can have multiple `EmailTemplates`.

4. **EmailTemplates to SMTPProfiles:**
   - Many-to-One: Multiple `EmailTemplates` can use one `SMTPProfiles` record.

5. **Users to Sequences:**
   - One-to-Many: One `Users` record can create multiple `Sequences` records.

6. **Impayes to Relances:**
   - One-to-Many: One `Impayes` record can have multiple `Relances` records.

7. **EmailTemplates to Relances:**
   - One-to-Many: One `EmailTemplates` record can be used in multiple `Relances` records.

8. **Relances to Logs:**
   - One-to-Many: One `Relances` record can generate multiple `Logs` records.

## Notes

- The `Impayes` table stores unpaid invoices and their associated details.
- The `Contacts` table stores contact information for individuals associated with invoices.
- The `Sequences` table stores email sequences for follow-ups.
- The `EmailTemplates` table stores email templates used in sequences.
- The `SMTPProfiles` table stores SMTP configurations for sending emails.
- The `PaymentLinks` table stores payment links for invoices.
- The `Users` table stores user information for authentication and authorization.
- The `Relances` table stores follow-up actions and their statuses.
- The `Variables` table stores dynamic variables for email templates.
- The `Logs` table stores logs of actions and errors.
