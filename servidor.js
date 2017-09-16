/*
Autor: Mario Penavades Suárez y Alberto Jimenez Aliste
Fecha: Martes 7 Marzo 2017
Asignatura: CORE
*/

var net = require('net');
var fs = require('fs');
var clients = [];
var fileName = process.argv[2];
const regexName = /"[a-zA-Z0-9 ]*"/;
const regexNumber = /" [0-9]*/;
var array = [];
var contactName;

function existe(){
	if (!(fs.existsSync(fileName))) {
		var file = fs.openSync(fileName, 'w');
		fs.closeSync(file);
	}
	return fileName;
};

function readFile(){
	fs.readFile(existe(),'utf-8',
		        function(err, data) {
			       array = data.split("\n");
	            }
	);
};
readFile();

function getTel(dataLine){
	try {
		var contactName = dataLine.match(regexName);
  		var name =contactName[0].substr(1,contactName[0].length-2);
  		const regex = new RegExp(name);
  		for(i in array) {
  			if (regex.test(array[i])){
  				var arrayAux = array[i].split(" ");
  				var size = arrayAux.length;
  				telephone = arrayAux[size-1];
  				return true;
  			}
  		}
	}
	catch (e) {
	  return false;
	}
}

function setTel(dataLine){
	try {
		// Compara si hay letras y las guarda
		var contactName = dataLine.match(regexName);
		// Compara si hay numeros y las guarda
  		var contactNumber = dataLine.match(regexNumber);
  		// Lo que hay dentro de las comillas, es decir el nombre
  		var name = contactName[0].substr(1,contactName[0].length-2);
  		// El numero de telefono, sin "coma" ni espacio
  		var number = contactNumber[0].substr(2);
  		var exists = false;
  		const regex = new RegExp(name);
  		// Bucle en el cual recorre el array para saber si un nombre existe
  		for(i in array) {
  			if (regex.test(array[i])){
  				exists = true;
  				num = i;
  			}
  		}
  		// En caso de existir lo modifica
  		if (exists){
  		 	array[num]= name+", "+number;
  			exists = false;
  		} else {
  		// En caso de no existir, lo añade
  			array.push(name+", "+number);
  		}
  		toFile();
		return true;
	} catch (e) {
   		return false;
	}
}

function toFile(){
	fs.unlinkSync(fileName);
	for(i in array) {
		fs.appendFile(fileName, array[i]+'\n', function (err) {});
	}
}

var server = net.createServer(function(socket){
	clients.push(socket);
	console.log("Ha entrado un usuario");
	socket.on('data', function(d){
		var dataLine = d.toString().trim();
		if(dataLine.substr(0,6) === "setTel"){
			if (setTel(dataLine)){
				socket.write("OK\n");
			}
			else socket.write("KO\n");
		}
		if(dataLine.substr(0,6) === "getTel"){
			if (getTel(dataLine)){
				socket.write(telephone+"\n");
			}
			else socket.write("KO\n");
		}
		if(d.toString().trim() === "quit"){
			socket.end();
		}
	});
	socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    console.log("Ha salido un usuario");
  	});
	socket.on('error', function(err){
		console.log("Conexión fallida");
	});
});
server.listen(8000);
