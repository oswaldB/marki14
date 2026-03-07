# Format de l'URL pour les Factures PDF

L'URL des factures PDF est générée dynamiquement selon le format suivant :

```
/ADN/Reporting/Gco/Piece/{year}/{month}/{refpiece}/standard/{refpiece} (GCO PI FA).pdf
```

## Exemple
Pour une facture avec les données suivantes :
- **Année (year)** : 2026
- **Mois (month)** : janvier
- **Référence (refpiece)** : FA260121 50319

L'URL générée sera :
```
/ADN/Reporting/Gco/Piece/2026/janvier/FA260121_50319/standard/FA260121 50319 (GCO PI FA).pdf
```

## Fonction de Génération
La fonction `generate_invoice_url` est utilisée pour construire cette URL. Elle prend en entrée les données de la facture et retourne l'URL formatée.

### Exemple de Code
```python
def generate_invoice_url(impaye_data: Dict[str, Any]) -> str:
    """Générer l'URL de la facture selon la formule spécifiée"""
    try:
        # Extraire les champs nécessaires
        datepiece = impaye_data.get('datepiece')
        refpiece = impaye_data.get('refpiece', '')
        
        if not datepiece or not refpiece:
            logger.warning(f"Champs manquants pour générer l'URL: datepiece={datepiece}, refpiece={refpiece}")
            return ""
        
        # Parser la date
        if isinstance(datepiece, str):
            if len(datepiece) > 10:
                dt = datetime.strptime(datepiece, "%Y-%m-%d %H:%M:%S")
            else:
                dt = datetime.strptime(datepiece, "%Y-%m-%d")
        elif isinstance(datepiece, datetime):
            dt = datepiece
        elif isinstance(datepiece, dict) and '__type' in datepiece and datepiece.get('__type') == 'Date':
            # Cas des dates venant de Parse
            date_str = datepiece.get('iso', '')
            if date_str:
                # Parser la date ISO (ex: "2026-01-21T00:00:00.000Z")
                date_str = date_str.replace('Z', '+00:00')  # Gérer le timezone
                dt = datetime.fromisoformat(date_str.replace('T', ' ').split('.')[0])
            else:
                logger.warning(f"Date ISO vide: {datepiece}")
                return ""
        else:
            logger.warning(f"Format de date non supporté: {type(datepiece)}")
            return ""
        
        # Extraire l'année
        year = dt.strftime("%Y")
        
        # Extraire le mois en français et le nettoyer
        month_names = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 
                      'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre']
        month_name = month_names[dt.month - 1]
        
        # Nettoyer le mois (remove accents, lowercase)
        import unicodedata
        month_clean = unicodedata.normalize('NFD', month_name)
        month_clean = ''.join(c for c in month_clean if unicodedata.category(c) != 'Mn')
        month_clean = month_clean.lower()
        
        # Nettoyer la référence
        ref_clean = refpiece.replace(" ", "_")
        
        # Construire l'URL
        invoice_url = f"/ADN/Reporting/Gco/Piece/{year}/{month_clean}/{ref_clean}/standard/{refpiece} (GCO PI FA).pdf"
        
        return invoice_url
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération de l'URL: {e}")
        return ""
```

## Notes
- Les espaces dans la référence (`refpiece`) sont remplacés par des underscores (`_`).
- Le mois est converti en minuscules et sans accents.
- L'URL est construite dynamiquement à partir des données de la facture.
