
const cliente = require("../controllers/cliente.controller");
const router = require("express").Router();
const { authenticateToken } = require('../middleware/authenticateToken');

//Rutas post
router.post("/register",
    cliente.registrarUsuario
);
router.post("/login",
    cliente.login
);
router.post("/crearClienteandServicios", authenticateToken, cliente.crearClienteandServicios);

//Rutas get
router.get("/getClienteandServicios", authenticateToken,
    cliente.getClienteandServicios
);

//Rutas delete
router.delete("/eliminarClienteandServicios", authenticateToken, cliente.eliminarClienteandServicios)

module.exports = router;