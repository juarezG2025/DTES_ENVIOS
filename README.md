# 🚀 ENVIA_DTESV_KY
*Aplicación para realizar envíos de DTES al ministerio de hacienda*  

## **📌 Tabla de Contenidos**  
1. [Requisitos](#Requisitos)  
2. [Instalación](#Instalación)  
3. [Configuración](#configuracion)  
4. [Uso](#uso)  
5. [Tipo de documentos](#tipos-de-documentos)  
5. [Filtros de respuesta](#filtros)  
6. [Notas importantes](#-notas)    
7. [Licencia](#licencia)  

---
##  Requisitos
- Node.js version 10.9.2 >
- Git (Opcional ya que se puede descargar el archivo .zip)
- Un firmador configurado con el certificado dado por el MH
- Credenciales dadas por el MH:
    - passwordPri
    - passwordToken (Clave para genera el token)
---
## Instalación  
*Pasos para instalar dependencias y ejecutar el proyecto:*  

```bash
# Clonar el repositorio
git clone https://github.com/juarezG2025/DTES_ENVIOS.git

# Entrar al directorio
cd ruta/a/tu/proyecto

# Instalar dependencias
npm install
```
---
## configuracion  
*En la ruta raiz en donde se ha descargado el proyecto, se debe de modificar el archivo **config.json** o en su defecto agregar uno nuevo, que contenga la siguiente estructura* 

    ```json
    "configuracion":{ 
        "urlFirmador": "", //URL DEL FIRMADOR CONFIGURADO CON LAS CREDENCIALES
        "passwordPri":"******",//clave dada por el ministerio de hacienda para hacer las peticiones al firmador
        
        "passwordToken":"***",//Clave dada por el ministerio de hacienda para generar el token

        "urlMh":"https://apitest.dtes.mh.gob.sv/fesv/recepciondte", /*Url de la api del MH ha realizar la peticion, actualmente apunta a la API de TEST, SINO ES NECESARIO NO SE DEBE DE CAMBIAR*/

        "ambiente":"00", //Ambiente al cual se quiere enviar el DTE, DE SER NECESARIO NO CAMBIARLO,

        "urlToken":"https://apitest.dtes.mh.gob.sv/seguridad/auth" //URL para generar e, token actualmente apunta a pruebas

    },
    "datosEmisor":{
        "nit":"000000000000", //NIT sin guiones del emisor
        "nrc":"0000000", //NRC del emisor
        "codActividad":"46599",//Codigo de actividad economica del emisor segun catalogo del MH
        "nombre":"Emisor s.a de c.v" //Nombre del emisor
    },
    "documentoRelacionado":{
        "numeroDocumento":"8DA908AD-AAE9-4E0B-B119-BA1AAC51047A", //Numero de documento relacionado (si aplica)
        "tipoDocumento":"03", //Tipo de documento relacionado (si aplica)
        "fechaDocumento":"2025-04-07" //Fecha de emision del documento relacionado (si aplica)
    }

    ``` 

## uso
### Consideraciones importantes
Para usar la aplicacion es necesario saber lo siguiente:

* **Formato de Entrada**
    * La aplicación no admite espacios en los comandos
    * Todos los parámetros deben ingresarse en una sola línea sin saltos

* **Estructura de Comandos**
    * No existen submenús jerárquicos
    * Todos los parámetros deben especificarse en el comando inicial

* **Sintaxis**
    * Los parámetros adicionales se separan exclusivamente con puntos (.)
    * Cada segmento después de un punto representa un nuevo parámetro

### Ejemplo practico
Para ejecutar un envío masivo de documentos, utilice el siguiente formato:

```bash
4.01.10.estado
```
En este ejemplo, se le esta indicando que ejecute una accion de tipo [bucle](#bucle) , seguido del tipo de DTE , seguido de la cantidad de iteraciones, y que aplique el filtro de *estado* a la respuesta que se devuelva

**Para inicia la aplicacion**

Abre una terminal y ejecuta:
```bash
# Muevete hasta la carpeta raiz del proyecto
cd ruta/a/tu/proyecto

# Inicia la aplicacion
npm start

```
### Comandos Disponibles
**La aplicación presenta un menú con las siguientes opciones:**
1. [Realizar pruebas al firmador](#pruebas-firmador)  
2. [Generar token de utenticacion](#token)  
3. [Realizar prueba a la api MH](#relizar-prueba-mh)  
4. [Realizar envio DTE en bluce](#bucle)  
5. [Establecer nuevo número correlativo](#correlativo)  
6. [Ver correlativo actual](#ver-correlativo)    
7. [Limpiar la carpeta ](#limpiar-carpeta)  
8. [Salir ](#salir)  

#### pruebas Firmador
*Se debe de indicar el tipo de DTE a firmar, sin espacios.*

**EJEMPLO**
```bash
#Se agrega 01 (factura de consumidor final) pero se puede agregar el numero que se necesite 
1.01
```
#### token

*Se pueden generar los token de autenticacion de forma manual, sin embargo, al realzar la primera peticion o prueba, el sistema genera automaticamente un token*

```bash
#Realiza la peticion al MH para el token  
2
```
#### relizar prueba mh
*Envia un DTE al MH, de igual forma, se debe de indicar el tipo de DTE, y si desea, guardar el archivo .json en la carpeta **temp** del proyecto*

**EJEMPLO**
```bash
#Realiza la peticion al MH para enviar el DTE, se agrega .01 (consumidor final) para indicarle el tipo de DTE
3.01
```
*Para generar el archivo .json:*
**EJEMPLO**
```bash
#Realiza la peticion al MH para enviar el DTE, se agrega .1 luego del tipo de DTE para indicar que queremos que genere el archivo .json ademas de realizar el envio
3.01.1
```
#### bucle
*Envia los DTE en bucle, el comando se estructura de la siguiente manera:*

**Ejemplo**: *4.01.10.estado (Enviar 10 Facturas de Consumidor Final, filtrar respuesta para mostrar solo estado)*

* **4** -> Es la opcion del menu 
* **01** -> Tipo de DTE a enviar (factura de consumidor final)
* **10** -> cantidad de iteraciones
* [**estado**](#filtros) -> Si solo se quiere que se muestre la respuestaa 'estado' que devuelve el MH util para debug y es opcional, se puede dejar en blanco este campo

```bash
#Enviar 10 Facturas de Consumidor Final, filtrar respuesta para mostrar solo estado)
3.01.10.estado
```
#### correlativo
*Establecer nuevo número correlativo*

```bash
#Establecer correlativo a 50
5.50 
```
#### ver correlativo
*Devuelve el correlativo actual*

#### limpiar carpeta
*Limpa la carpeta TEMP en donde se han generado los DTE*

#### Salir
*Sale xd*


## Tipos de documentos 
*La aplicación soporta varios tipos de documentos definidos por el MH:*
* 01 Factura
* 03 Comprobante de crédito fiscal
* 04 Nota de remisión
* 05 Nota de crédito
* 06 Nota de débito
* 07 Comprobante de retención
* 08 Comprobante de liquidación
* 09 Documento contable de liquidación
* 11 Facturas de exportación
* 14 Factura de sujeto excluido

## filtros
*Cuando se realiza [la accion 4 (envio en bucle)](#bucle) tiene la opcion de filtrar las respuesta, estos son los filtros que se puede aplicar:*

    * descripcionMsg = El mensaje de descripcion que devuelve el MH, aqui agrega una descripcion general del error
    * observaciones = Observaciones que devuelve el MH, aqui agrega los errores listados de haberlos
    * estado = Estado del DTE
    * selloRecibido = Sello del MH

## Notas
Verifique siempre que su firma digital esté configurada correctamente

Probar solo en **ambiente de pruebas** en caso de utilizarlo para produccion, se debe de consultar con el autor original 

Mantenga seguras sus credenciales y claves privadas

Use la función de envío masivo responsablemente para no sobrecargar el sistema (maximo 100)

## licencia
Este proyecto está bajo la [Licencia MIT](LICENSE).  



