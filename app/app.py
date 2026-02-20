import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, render_template
from flask_livereload import LiveReload

# Importer et enregistrer le blueprint des scripts
from scripts.script_bp import script_bp

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Initialise LiveReload
livereload = LiveReload(app)


app.register_blueprint(script_bp)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/dashboard/clients")
def dashboard_clients():
    return render_template("dashboard_clients.html")


@app.route("/styleguide")
def styleguide():
    return render_template("styleguide.html")


@app.route("/icons-regular")
def icons_regular():
    return render_template("icons-regular.html")


@app.route("/test-html")
def test_html():
    return render_template("test-html.html")


@app.route("/test-notifications")
def test_notifications():
    return render_template("test_notifications_simple.html")


@app.route("/admin/configurations")
def admin_configurations():
    return render_template("admin-configurations.html")


if __name__ == "__main__":
    # Démarre le serveur Flask avec livereload
    app.run(host="0.0.0.0", port=5000, debug=True)
