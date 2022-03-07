function validar(datos) {
  for (let i = 0; i < Object.keys(datos).length; i++) {
    let valor = Object.values(datos)[i];

    if (valor === "") {
      return false;
    }

    switch (Object.keys(datos)[i]) {
      case "dni":
        if (valor.length > 8 || valor.length < 7) {
          return false;
        }
        break;
      case "nombre":
      case "apellido":
        if (valor.length > 20 || valor.length < 2) {
          return false;
        }
        break;
      case "email":
        if (
          valor.length > 35 ||
          valor.length < 3 ||
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(valor)
        ) {
          return false;
        }
        break;
      case "password":
        if (
          valor.length < 6 ||
          valor.length > 20 ||
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(valor)
        ) {
          return false;
        }
        break;
      case "genero":
      case "especie":
        if (valor === "0") {
          return false;
        }
        break;
      default:
        break;
    }
  }

  return true;
}

module.exports = validar;
