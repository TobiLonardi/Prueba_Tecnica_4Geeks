"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from base64 import b64encode
import os
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,JWTManager,get_jwt
from datetime import timedelta



api = Blueprint('api', __name__)
app = Flask(__name__)

BLACKLIST = set()
def create_password(password, salt):
    return generate_password_hash(f"{password}{salt}")

jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = "clave-super-secreta"  # cámbiala por algo seguro
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=20)
app.config["JWT_BLACKLIST_ENABLED"] = True


@jwt.token_in_blocklist_loader
def check_if_token_in_blacklist(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]  # jti = JWT ID único
    return jti in BLACKLIST


# Allow CORS requests to this API
CORS(api)

def set_password(password, salt):
    return generate_password_hash(f"{password}{salt}")

def check_password(pass_hash, password, salt):
    return check_password_hash(pass_hash, f"{password}{salt}")


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route("/register", methods=["POST"])
def add_user():
    data = request.json
    email = data.get("email", None)
    password = data.get("password", None)
    salt = b64encode(os.urandom(32)).decode("utf-8")
    if not email or not password:
        return jsonify({"mensaje": "Necesitas completar el email y su password"}), 400
    elif (User().query.filter_by(email=email).one_or_none() is not None):
        return jsonify({"mensaje": "Este mail ya está registrado, intenta con algún otro"}), 400

    user = User()
    user.email = email
    user.password = set_password(password, salt)
    user.salt = salt
   
    db.session.add(user)
    try:
        db.session.commit()
        return jsonify("User created"), 201
    except Exception as error:
        db.session.rollback()
        return jsonify(f"Error: {error.args}"), 500


@api.route("/login", methods=["POST"])
def handle_login():
    data = request.json
    email = data.get("email", None)
    password = data.get("password", None)

    if (email is None or password is None):
        return jsonify("you need to put your email and password"), 400

    user = User.query.filter_by(email=email).one_or_none()
    if (user is None):
        return jsonify("Bad Email"), 400
    else:
        if (check_password(user.password, password, user.salt)):
            token = create_access_token(identity=str(user.id))
            return jsonify({"token": token,
                            "user": {
                                "id": user.id,
                                "email": user.email
                            }}), 200
        else:
            return jsonify("Bad password"), 400
        
#revisar por posibles problemas
        
@api.route("/logout", methods=["POST"])
@jwt_required()
def handle_logout():
    # obtener el usuario actual a partir del token
    jti = get_jwt()["jti"]  # identificador único del token
    BLACKLIST.add(jti)      # guardamos el token en la blacklist
    return jsonify({"message": "Logout successful"}), 200
