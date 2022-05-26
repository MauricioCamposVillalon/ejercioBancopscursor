const { Pool } = require('pg');
const Cursor = require('pg-cursor');
const moment = require('moment');


const config = {
    user: 'postgres',
    host: '127.0.0.1',
    password: 'admin',
    database: 'banco',
    port: '5432',
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000
}


const pool = new Pool(config);

const argumentos = process.argv.slice(2);
let comando = argumentos[0].toLowerCase();
let tranx, cuenta, saldo, cuentaC2;
let fecha = moment().format('DD/MM/YYYY');


const nueva_cuenta = (cuenta, saldo) => {
    pool.connect(async (error, client, release) => {
        if (error) {
            console.log("Se ha generado un error en la conexion");
        } else {
            try {
                await client.query("BEGIN");
                const nuevo = {
                    rowMode: "array",
                    text: "INSERT INTO cuentas (id,saldo) VALUES ($1,$2) RETURNING id;",
                    values: [cuenta, saldo],
                }
                let res = await client.query(nuevo);
                const transaccion = {
                    rowMode: "array",
                    text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1,$2,$3,$4) RETURNING *;",
                    values: ["Deposito apertura", fecha, saldo, cuenta],
                }
                let res2 = await client.query(transaccion);
                console.log("Se creo una nueva cuenta con N° ", cuenta);
                console.log("Quedando asi:", res.rows);
                console.log("Se creo una nueva transaccion :", res2.rows)
                await client.query("COMMIT");
                console.log("Todo salio bien");

            } catch (error) {
                await client.query("ROLLBACK");
                let nom_err = errores(error);
                console.log("Cod de error: " + error.code);
                console.log("nombre de error" + nom_err);
                console.log("Detalle del error: " + error.detail);
                console.log("Tabla afectada: " + error.table);
                console.log("Tipo de violacion o error: " + error.constraint);
                let detalleError = {
                    codigo: error.code,
                    nombre: nom_err,
                    detalle: error.detail,
                    tabla: error.table,
                    violacion: error.constraint,
                    severidad: error.severity
                }
                console.table(detalleError);
            }
        }
        release();
        pool.end();
    })
}

const transaxiones = (transaccion, cuenta, saldo, cuenta2) => {
    pool.connect(async (error, client, release) => {
        if (error) {
            console.log("Se ha generado un error en la conexion");
        } else {
            try {
                await client.query("BEGIN");

                if (transaccion === "deposito") {
                    const trans = {
                        rowMode: "array",
                        text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1,$2,$3,$4) RETURNING *;",
                        values: [transaccion, fecha, saldo, cuenta],
                    }
                    const cuent = {
                        rowMode: "array",
                        text: "UPDATE cuentas SET saldo = saldo + $1 WHERE id=$2 RETURNING *;",
                        values: [saldo, cuenta],
                    }
                    let res = await client.query(trans);
                    let res2 = await client.query(cuent);
                    console.log("Se creo una nueva transaccion a la cuenta  N° ", cuenta);
                    console.table(res.rows)
                    console.log("Detalle de actulizacion dentro de la cuenta :", res2.rows);
                    await client.query("COMMIT");
                    console.log("Todo salio bien");

                } else if (transaccion == "retiro") {
                    console.log(transaccion, "|", cuenta, "|", saldo);
                    const trans = {
                        rowMode: "array",
                        text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1,$2,$3,$4) RETURNING *;",
                        values: [transaccion, fecha, saldo, cuenta],
                    }
                    const cuentr = `UPDATE cuentas SET saldo = saldo - ${saldo} WHERE id=${cuenta} RETURNING *;`;
                    let res = await client.query(trans);
                    let res2 = await client.query(cuentr);
                    console.log("Se creo una nueva transaccion a la cuenta  N° ", cuenta);
                    console.table(res.rows)
                    console.log("Detalle de actulizacion retiro dentro de la cuenta :", res2.rows);
                    await client.query("COMMIT");
                    console.log("Todo salio bien");
                } else if (transaccion === "traspaso") {
                    const trans = {
                        rowMode: "array",
                        text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1,$2,$3,$4) RETURNING *;",
                        values: [transaccion, fecha, saldo, cuenta],
                    }
                    const trans2 = {
                        rowMode: "array",
                        text: "INSERT INTO transacciones (descripcion, fecha, monto, cuenta) VALUES ($1,$2,$3,$4) RETURNING *;",
                        values: [transaccion, fecha, saldo, cuenta2],
                    }
                    const cuent = {
                        rowMode: "array",
                        text: "UPDATE cuentas SET saldo = saldo -$1 WHERE id=$2 RETURNING *;",
                        values: [saldo, cuenta],
                    }
                    const cuent2 = {
                        rowMode: "array",
                        text: "UPDATE cuentas SET saldo = saldo + $1 WHERE id=$2 RETURNING *;",
                        values: [saldo, cuenta2],
                    }
                    let res = await client.query(trans);
                    let res2 = await client.query(cuent);
                    let resCl2 = await client.query(trans2);
                    let res2Cl2 = await client.query(cuent2);
                    console.log("Se creo un traspaso desde la cuenta  N° " + cuenta + " hacia la cuenta  N°: " + cuenta2);
                    console.table(res.rows)
                    console.table(resCl2.rows)
                    console.log("Detalle de actulizacion cuenta origen :", res2.rows);
                    console.log("Detalle de actulizacion cuenta destino :", res2Cl2.rows);
                    await client.query("COMMIT");
                    console.log("Todo salio bien");

                } else {
                    console.log("Error al ingresar tipo de transaccion, ingrese nuevamente...")
                }

            } catch (error) {
                await client.query("ROLLBACK");
                let nom_err = errores(error);
                console.log("Cod de error: " + error.code);
                console.log("nombre de error" + nom_err);
                console.log("Detalle del error: " + error.detail);
                console.log("Tabla afectada: " + error.table);
                console.log("Tipo de violacion o error: " + error.constraint);
                let detalleError = {
                    codigo: error.code,
                    nombre: nom_err,
                    detalle: error.detail,
                    tabla: error.table,
                    violacion: error.constraint,
                    severidad: error.severity
                }
                console.table(detalleError);
            }
        }
        release();
        pool.end();
    })
}

