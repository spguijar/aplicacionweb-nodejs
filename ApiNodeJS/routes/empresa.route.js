
const empresa = require("../controllers/empresa.controller");
const router = require("express").Router();
const { authenticateToken } = require('../middleware/authenticateToken');

router.get("/getAll", authenticateToken,
    empresa.getAll
);

router.get("/getByProvincia/:provincia", authenticateToken,
    empresa.getByProvincia
);

router.get("/getEmpresawithServicio", authenticateToken,
    empresa.getEmpresawithServicio);


module.exports = router;

