# Rolling Vet

Rolling Vet es un sitio web de veterinaria que ofrece planes para tus mascotas. Posee panel de admin y de usuarios.

### Aclaracion importante

Si bien el front end está subido en netlify, esa aplicacion no funciona como corresponde. Por un conflicto de librerias con el navegador y las cookies, la conexion al servidor hosteado en heroku falla al realizar la autenticacion. Por ello mismo, este repositorio incluye front y back end, ambos hosteados en heroku. El README del front end se encuentra en el enlace debajo.

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