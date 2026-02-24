import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, render_template, request, redirect, url_for, session
from flask_livereload import LiveReload
from flask_cors import CORS
from functools import wraps

# Importer et enregistrer le blueprint des scripts
from scripts.script_bp import script_bp

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Activer CORS pour toutes les routes
CORS(app)

# Décorateur pour vérifier l'authentification
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Initialise LiveReload
livereload = LiveReload(app)


app.register_blueprint(script_bp)


@app.route("/")
def home():
    return render_template("index/html/index.html")


@app.route("/login")
def login():
    return render_template("login/html/login.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard/html/dashboard.html")


@app.route("/dashboard/clients")
def dashboard_clients():
    return render_template("dashboard_clients/html/dashboard_clients.html")


@app.route("/styleguide")
def styleguide():
    return render_template("styleguide/html/styleguide.html")



@app.route("/impayes")
def impayes2():
    return render_template("impayes2/html/impayes2.html")




@app.route("/test-html")
def test_html():
    return render_template("test-html/html/test-html.html")


@app.route("/test-notifications")
def test_notifications():
    return render_template("test_notifications_simple/html/test_notifications_simple.html")


@app.route("/admin/configurations")
def admin_configurations():
    return render_template("admin-configurations/html/admin-configurations.html")


@app.route("/admin/superadmin")
def admin_superadmin():
    return render_template("admin-superadmin/html/admin-superadmin.html")

@app.route("/settings/profil-smtp")
def settings_profil_smtp():
    return render_template("settings_profil_smtp/html/settings_profil_smtp.html")

@app.route("/sequences")
def sequences():
    return render_template("sequences/html/sequences.html")

@app.route("/sequence/<sequence_id>/man")
def sequence_manual(sequence_id):
    return render_template("sequence_manual/html/sequence_manual.html", sequence_id=sequence_id)

@app.route("/sequence/<sequence_id>/man2")
def sequence_manual2(sequence_id):
    return render_template("sequence_manual2/html/sequence_manual2.html", sequence_id=sequence_id)




if __name__ == "__main__":
    # Démarre le serveur Flask avec livereload
    app.run(host="0.0.0.0", port=5000, debug=True)
