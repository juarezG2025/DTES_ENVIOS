import axios from 'axios';
import { ResponseFirmador } from './models/responseFirmador';
import { Configuracion } from './models/Configuracion';
import { PeticionFirmador} from './models/PeticionFirmador';
import * as repositorio from './repositorio';
import { promises as fs } from 'fs';
import * as path from 'path';
import { json } from 'stream/consumers';
import { v4 as uuidv4 } from 'uuid';
import { url } from 'inspector';
import { ERROR } from 'sqlite3';
import cliProgress from 'cli-progress'; 
import ora from 'ora'; 
    
const readline = require('readline');
var configuracion : Configuracion;

const moment = require('moment');
moment.locale('es');

axios.interceptors.response.use(
    response => response,
    error => {
      // Simplifica el error antes de que llegue a tu código
      return Promise.reject({
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
  );

async function realizarPeticion(url:string,tipo:string,datos:any,header:any = null):Promise<any> {
     let response : Response|any;
    
    switch (tipo) {
        case 'get':
            response = await axios.get<Response>(url);
            break;
        case 'post':
            response = await axios.post<Response>(url,datos,header);
            break;
            
            default:
            break;
    }
    return response.data;
}
////////////////////////////////////////////////////////////////////////
async function seleccionarJson(tipo:string):Promise<JSON|any>{
    let jsonSeleccionado :JSON;

    let nombreArchivo :string;    
    let ruta : string;
    let lectura:any;
    let contenido:any;
    let iteracion = await repositorio.obtenerIteracion(moment().format('YYYY-MM-DD'));
    let intecionN;

    if(iteracion < 9){
        intecionN = "0"+iteracion;
    }else{
        intecionN = iteracion;
    }
    
        nombreArchivo = "01-ConsumidorFinal";    
        ruta = path.join(__dirname,"jsons_dtes", `${nombreArchivo}.json`);
        lectura = await fs.readFile(ruta, 'utf-8');
    
        contenido = JSON.parse(lectura);
        contenido.emisor.nit = configuracion.datosEmisor.nit;
        contenido.emisor.nrc = configuracion.datosEmisor.nrc;
        contenido.emisor.nombre = configuracion.datosEmisor.nombre;
        contenido.emisor.codActividad = configuracion.datosEmisor.codActividad;
        contenido.emisor.nombreComercial = configuracion.datosEmisor.nombre;
        contenido.identificacion.codigoGeneracion = uuidv4().toUpperCase();
        contenido.identificacion.numeroControl = "DTE-"+tipo+"-00000000-0000000000000"+intecionN;
        contenido.identificacion.fecEmi = moment().format('YYYY-MM-DD');     
        contenido.identificacion.ambiente = configuracion.configuracion.ambiente;       ;
        jsonSeleccionado = contenido;
        
        const rutaGuardar = path.join(__dirname,"temp", `${contenido.identificacion.numeroControl}.json`);
        const guardarJson = JSON.stringify(jsonSeleccionado,null,2);
        await fs.writeFile(rutaGuardar, guardarJson, 'utf8');

    return jsonSeleccionado;
}
//////////////////////////////////////////////////////////////////////////////////////////
async function iniciarConfiguracion(){
    const ruta = path.join(__dirname, 'config.json');
    const lectura = await fs.readFile(ruta, 'utf-8');
    configuracion = JSON.parse(lectura) as Configuracion;
}

const codigoAdmitidos :string[] = [
    "01",
    "03"    
];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'ENVIADTE> '  
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function mostrarMenu() {
    console.log('======================MENU DTES============================');
    console.log('Comandos: 1 -> Realizar pruebas al firmador');
    console.log('Comandos: 2 -> Generar token');
    console.log('Comandos: 3 -> Realizar prueba a al api del MH');
    console.log('Comandos: 4 -> Realizar envio DTE en bucle');
    console.log('Comandos: 5 -> Limpiar carpeta temporal');
    console.log('Comandos: 6 -> Salir');
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function realizarEnvioMh(tipoDte:string,opciones:string|null){
    try{
        const token = await obtenerToken();
        let jsonSeleccionado = await seleccionarJson(tipoDte);
        const dteFirmado = await firmarDte(tipoDte);
        const url = configuracion.configuracion.urlMh;
        
        const datos = {
            "ambiente":configuracion.configuracion.ambiente,
            "idEnvio":1,
            "version":jsonSeleccionado.identificacion.version,
            "tipoDte":tipoDte,
            "documento":dteFirmado.body
        };
        
        let resultado = await realizarPeticion(url,"post",datos,{
            headers:{
                'Content-Type': 'application/json',
                'Authorization': token,
            }
        });

        return resultado;

    }catch(error:any){
        return error.data;
        
        
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function realizarBucleMh(tipoDte:string, n:number,opciones:string|null = null) {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(n, 0);
    //Devolver el numero de control, mover correlativos desde aca y poner alguna cosa para que diga que esta cargando
    let enviado = [];
    let rechazados = 0;
    let recibidos = 0;
    let jsonRecibido;
    for (let index = 0; index < n; index++) {
        let respuestaMh = await realizarEnvioMh(tipoDte,opciones);
        let jsonGenerado = await seleccionarJson(tipoDte);
        let respuestaAgregar;

        switch (opciones) {
            case "descripcionMsg":
                respuestaAgregar = respuestaMh.descripcionMsg;
                break;
            case "observaciones":
                respuestaAgregar = respuestaMh.observaciones;
                break;
            case "estado":
                respuestaAgregar = respuestaMh.estado;
                break;
            case "selloRecibido":
                respuestaAgregar = respuestaMh.selloRecibido;
                break;
            default:
                respuestaAgregar = respuestaMh;
                break;
        }

        jsonRecibido = {
            "numero de control": jsonGenerado.identificacion.numeroControl,
            "Respuesta MH": respuestaAgregar
        };

        enviado.push(jsonRecibido);
        
        if (respuestaMh.selloRecibido) {
            recibidos++;
        }else{
            rechazados++;
        }
    

        let iteracion =  await repositorio.obtenerIteracion(moment().format('YYYY-MM-DD'));
        let nuevaIteracion = iteracion+1;
        
        await repositorio.editarItercion(nuevaIteracion,moment().format('YYYY-MM-DD'));

        progressBar.increment();
    }
    progressBar.stop();
    return {
        "array de enviados": enviado,
        "Cantidad de recibidos" : recibidos,
        "Cantidad de rechazados" : rechazados
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function obtenerToken():Promise<string>{

    const datos = new FormData();
    let token = await repositorio.obtenerToken(moment().format('YYYY-MM-DD'));

    if(token == null || token == undefined){
        datos.append('user',configuracion.datosEmisor.nit);
        datos.append('pwd',configuracion.configuracion.passwordToken);
        
        const respuestaToken = await realizarPeticion(
            'https://apitest.dtes.mh.gob.sv/seguridad/auth',
            'post',
            datos
        )

        token = respuestaToken.body.token;
        repositorio.guardarRegistro(token,moment().format('YYYY-MM-DD'));
    }

    return token;
}
////////////////////////////////////////////////////////////////////////////////////
async function limpiarCarpeta() {
    const carpeta = path.join(__dirname, "temp");

    const archivos = await fs.readdir(carpeta);
    
    await Promise.all(
        archivos.map(archivo => 
            fs.unlink(path.join(carpeta, archivo))
        )
    );
}
//////////////////////////////////////////////////////////////////////////////////
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
                //Pruebas al firmador
                    //const spinnerF = ora('Enviando documentos a MH...').start();
                    respuesta = await firmarDte(partidos[1]);
                    //spinnerF.stop();
                    break;

            case "2":
                //Generar token
                //const spinnerT = ora('Generando Token...').start();
                respuesta = await obtenerToken();
                //spinnerT.succeed();
                break;

            case "3":
                //Probar enviador
                //const spinnerE = ora('Generando Token...').start();
                respuesta = await realizarEnvioMh(partidos[1],partidos[2]);
                //spinnerE.succeed();
                break;
            case "4":
                //Realizar envio en bucle
                respuesta = await realizarBucleMh(partidos[1],parseInt(partidos[2]),partidos[3]);
                break;
            case "5":
                await limpiarCarpeta();
                respuesta = 'Carpeta limpiada correctamente';
                break;
            case "6":
                process.exit(0);
                break;
            default:
                console.log("Ingrese un comando valido.");
                break;
        }
        
        console.log(JSON.stringify(respuesta, null, 2));

        mostrarMenu();
        rl.prompt();

    }).on('close', () => {
        process.exit(0);
    });    
}

main();