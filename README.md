# Rolling Vet

Rolling Vet es un sitio web de veterinaria que ofrece planes para tus mascotas. Posee panel de admin y de usuarios.

Las rutas del backend estan protegidas, y se debe iniciar sesion para acceder a informacion delicada.

### Aclaracion importante

Si bien el front end está subido en Netlify, esa aplicacion no funciona como corresponde. Por un conflicto de librerias (Passport) con el navegador y las cookies (que no se establecen por venir de un sitio externo, que ni con "sameSite: none" funcionaba), la conexion al servidor hosteado en Heroku falla al realizar la autenticacion. Por ello mismo, este repositorio incluye front y back end, ambos hosteados en Heroku. El README del front end se encuentra en el enlace debajo.

Por culpa de ello y del testing, el repositorio tiene mas commits de los que deberia.

## Librerias utilizadas

Para el proyecto, se utilizaron los siguientes recursos:

**Back-End (este repo)**

- Node.js
- Express
- Express session
- Bcrypt
- Dotenv
- Mongoose
- Morgan
- Passport & Passport-local
- Path
- Cors
- Nodemon (en development)

Repositorio front-end: [Front-end](https://github.com/ezeamin/rollingVet)

## Instalación

Deberás contar con las siguientes dependencias del proyecto:

- Node Package Manager

Tras clonar el repositorio, ejecutar el siguiente comando en la carpeta en una terminal de Node:

```bash
npm install
```

Las dependencias se instalarán automáticamente. 

## Demo (Server)
[Rolling Vet](https://rollingvet.herokuapp.com)

### Administrador

- Usuario: admin@admin.com
- Contraseña: admin

### .env data

Solicitar informacion del acceso a la DB por mensaje privado.