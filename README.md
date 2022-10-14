# Pedro BOT

Bot de discord diseñado para organizar raids de WoW

## Comandos

> ### /iam NOMBRE CLASE
> Asigna el nombre de un personaje a tu usuario de discord.  
> Puede usarse tantas veces como personajes tengas.
> - **NOMBRE**: El nombre de tu personaje que se mostrará al unirte a una raid.
> - **CLASE**: La clase de tu personaje. Se mostrará una lista con las opciones disponibles.

> ### /remove NOMBRE
> Desasigna el nombre de un personaje de tu usuario de discord.
> - **NOMBRE**: El nombre de tu personaje que usaste con el comando **/iam**.

> ### /raid NOMBRE JUGADORES FECHA HORA [HEROICA]
> Crea una nueva raid.
> - **NOMBRE**: El nombre dentro del juego de la raid. Se mostrará una lista con las opciones disponibles.
> - **JUGADORES**: El número de jugadores de la raid. Se mostrará una lista con las opciones disponibles.
> - **FECHA**: El día que se realizará la raid. Usar el formato dd/mm/aaaa (ej. 10/08/2022).
> - **HORA**: La hora que se realizará la raid. Usar el formato hh:mm (ej. 20:30).
> - **HEROICA**: Parámetro opcional para indicar si la raid se realizará en este modo. Se mostrará una lista con las opciones disponibles. Falso por defecto.

> ### /invite
> Muestra el enlace para invitar el bot a otro servidor de discord.

## Cómo unirse a una raid

Al crearse una raid, aparecerán 5 iconos en las reacciones.  

Los 3 primeros botones son para seleccionar el rol que quieres ocupar en esa raid.  
Si quieres cambiar de rol, primero debes eliminar tu participación apretando el icono con el cual te uniste.  
En caso de tener más de un personaje asignado a tu usuario de discord, se mostrarán unos botones para elegir cuál quieres usar.  

El cuarto botón (❌ ) sirve para eliminar la participación de un usuario en esa raid.  
Esta opción solo puede usarla el usuario que creó la raid.  
Al usarse, aparecerá un desplegable con el nombre de todos los personajes registrados en esa raid.  

El quinto botón (🔄) sirve para actualizar la información de la raid.  
Normalmente la raid se actualiza automáticamente cuando un usuario registra o borra su participación.  
El único caso en que será necesario actualizar la raid manualmente, es cuando un usuario borra un personaje que estaba registrado en una raid.  

## Cómo instalar el Bot

- Crea una aplicación y bot en [Discord Developer Portal](https://discord.com/developers/applications)
- Sube los emojis en la carpeta **src/assets** a tu servidor de discord dónde vayas a usar el Bot. Si vas a usarlo en más de un servidor, basta con hacerlo en unos de ellos.
- Crea una copia del archivo **config.json.example** en la misma carpeta y llámalo **config.json**
- Pon tu **token** y **application id** que obtuviste en el paso 1 en los campos **token** y **client_id**, respectivamente.
- Consigue las IDs de los emojis y ponlas en los campos restantes.
- Necesitarás tener instalado [node.js](https://nodejs.org/).
- Una vez instalado, ejecuta el comando ``npm install`` dentro de la carpeta raíz del proyecto.
- Para ejecutar el Bot, usa el comando ``npm run bot``. El bot seguirá activo hasta que cierres el terminal o uses Ctrl+C.