import mysql.connector
import os
import time

def get_db_connection():
    retries = 5
    conn = None
    while retries > 0:
        try:
            conn = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'db-master'),
                user=os.getenv('DB_USER', 'rayir'),
                password=os.getenv('DB_PASSWORD', 'rayo2'),
                database=os.getenv('DB_NAME', 'viajego_db'),
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
            # Verificamos que la conexión esté activa
            if conn.is_connected():
                return conn
        except mysql.connector.Error as err:
            print(f"⚠️ Error de conexión: {err}. Reintentando...")
            time.sleep(2)
            retries -= 1
    
    if not conn:
        raise Exception("❌ Error crítico: No se pudo conectar a la base de datos después de varios intentos.")
    return conn