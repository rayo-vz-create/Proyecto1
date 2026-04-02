import mysql.connector
import os
import time

def get_db_connection():
    retries = 5
    while retries > 0:
        try:
            return mysql.connector.connect(
                host=os.getenv('DB_HOST', 'db-master'),
                user=os.getenv('DB_USER', 'rayir'),          # <-- Cambiado
                password=os.getenv('DB_PASSWORD', 'rayo2'), # <-- Cambiado
                database=os.getenv('DB_NAME', 'viajego_db'),
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
        except mysql.connector.Error:
            time.sleep(2)
            retries -= 1
    raise Exception("Error conectando a la BD")

    