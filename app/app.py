import logging
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime
from functools import wraps

from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

# Charger le .env depuis la racine du projet (un niveau au-dessus de app/)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
from flask import Flask, redirect, render_template, request, session, url_for
from flask_cors import CORS
from flask_livereload import LiveReload

# Importer et enregistrer le blueprint des scripts
from scripts.script_bp import script_bp

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.secret_key = "votre_cle_secrete_ici_changez_la_en_production"

# Activer CORS pour toutes les routes
CORS(app)


# Ajouter le filtre date pour Jinja2
def date_filter(value, format="%Y-%m-%d"):
    if value == "now":
        return datetime.now().strftime(format)
    try:
        date_obj = datetime.strptime(value, "%Y-%m-%d")
        return date_obj.strftime(format)
    except (ValueError, TypeError):
        return value


app.jinja_env.filters["date"] = date_filter


# Décorateur pour vérifier l'authentification
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)

    return decorated_function


# Initialise LiveReload
livereload = LiveReload(app)


app.register_blueprint(script_bp)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        remember_me = request.form.get("remember-me") == "on"

        # Logique d'authentification (à adapter selon votre système)
        # Exemple basique - à remplacer par une vérification réelle
        if username and password:
            # Authentification réussie
            session["user_id"] = username
            return redirect(url_for("dashboard"))
        else:
            # Authentification échouée
            return render_template("login.html", error="Identifiants invalides")

    return render_template("login.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/styleguide")
def styleguide():
    return render_template("styleguide.html")


@app.route("/impayes")
def impayes2():
    return render_template("impayes2.html")

@app.route("/impaye/<impaye_id>")
def impaye_details(impaye_id):
    return render_template("impaye_details.html", impaye_id=impaye_id)

@app.route("/contact/<contact_id>/impayes")
def contact_impayes(contact_id):
    return render_template("contact_impayes.html", contact_id=contact_id)


@app.route("/test-html")
def test_html():
    return render_template("test_notifications.html")


@app.route("/test-notifications")
def test_notifications():
    return render_template("test_notifications.html")


@app.route("/admin/configurations")
def admin_configurations():
    return render_template("admin-superadmin.html")


@app.route("/admin/superadmin")
def admin_superadmin():
    return render_template("admin-superadmin.html")


@app.route("/settings/profil-smtp")
def settings_profil_smtp():
    return render_template("settings_profil_smtp.html")


@app.route("/sequences")
def sequences():
    return render_template("sequences.html")

@app.route("/contacts-without-email")
def contacts_without_email():
    return render_template("contacts_without_email.html")


@app.route("/sequence/<sequence_id>")
def sequence_detail(sequence_id):
    return render_template("sequence_edit.html", sequence_id=sequence_id)

@app.route("/sequence/<sequence_id>/2")
def sequence_email_editor(sequence_id):
    return render_template("sequence_id_2.html", sequence_id=sequence_id)

@app.route("/sequence/<sequence_id>/3")
def sequence_alpine_editor(sequence_id):
    return render_template("sequence_id_3.html", sequence_id=sequence_id)

@app.route("/sequence/<sequence_id>/edit")
def sequence_edit(sequence_id):
    return render_template("sequence_id_3.html", sequence_id=sequence_id)


def run_script(script_name):
    """Exécute un script directement sans passer par HTTP."""
    try:
        import importlib
        module = importlib.import_module(f"scripts.{script_name}")
        result = module.execute({})
        logging.info(f"[scheduler] {script_name} → {result.get('status')} : {result.get('message', '')}")
    except Exception as e:
        logging.error(f"[scheduler] Erreur {script_name} : {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(lambda: run_script("getImpayesColumns"), "cron", minute=0)
    scheduler.add_job(lambda: run_script("populateImpayes"),   "cron", minute=3)
    scheduler.add_job(lambda: run_script("peuplerRelance"),    "cron", minute=15)
    scheduler.start()
    logging.info("[scheduler] Démarré — getImpayesColumns :00, populateImpayes :03, peuplerRelance :15")

    # Lancement immédiat au démarrage
    run_script("getImpayesColumns")
    run_script("populateImpayes")
    run_script("peuplerRelance")

    return scheduler


# Démarrer le scheduler une seule fois (évite le double-démarrage du reloader Werkzeug)
if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
    _scheduler = start_scheduler()


if __name__ == "__main__":
    # Démarre le serveur Flask avec livereload
    app.run(host="0.0.0.0", port=5000, debug=True)
