import requests
import json
from typing import List, Dict
from datetime import datetime

def execute(params: Dict) -> Dict:
    """
    Fonction d'exécution principale pour le script de génération d'emails avec Ollama.
    
    Args:
        params: Dictionnaire contenant les paramètres nécessaires:
            - variables: Dictionnaire des variables à intégrer
            - sequence_id: Identifiant de la séquence
    
    Returns:
        Dictionnaire avec le statut et les emails générés.
    """
    try:
        variables = params.get("variables", {})
        sequence_id = params.get("sequence_id", "default")
        
        emails = generate_emails_with_ollama(variables, sequence_id)
        
        return {
            "status": "success",
            "message": "Emails générés avec succès",
            "data": {"emails": emails},
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Erreur lors de la génération: {str(e)}",
            "data": {"emails": []},
            "timestamp": datetime.now().isoformat()
        }


def generate_emails_with_ollama(variables: Dict, sequence_id: str) -> List[Dict]:
    """
    Génère 5 emails en utilisant l'API Ollama avec le modèle Mistral.
    
    Args:
        variables: Dictionnaire des variables à intégrer dans les emails.
        sequence_id: Identifiant de la séquence pour personnalisation.
    
    Returns:
        Liste de 5 dictionnaires représentant les actions (emails) au format attendu.
    """
    # Configuration de l'API Ollama
    OLLAMA_API_URL = "http://api.ollama.com/v1/chat/completions"
    
    # Préparation du prompt avec les variables
    prompt = f"""
    Génère 5 emails pour une séquence de relance. Chaque email doit être au format JSON avec les champs suivants :
    - subject: sujet de l'email
    - body: contenu de l'email (HTML autorisé)
    - delay: délai en jours avant envoi
    - cc: copie carbone (optionnel)
    
    Intègre absolument toutes les variables suivantes dans chaque email en utilisant la syntaxe [[variable]] :
    {json.dumps(variables)}
    
    Le résultat doit être une liste de 5 objets JSON valides, sans texte supplémentaire.
    Exemple de format attendu :
    [
        {{"subject": "Rappel de paiement", "body": "<p>Bonjour [[nom]], ...", "delay": 0, "cc": ""}},
        {{"subject": "Deuxième rappel", "body": "<p>Bonjour [[nom]], ...", "delay": 3, "cc": ""}},
        ...
    ]
    """
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 209e220222f94dad9c24c525e143d7ac.LQEBq5cPAfK_sxzz-Q6rSnoT"  # Remplacer par la clé API réelle
    }
    
    payload = {
        "model": "mistral",
        "messages": [
            {"role": "system", "content": "Tu es un assistant spécialisé dans la rédaction d'emails de relance professionnels."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    try:
        response = requests.post(OLLAMA_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        # Extraire le contenu généré
        generated_content = result['choices'][0]['message']['content']
        
        # Parser le JSON généré
        emails = json.loads(generated_content)
        
        # Valider et formater les emails
        formatted_emails = []
        for i, email in enumerate(emails[:5]):  # Prendre les 5 premiers
            # Remplacer les variables {{}} par [[]] dans le body et subject
            body = email.get("body", "")
            subject = email.get("subject", f"Rappel {i+1}")
            
            # Conversion de la syntaxe des variables
            body = body.replace("{{{", "[[").replace("}}}", "]]")
            subject = subject.replace("{{{", "[[").replace("}}}", "]]")
            
            formatted_email = {
                "id": f"{sequence_id}_email_{i+1}",
                "type": "email",
                "subject": subject,
                "body": body,
                "delay": email.get("delay", i * 3),  # Délai par défaut
                "cc": email.get("cc", ""),
                "smtpProfileId": "",
                "senderEmail": ""
            }
            formatted_emails.append(formatted_email)
        
        return formatted_emails
        
    except Exception as e:
        print(f"Erreur lors de la génération des emails: {e}")
        # Retourner des emails par défaut en cas d'erreur
        return [
            {
                "id": f"{sequence_id}_email_1",
                "type": "email",
                "subject": "Rappel de paiement",
                "body": f"<p>Bonjour,</p><p>Ceci est un rappel pour votre paiement.</p>",
                "delay": 0,
                "cc": "",
                "smtpProfileId": "",
                "senderEmail": ""
            }
            for i in range(5)
        ]