const consulta = (cuenta) => {
    pool.connect(async (error, client, release) => {
        if (error) {
            console.log("Se ha generado un error en la conexion");
        } else {
            try {
                const consulta = new Cursor(`SELECT * from transacciones WHERE cuenta= ${cuenta};`);
                const cursor = client.query(consulta);                
                    let rows = [0];
                    let flag = true;
                    let contador = 1;
                    while (rows.length && flag) {
                        rows = await cursor.read(10);
                        rows.forEach(registro => {
                            if (registro.cuenta == cuenta) {
                                console.log("Cuenta :" + registro.cuenta + "| Tipo transaccion : " + registro.descripcion + "| Fecha Transaccion: " + registro.fecha + "| Monto transaccion:$" + registro.monto + "|")
                                flag = false;
                            }
                            contador++;
                        })
                        if (contador ===1 ){
                            console.log("No se encontraron registros para la cuenta ingresada..");
                        }
                    }

                 

                cursor.close();

            } catch (error) {
                let nom_err = errores(error);
                console.log("Cod de error: " + error.code);
                console.log("nombre de error" + nom_err);
                console.log("Detalle del error: " + error.detail);
                console.log("Tabla afectada: " + error.table);
                console.log("Tipo de violacion o error: " + error.constraint);
                let detalleError = {
                    codigo: error.code,
                    nombre: nom_err,
                    detalle: error.detail,
                    tabla: error.table,
                    violacion: error.constraint,
                    severidad: error.severity
                }
                console.table(detalleError);

            }


        }


        release();
        pool.end();
    })
}

const consulta_saldo = (cuenta) => {
    pool.connect(async (error, client, release) => {
        if (error) {
            console.log("Se ha generado un error en la conexion");
        } else {
            try {
                const consulta = new Cursor(`select * from cuentas `);
                const cursor = client.query(consulta);                
                    let rows = [0];
                    let flag = true;
                    let contador = 1;
                    while (rows.length && flag) {
                        rows = await cursor.read(20);
                        rows.forEach(registro => {
                            if (registro.id == cuenta) {
                                console.log("N° de Cuenta :" + registro.id );
                                console.log("Saldo :$ "+ registro.saldo)
                                flag = false;
                            }
                            contador++;
                        })
                        
                    }
                    if (flag === true ){
                        console.log("No se encontraron registros para la cuenta ingresada..");
                    }

                 

                cursor.close();

            } catch (error) {
                let nom_err = errores(error);
                console.log("Cod de error: " + error.code);
                console.log("nombre de error" + nom_err);
                console.log("Detalle del error: " + error.detail);
                console.log("Tabla afectada: " + error.table);
                console.log("Tipo de violacion o error: " + error.constraint);
                let detalleError = {
                    codigo: error.code,
                    nombre: nom_err,
                    detalle: error.detail,
                    tabla: error.table,
                    violacion: error.constraint,
                    severidad: error.severity
                }
                console.table(detalleError);

            }


        }


        release();
        pool.end();
    })
}

switch (comando) {
    case 'nuevo':
        cuenta = argumentos[1];
        saldo = argumentos[2];
        nueva_cuenta(cuenta, saldo);
        break;
    case 'transaccion':
        tranx = argumentos[1];
        cuenta = argumentos[2];
        saldo = argumentos[3];
        cuentaC2 = argumentos[4];
        transaxiones(tranx, cuenta, saldo, cuentaC2);
        break;
    case 'consulta':
        cuenta = argumentos[1];
        consulta(cuenta);
        break;
    case 'saldo':
        cuenta = argumentos[1];
        consulta_saldo(cuenta);
        break;
    default:
        console.log("Se ha ingresado una opcion invalida");
        break;
}


function errores(err) {
    if (err == "23505") {
        console.log("Error de restricción de integridad");
        console.log("  violación en valor único en la BDD al ingresar un valor");
    } else if (err == "42601") {
        console.log("Error de sintaxis");
    } else if (err = "42830") {
        console.log("Error Llave foranea invalida");
    } else if (err = "42602") {
        console.log("Error Nombre Invalido");
    } else if (err = "42P01") {
        console.log("Error Tabla no definida");
    } else if (err = "42501") {
        console.log("Error Privilegios insuficientes");
    } else if (err = "42725") {
        console.log("Error Funcion Ambigua");
    } else {
        console.log("Error no catalogado");
        console.log(`anote el error ${err} y comuniquese con soporte`);
    }
}