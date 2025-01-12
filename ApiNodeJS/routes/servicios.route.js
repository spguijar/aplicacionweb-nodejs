const servicios = require("../controllers/servicios.controller");
const router = require("express").Router();
const { authenticateToken } = require('../middleware/authenticateToken');

router.get("/getAll", authenticateToken,
    servicios.getAll
);

router.get("/getByProvincia", authenticateToken, servicios.getByProvincia);

router.get("/getByCliente", authenticateToken, servicios.getByCliente);

module.exports = router;