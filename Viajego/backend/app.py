from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection
from werkzeug.utils import secure_filename
import json
import random
import os
import pyotp
import qrcode
import io
import base64
from flask_bcrypt import Bcrypt
import jwt 
import datetime 

app = Flask(__name__)
# LLAVE MAESTRA PARA TUS TOKENS
app.config['SECRET_KEY'] = 'misael_viajego_2026_llave_secreta'
app.config['JSON_AS_ASCII'] = False 
bcrypt = Bcrypt(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- FUNCIÓN PARA ARREGLAR CARACTERES (UTF-8) ---
def fix_encoding(data):
    if isinstance(data, str):
        try: return data.encode('latin-1').decode('utf-8')
        except: return data
    elif isinstance(data, list): return [fix_encoding(i) for i in data]
    elif isinstance(data, dict): return {k: fix_encoding(v) for k, v in data.items()}
    return data

# --- UPDATE GENÉRICO ---
def generic_update(table, id, data):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        valid_data = {k: v for k, v in data.items() if k not in ['id', 'user_id', 'fecha_registro']}
        set_clause = ", ".join([f"{key} = %s" for key in valid_data.keys()])
        values = list(valid_data.values()); values.append(id)
        
        sql = f"UPDATE {table} SET {set_clause} WHERE id = %s"
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"success": True, "message": "Actualizado correctamente"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400
    finally:
        conn.close()

# --- LÓGICA CORE: OBTENER SERVICIOS ---
def get_services(table_name, agency_filter=None):
    conn = get_db_connection(); cursor = conn.cursor(dictionary=True)
    sql = f"SELECT t.*, u.nombre_comercial as nombre_agencia FROM {table_name} t LEFT JOIN usuarios u ON t.user_id = u.id"
    params = ()
    if agency_filter:
        sql += " WHERE t.user_id = %s"
        params = (agency_filter,)
    sql += " ORDER BY t.id DESC"
    cursor.execute(sql, params)
    res = cursor.fetchall(); conn.close()
    return jsonify(fix_encoding(res))

# ==================== RUTAS: SERVICIOS (VUELOS, HOTELES, BUSES) ====================

@app.route('/api/vuelos', methods=['GET', 'POST'])
def vuelos():
    if request.method == 'GET': return get_services('vuelos', request.args.get('agency_id'))
    d = request.form; conn = get_db_connection(); cursor = conn.cursor()
    try:
        sql = "INSERT INTO vuelos (codigo_vuelo, origen_iata, destino_iata, aerolinea, clase_base, precio, fecha_salida, fecha_llegada, fecha_regreso_salida, fecha_regreso_llegada, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        vals = (d['codigo_vuelo'], d['origen_iata'], d['destino_iata'], d.get('aerolinea', 'Agencia'), d['clase_base'], float(d['precio']), d['fecha_salida'], d['fecha_llegada'], d['fecha_regreso_salida'], d['fecha_regreso_llegada'], int(d['user_id']))
        cursor.execute(sql, vals); conn.commit(); return jsonify({"success": True, "message": "Vuelo creado"}), 201
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

@app.route('/api/vuelos/<int:id>', methods=['PUT', 'DELETE'])
def vuelo_item(id):
    if request.method == 'DELETE':
        conn = get_db_connection(); cursor = conn.cursor()
        cursor.execute("DELETE FROM vuelos WHERE id=%s", (id,)); conn.commit(); conn.close()
        return jsonify({"success": True, "message": "Eliminado"})
    return generic_update('vuelos', id, request.json)

@app.route('/api/hoteles', methods=['GET', 'POST'])
def hoteles():
    if request.method == 'GET': return get_services('hoteles', request.args.get('agency_id'))
    d = request.form; conn = get_db_connection(); cursor = conn.cursor()
    try:
        sql = "INSERT INTO hoteles (nombre, ciudad, estrellas, precio_noche, servicios, tipo_habitacion, capacidad_max, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        vals = (d['nombre'], d['ciudad'], int(d['estrellas']), float(d['precio_noche']), d.get('servicios', ''), d.get('tipo_habitacion', 'Estándar'), int(d.get('capacidad_max', 4)), int(d['user_id']))
        cursor.execute(sql, vals); conn.commit(); return jsonify({"success": True, "message": "Hotel creado"}), 201
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

@app.route('/api/hoteles/<int:id>', methods=['PUT', 'DELETE'])
def hotel_item(id):
    if request.method == 'DELETE':
        conn = get_db_connection(); cursor = conn.cursor()
        cursor.execute("DELETE FROM hoteles WHERE id=%s", (id,)); conn.commit(); conn.close()
        return jsonify({"success": True, "message": "Eliminado"})
    return generic_update('hoteles', id, request.json)

@app.route('/api/autobuses', methods=['GET', 'POST'])
def autobuses():
    if request.method == 'GET': return get_services('rutas_autobus', request.args.get('agency_id'))
    d = request.form; conn = get_db_connection(); cursor = conn.cursor()
    try:
        sql = "INSERT INTO rutas_autobus (origen, destino, linea_autobus, tipo_asiento, precio, fecha_salida, fecha_llegada, fecha_regreso_salida, fecha_regreso_llegada, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        vals = (d['origen'], d['destino'], d.get('linea_autobus', 'Bus'), d['tipo_asiento'], float(d['precio']), d['fecha_salida'], d['fecha_llegada'], d['fecha_regreso_salida'], d['fecha_regreso_llegada'], int(d['user_id']))
        cursor.execute(sql, vals); conn.commit(); return jsonify({"success": True, "message": "Ruta creada"}), 201
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

@app.route('/api/autobuses/<int:id>', methods=['PUT', 'DELETE'])
def bus_item(id):
    if request.method == 'DELETE':
        conn = get_db_connection(); cursor = conn.cursor()
        cursor.execute("DELETE FROM rutas_autobus WHERE id=%s", (id,)); conn.commit(); conn.close()
        return jsonify({"success": True, "message": "Eliminado"})
    return generic_update('rutas_autobus', id, request.json)

# ==================== AUTENTICACIÓN: REGISTRO Y LOGIN ====================

@app.route('/api/registro', methods=['POST'])
def handle_user_registration():
    d = request.json; conn = get_db_connection(); cursor = conn.cursor()
    try:
        rol = d.get('rol', 'usuario')
        comercial = d.get('nombre_comercial') if rol == 'agencia' else None
        hashed_password = bcrypt.generate_password_hash(d['password']).decode('utf-8')
        sql = "INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, nombre_comercial) VALUES (%s, %s, %s, %s, %s, %s)"
        vals = (d.get('nombre'), d.get('apellido'), d['email'], hashed_password, rol, comercial) 
        cursor.execute(sql, vals); conn.commit(); return jsonify({"success": True, "message": "Registro exitoso"}), 201
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    d = request.json; conn = get_db_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, apellido, email, rol, nombre_comercial, secret_2fa, password_hash FROM usuarios WHERE email=%s", (d.get('email'),))
    user = cursor.fetchone(); conn.close()

    if user and bcrypt.check_password_hash(user['password_hash'], d.get('password')):
        if user.get('secret_2fa'):
            return jsonify({"success": True, "requires_2fa": True, "user_id": user['id']})
        
        # --- BUSCA ESTA PARTE EN TU LOGIN ---
        token = jwt.encode({
            'user_id': user['id'],
            'rol': user['rol'],
            'creador': 'Misael',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        # AGREGA ESTA LÍNEA AQUÍ:
        print(f"\n🚀 TOKEN DE MISAEL (Login Directo):\n{token}\n", flush=True) 

        return jsonify({"success": True, "requires_2fa": False, "token": token, "user": fix_encoding(user)})
    return jsonify({"success": False, "message": "Credenciales inválidas"}), 401

@app.route('/api/verify-2fa', methods=['POST'])
def verify_2fa():
    d = request.json; user_id = d.get('user_id'); otp_code = d.get('otp_code')
    conn = get_db_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nombre, apellido, email, rol, nombre_comercial, secret_2fa FROM usuarios WHERE id=%s", (user_id,))
    user = cursor.fetchone(); conn.close()

    if not user or not user['secret_2fa']: return jsonify({"success": False, "message": "Error de autenticación"}), 401

    totp = pyotp.TOTP(user['secret_2fa'])
    if totp.verify(otp_code):
        token = jwt.encode({
            'user_id': user['id'],
            'rol': user['rol'],
            'creador': 'Misael',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        print(f"\n🚀 TOKEN DE MISAEL (2FA):\n{token}\n", flush=True) 
        return jsonify({"success": True, "token": token, "user": fix_encoding(user)})
    return jsonify({"success": False, "message": "Código incorrecto o expirado"}), 401

# ==================== ADMIN: GESTIÓN DE AGENCIAS ====================

@app.route('/api/admin/crear_agencia', methods=['POST'])
def crear_agencia():
    d = request.json; conn = get_db_connection(); cursor = conn.cursor()
    try:
        # CORRECCIÓN: Hashear contraseña antes de insertar
        hashed_pass = bcrypt.generate_password_hash(d['password']).decode('utf-8')
        cursor.execute("INSERT INTO usuarios (email, password_hash, rol, nombre_comercial) VALUES (%s, %s, 'agencia', %s)", (d['email'], hashed_pass, d['nombre_comercial']))
        conn.commit(); return jsonify({"success": True, "message": "Agencia creada"}), 201
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

@app.route('/api/admin/agencias', methods=['GET'])
def listar_agencias():
    conn = get_db_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, email, nombre_comercial, fecha_registro FROM usuarios WHERE rol='agencia' ORDER BY id DESC")
    res = cursor.fetchall(); conn.close()
    return jsonify(fix_encoding(res))

@app.route('/api/admin/agencias/<int:id>', methods=['PUT', 'DELETE'])
def admin_agencia_item(id):
    conn = get_db_connection(); cursor = conn.cursor()
    if request.method == 'DELETE':
        try:
            cursor.execute("DELETE FROM usuarios WHERE id=%s AND rol='agencia'", (id,))
            conn.commit(); return jsonify({"success": True, "message": "Agencia eliminada"})
        except Exception as e: return jsonify({"success": False, "message": str(e)}), 500
        finally: conn.close()
    
    data = request.json
    if 'password' in data:
        data['password_hash'] = bcrypt.generate_password_hash(data.pop('password')).decode('utf-8')
    return generic_update('usuarios', id, data)

# ==================== RESERVAS ====================

@app.route('/api/reservas', methods=['POST'])
def crear_reserva():
    d = request.json; conn = get_db_connection(); cursor = conn.cursor()
    try:
        code = f"RES-{random.randint(10000, 99999)}"; dets = json.dumps(d.get('detalles', {}))
        sql = "INSERT INTO reservas (user_id, reservation_code, service_type, item_name, date_start, date_end, num_guests, details_json, total_price) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        vals = (d['user_id'], code, d['service_type'], d['item_name'], d['date_start'], d['date_end'], d['num_guests'], dets, d['total_price'])
        cursor.execute(sql, vals); conn.commit(); return jsonify({"success": True, "code": code}), 201
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

@app.route('/api/mis_reservas/<int:uid>', methods=['GET'])
def mis_reservas(uid):
    conn = get_db_connection(); cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM reservas WHERE user_id=%s ORDER BY created_at DESC", (uid,))
    res = cursor.fetchall(); conn.close(); fixed_res = fix_encoding(res)
    for r in fixed_res:
        try: r['detalles'] = json.loads(r['details_json']) if r.get('details_json') else {}
        except: r['detalles'] = {}
    return jsonify(fixed_res)

@app.route('/api/reservas/cancelar/<int:id>', methods=['POST'])
def cancelar_reserva(id):
    conn = get_db_connection(); cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT total_price FROM reservas WHERE id=%s", (id,))
        row = cursor.fetchone()
        if not row: return jsonify({"success": False, "message": "Reserva no encontrada"}), 404
        refund = float(row['total_price']) * 0.30
        cursor.execute("UPDATE reservas SET status='Cancelado', refund_amount=%s WHERE id=%s", (refund, id))
        conn.commit(); return jsonify({"success": True, "reembolso": refund})
    except Exception as e: return jsonify({"success": False, "message": str(e)}), 400
    finally: conn.close()

# ==================== 2FA: GOOGLE AUTHENTICATOR ====================

@app.route('/api/generate-2fa', methods=['POST'])
def generate_2fa():
    try:
        data = request.json; user_id = data.get('user_id')
        secret = pyotp.random_base32(); conn = get_db_connection(); cursor = conn.cursor()
        cursor.execute("SELECT email FROM usuarios WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user: return jsonify({"error": "Usuario no encontrado"}), 404
        user_email = user[0]
        cursor.execute("UPDATE usuarios SET secret_2fa = %s WHERE id = %s", (secret, user_id))
        conn.commit(); conn.close()

        totp_auth_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user_email, issuer_name="ViajeGO")
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_auth_url); qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO(); img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return jsonify({"qr_code": f"data:image/png;base64,{img_str}", "secret": secret})
    except Exception as e: return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)