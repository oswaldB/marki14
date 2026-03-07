# Requête SQL pour Récupérer les Factures Impayées

```sql
"""Récupérer les factures impayées depuis PostgreSQL"""
query = """
SELECT
  -- Champs Pièce
  p."nfacture" AS "nfacture",
  TO_CHAR(p."datepiece", 'YYYY-MM-DD HH24:MI:SS') AS "datepiece",
  p."totalhtnet" AS "totalhtnet",
  p."totalttcnet" AS "totalttcnet",
  p."resteapayer" AS "resteapayer",
  p."facturesoldee" AS "facturesoldee",
  p."commentaire" AS "commentaire_piece",
  p."refpiece" AS "refpiece",

  -- Champs Dossier
  d."idDossier" AS "idDossier",
  d."idStatut" AS "idStatut",
  s."intitule" AS "statut_intitule",
  d."contactPlace" AS "contactPlace",
  d."reference" AS "reference",
  d."referenceExterne" AS "referenceExterne",
  d."numero" AS "numero",
  d."idEmployeIntervention" AS "idEmployeIntervention",
  d."commentaire" AS "commentaire_dossier",
  d."adresse" AS "adresse",
  d."cptAdresse" AS "cptAdresse",
  d."codePostal" AS "codePostal",
  d."ville" AS "ville",
  d."numeroLot" AS "numeroLot",
  d."etage" AS "etage",
  d."entree" AS "entree",
  d."escalier" AS "escalier",
  d."porte" AS "porte",
  d."numVoie" AS "numVoie",
  d."cptNumVoie" AS "cptNumVoie",
  d."typeVoie" AS "typeVoie",
  d."dateDebutMission" AS "dateDebutMission",
  COALESCE(e."prenom" || ' ' || e."nom", '') AS "employe_intervention",

  -- Acquéreur
  MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "acquerur_nom",
  MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."email" END) AS "acquerur_email",
  MAX(CASE WHEN role."intitule" = 'Acquéreur' THEN iloc."telephoneMobile" END) AS "acquerur_telephone",

  -- Apporteur d'affaire
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN
    CASE
      WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
      ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
    END
  END) AS "apporteur_affaire_nom",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."email" END) AS "apporteur_affaire_email",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."telephoneMobile" END) AS "apporteur_affaire_telephone",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN iloc."typePersonne" END) AS "apporteur_affaire_typePersonne",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN
    CASE
      WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
      ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
    END
  END) AS "apporteur_affaire_contact_nom",
  MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN ilocContact."email" END) AS "apporteur_affaire_contact_email",

  -- Donneur d'ordre
  MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "donneur_ordre_nom",
  MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."email" END) AS "donneur_ordre_email",
  MAX(CASE WHEN role."intitule" = 'Donneur d''ordre' THEN iloc."telephoneMobile" END) AS "donneur_ordre_telephone",

  -- Locataire entrant
  MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "locataire_entrant_nom",
  MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."email" END) AS "locataire_entrant_email",
  MAX(CASE WHEN role."intitule" = 'Locataire entrant' THEN iloc."telephoneMobile" END) AS "locataire_entrant_telephone",

  -- Locataire sortant
  MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "locataire_sortant_nom",
  MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."email" END) AS "locataire_sortant_email",
  MAX(CASE WHEN role."intitule" = 'Locataire sortant' THEN iloc."telephoneMobile" END) AS "locataire_sortant_telephone",

  -- Notaire
  MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "notaire_nom",
  MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."email" END) AS "notaire_email",
  MAX(CASE WHEN role."intitule" = 'Notaire' THEN iloc."telephoneMobile" END) AS "notaire_telephone",

  -- Payeur
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN
    CASE
      WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
      ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
    END
  END) AS "payeur_nom",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."email" END) AS "payeur_email",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."telephoneMobile" END) AS "payeur_telephone",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN iloc."typePersonne" END) AS "payeur_typePersonne",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN
    CASE
      WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
      ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
    END
  END) AS "payeur_contact_nom",
  MAX(CASE WHEN role."intitule" = 'Payeur' THEN ilocContact."email" END) AS "payeur_contact_email",

  -- Propriétaire
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN
    CASE
      WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
      ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
    END
  END) AS "proprietaire_nom",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."email" END) AS "proprietaire_email",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."telephoneMobile" END) AS "proprietaire_telephone",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN iloc."typePersonne" END) AS "proprietaire_typePersonne",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN
    CASE
      WHEN ilocContact."typePersonne" = 'M' THEN ilocContact."nom"
      ELSE COALESCE(ilocContact."nom" || ' ' || ilocContact."prenom", ilocContact."nom", ilocContact."prenom")
    END
  END) AS "proprietaire_contact_nom",
  MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN ilocContact."email" END) AS "proprietaire_contact_email",

  -- Syndic
  MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."nom" || ' ' || iloc."prenom" END) AS "syndic_nom",
  MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."email" END) AS "syndic_email",
  MAX(CASE WHEN role."intitule" = 'Syndic' THEN iloc."telephoneMobile" END) AS "syndic_telephone",

  -- Calcul du type de payeur
  CASE
    WHEN MAX(CASE WHEN role."intitule" = 'Payeur' THEN
      CASE
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END) = MAX(CASE WHEN role."intitule" = 'Propriétaire' THEN
      CASE
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END)
    THEN 'Propriétaire'
    WHEN MAX(CASE WHEN role."intitule" = 'Payeur' THEN
      CASE
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END) = MAX(CASE WHEN role."intitule" = 'Apporteur d''affaire' THEN
      CASE
        WHEN iloc."typePersonne" = 'M' THEN iloc."nom"
        ELSE COALESCE(iloc."nom" || ' ' || iloc."prenom", iloc."nom", iloc."prenom")
      END
    END)
    THEN 'Apporteur d''affaire'
    ELSE 'Autre'
  END AS "payeur_type"

FROM
  "public"."(GCO) GcoPiece" p
LEFT JOIN
  "public"."(GCO) GcoPieceMetier" pm ON p."idpiece" = pm."idpiece"
LEFT JOIN
  "public"."(ADN_DIAG) Dossier" d ON pm."idmetier" = d."idDossier"
LEFT JOIN
  "public"."(ADN_RG)Employe" e ON d."idEmployeIntervention" = e."idEmploye"
LEFT JOIN
  "public"."(ADN_DIAG) StatutDossier" s ON d."idStatut" = s."idStatut"
LEFT JOIN
  "public"."(ADN_DIAG) DossierInterlocuteur" di ON d."idDossier" = di."idDossier"
LEFT JOIN
  "public"."(ADN_RG)Interlocuteur" iloc ON di."idInterlocuteur" = iloc."idInterlocuteur"
LEFT JOIN
  "public"."(ADN_RG)Interlocuteur" ilocContact ON di."idContact" = ilocContact."idInterlocuteur"
LEFT JOIN
  "public"."(ADN_DIAG) RoleInterlocuteurDossier" role ON di."idRole" = role."idRole"

WHERE
  (p."nfacture" IS NOT NULL)
  AND (
    p."datepiece" >= (
      CAST(CAST((NOW() + INTERVAL '-300000 day') AS date) AS timestamptz) + INTERVAL '-7 day'
    )
  )
  AND (
    p."datepiece" < (
      CAST(CAST(NOW() AS date) AS timestamptz) + INTERVAL '-7 day'
    )
  )
  AND (p."facturesoldee" = FALSE)
  AND (p."resteapayer" > 0)
  AND (p."valide" = TRUE)
  AND EXISTS (
    SELECT 1
    FROM "public"."(ADN_DIAG) DossierInterlocuteur" di2
    LEFT JOIN "public"."(ADN_DIAG) RoleInterlocuteurDossier" role2 ON di2."idRole" = role2."idRole"
    WHERE di2."idDossier" = d."idDossier"
    AND role2."intitule" = 'Payeur'
  )

GROUP BY
  p."nfacture",
  p."datepiece",
  p."totalhtnet",
  p."totalttcnet",
  p."resteapayer",
  p."facturesoldee",
  p."commentaire",
  p."refpiece",
  d."idDossier",
  d."idStatut",
  s."intitule",
  d."contactPlace",
  d."reference",
  d."referenceExterne",
  d."numero",
  d."idEmployeIntervention",
  d."commentaire",
  d."adresse",
  d."cptAdresse",
  d."codePostal",
  d."ville",
  d."numeroLot",
  d."etage",
  d."entree",
  d."escalier",
  d."porte",
  d."numVoie",
  d."cptNumVoie",
  d."typeVoie",
  d."dateDebutMission",
  COALESCE(e."prenom" || ' ' || e."nom", '')
ORDER BY p."datepiece" DESC
"""
```