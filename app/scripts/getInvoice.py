import os
import sys
from dotenv import load_dotenv
import tempfile
import paramiko
from typing import Optional, Tuple

# Charger les variables d'environnement
load_dotenv()

def get_invoice_from_ftp(invoice_url: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Récupère une facture depuis le serveur SFTP via son URL
    
    Args:
        invoice_url: URL de la facture (ex: /ADN/Reporting/Gco/Piece/2026/janvier/FA260121_50319/standard/FA260121 50319 (GCO PI FA).pdf)
    
    Returns:
        Tuple: (chemin_fichier_temporaire, message_erreur)
    """
    try:
        # Configuration SFTP depuis les variables d'environnement
        sftp_host = os.getenv("FTP_HOST")
        sftp_user = os.getenv("FTP_USERNAME")
        sftp_password = os.getenv("FTP_PASSWORD")
        sftp_port = int(os.getenv("FTP_PORT", "2222"))
        
        print(f"Configuration SFTP: host={sftp_host}, user={sftp_user}, port={sftp_port}")
        
        if not all([sftp_host, sftp_user, sftp_password]):
            return None, "Configuration SFTP manquante dans les variables d'environnement"
        
        # Nettoyer l'URL pour obtenir le chemin du fichier
        if invoice_url.startswith('/'):
            file_path = invoice_url[1:]  # Enlever le premier slash
        else:
            file_path = invoice_url
        
        # Nettoyer le chemin en supprimant les espaces et les caractères spéciaux
        file_path = file_path.strip()
        print(f"Chemin du fichier recherché: '{file_path}'")
        
        # Créer un fichier temporaire
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_filename = temp_file.name
        temp_file.close()
        
        # Connexion SFTP et téléchargement
        try:
            print(f"Tentative de connexion SFTP à {sftp_host}:{sftp_port}")
            
            # Créer le transport SFTP
            transport = paramiko.Transport((sftp_host, sftp_port))
            transport.connect(username=sftp_user, password=sftp_password)
            sftp = paramiko.SFTPClient.from_transport(transport)
            print("Connexion SFTP réussie")
            
            # Lister le contenu du répertoire parent pour voir la structure
            try:
                parent_dir = '/'.join(file_path.split('/')[:-1])
                print(f"Listage du répertoire: {parent_dir}")
                files = sftp.listdir(parent_dir)
                print(f"Fichiers trouvés: {files[:5]}...")  # Afficher les 5 premiers
            except Exception as list_error:
                print(f"Impossible de lister le répertoire: {list_error}")
            
            # Vérifier si le fichier existe
            try:
                file_size = sftp.stat(file_path).st_size
                print(f"Taille du fichier distant: {file_size} octets")
            except Exception as size_error:
                print(f"Impossible de vérifier la taille du fichier: {size_error}")
                file_size = 0
            
            # Télécharger le fichier
            print(f"Téléchargement de {file_path}")
            sftp.get(file_path, temp_filename)
            print(f"Fichier téléchargé: {temp_filename}")
            
            sftp.close()
            transport.close()
            print(f"Fichier téléchargé: {temp_filename}")
            
            return temp_filename, None
            
        except Exception as sftp_error:
            print(f"Erreur SFTP détaillée: {type(sftp_error).__name__}: {str(sftp_error)}")
            # Nettoyer le fichier temporaire en cas d'erreur
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)
            return None, f"Erreur SFTP: {str(sftp_error)}"
            
    except Exception as e:
        print(f"Erreur générale: {type(e).__name__}: {str(e)}")
        return None, f"Erreur lors de la récupération de la facture: {str(e)}"

def execute(invoice_url: str) -> dict:
    """
    Fonction principale pour l'exécution via l'API Flask
    
    Args:
        invoice_url: URL de la facture à récupérer
    
    Returns:
        dict: Résultat avec le fichier en base64 ou un message d'erreur
    """
    try:
        temp_filename, error = get_invoice_from_ftp(invoice_url)
        
        if error:
            return {
                "status": "error",
                "message": error
            }
        
        # Lire le fichier et le convertir en base64
        import base64
        with open(temp_filename, 'rb') as f:
            file_content = f.read()
            file_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # Nettoyer le fichier temporaire
        os.unlink(temp_filename)
        
        return {
            "status": "success",
            "filename": os.path.basename(invoice_url),
            "content": file_base64
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Erreur inattendue: {str(e)}"
        }

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Récupérer une facture depuis FTP")
    parser.add_argument("invoice_url", help="URL de la facture")
    parser.add_argument("--debug", action="store_true", help="Mode debug")
    
    args = parser.parse_args()
    
    if args.debug:
        import logging
        logging.basicConfig(level=logging.DEBUG)
    
    result = execute(args.invoice_url)
    print("Résultat:", result)
