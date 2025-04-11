import axios from 'axios';
import { ResponseFirmador } from './models/responseFirmador';
import { Configuracion } from './models/Configuracion';
import { PeticionFirmador} from './models/PeticionFirmador';
import { promises as fs } from 'fs';
import * as path from 'path';
import { json } from 'stream/consumers';


const readline = require('readline');
var configuracion : Configuracion;

async function realizarPeticion(url:string,tipo:string,datos:any):Promise<any> {
     let response : Response|any;
    switch (tipo) {
        case 'get':
             response = await axios.get<Response>(url);
            break;
        case 'post':
            response = await axios.post<Response>(url,datos);
            break;
            
            default:
            break;
    }
 return response.data;  
}

async function seleccionarJson(tipo:string):Promise<JSON>{
    let jsonSeleccionado :JSON;

    let nombreArchivo :string;    
    let ruta : string;
    let lectura:any;
    let contenido:any;

    switch (tipo) {
        case "01":
            nombreArchivo = "01-ConsumidorFinal";    
            ruta = path.join(__dirname,"jsons_dtes", `${nombreArchivo}.json`);
            lectura = await fs.readFile(ruta, 'utf-8');
        
            contenido = JSON.parse(lectura);
            contenido.emisor.nit = configuracion.datosEmisor.nit;
            contenido.emisor.nrc = configuracion.datosEmisor.nrc;
            contenido.emisor.nombre = configuracion.datosEmisor.nombre;
            contenido.emisor.codActividad = configuracion.datosEmisor.codActividad;
            contenido.emisor.nombreComercial = configuracion.datosEmisor.nombre;
            
            jsonSeleccionado = contenido;
            break;
    
        default:
            nombreArchivo = "01-ConsumidorFinal";    
            ruta = path.join(__dirname,"json_dtes", `${nombreArchivo}.json`);
            lectura = await fs.readFile(ruta, 'utf-8');
        
            contenido = JSON.parse(lectura);
            contenido.emisor.nit = configuracion.datosEmisor.nit;
            contenido.emisor.nrc = configuracion.datosEmisor.nrc;
            contenido.emisor.nombre = configuracion.datosEmisor.nombre;
            contenido.emisor.codActividad = configuracion.datosEmisor.codActividad;
            contenido.emisor.nombreComercial = configuracion.datosEmisor.nombre;
            
            jsonSeleccionado = contenido;
            break;
    }

    return jsonSeleccionado;
}

async function iniciarConfiguracion(){
    const ruta = path.join(__dirname, 'config.json');
    const lectura = await fs.readFile(ruta, 'utf-8');
    configuracion = JSON.parse(lectura) as Configuracion;
}

const codigoAdmitidos :string[] = [
    "01",
    "03"    
];

async function firmarDte(tipoDte:string): Promise<ResponseFirmador>{
    

    var datos:PeticionFirmador;
    var jsonSeleccionado = await seleccionarJson(tipoDte);
    datos = {
        nit : configuracion.datosEmisor.nit,
        activo : true,
        passwordPri : configuracion.configuracion.passwordPri,
        dteJson :  jsonSeleccionado
    };
    var r1 = await realizarPeticion(configuracion.configuracion.urlFirmador,"post",datos) as ResponseFirmador;

    return r1;
 }

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'QRICOPECAUSITA> '  
});

function mostrarMenu() {
    console.log('-----------Que paso causita------------------');
    console.log('Comandos: 1 -> Realizar pruebas');
    console.log('Comandos: 2 -> realizar envios');
    console.log('Comandos: 3 -> Salir');
}

/*async function realizarPeticion(params:type) {
    
}*/
async function main() {
    iniciarConfiguracion();
    mostrarMenu();
    rl.prompt();

    rl.on('line', async (input:string) => {
        const opcion = input.trim();
        const partidos = opcion.split('.');
        let respuesta;
        switch (partidos[0]) {
            case "1":
                respuesta = await firmarDte(partidos[1]);
                break;
        
            case "2":
                //let respuesta = await probarDte(input);
                break;
            case "3":
                process.exit(0);
                break;
        
            default:
                console.log("Ingrese un comando valido.");
                break;
        }
        
        console.log("respuesta: ", respuesta);

        mostrarMenu();
        rl.prompt();

    }).on('close', () => {
        process.exit(0);
    });    
}

main();