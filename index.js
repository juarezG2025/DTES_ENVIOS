const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'QRICOPECAUSITA> '  
  })

console.log('-----------Que paso causita------------------');
console.log('Comandos: 1 -> Realizar envio de DTE al firmador');
console.log('Comandos: 2 -> Realizar envios en bucle');
console.log('Comandos: 3 -> Salir');

async function realizarPeticion(tipo) {
  
}