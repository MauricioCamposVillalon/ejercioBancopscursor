CREATE DATABASE Banco;

CREATE TABLE transacciones(
	descripcion varchar ( 50 ), 
	fecha varchar ( 10 ),
	monto DECIMAL,
	cuenta INT,
	FOREIGN KEY (cuenta) REFERENCES cuentas(id)
);
	
	
CREATE TABLE cuentas(
	id serial PRIMARY KEY,
	saldo DECIMAL CHECK (saldo >= 0 ) 
);

select * from transacciones;
select * from cuentas