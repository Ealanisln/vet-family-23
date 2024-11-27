// init-replica.js
print('Iniciando configuración del replica set...');

const config = {
    "_id": "rs0",
    "members": [
        {
            "_id": 0,
            "host": "mongodb:27017",
            "priority": 1
        }
    ]
};

try {
    rs.initiate(config);
} catch (err) {
    print('Error al iniciar el replica set:', err);
}

// Esperar a que el replica set esté listo
let attempts = 30;
while (attempts > 0) {
    try {
        const status = rs.status();
        if (status.ok) {
            print('Replica set inicializado correctamente');
            break;
        }
    } catch (err) {
        print('Esperando a que el replica set esté listo...');
    }
    sleep(1000);
    attempts--;
}