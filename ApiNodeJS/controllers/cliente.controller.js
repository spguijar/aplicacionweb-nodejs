const { Cliente, Servicios_Empresa, Clientes_Servicios_Empresa, Empresa, Servicios } = require("../models");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
//TODO, meter la la variable process.env.secret_key por una de configJS
const dotenv = require('dotenv');
dotenv.config();

exports.registrarUsuario = async (req, res) => {
    const { nombre, contraseña, email, direccion, provincia } = req.body;
    //Encriptamos la contraseña
    console.log(nombre, contraseña, email, direccion, provincia);
    const hashedContraseña = await bcrypt.hash(contraseña, 10);

    try {
        const cliente = await Cliente.create({
            nombre: nombre,
            email: email,
            password: hashedContraseña,
            direccion: direccion,
            provincia: provincia
        })
        res.status(201).send({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).send({ error: 'Error al registrar el usuario', 'error': error.message });
    }
};

exports.login = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const cliente = await Cliente.findOne({
            where: {
                email: email
            }
        })
        if (await cliente) {

            //Comparamos las contraseñas
            const isPasswordValid = await bcrypt.compare(contraseña, cliente.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            } else {

                const token = jwt.sign({ clienteId: cliente.id }, process.env.secret_key, { expiresIn: '1h' });

                return res.status(200).send({
                    'token': token, 'id_cliente': cliente.id, 'nombre': cliente.nombre, 'provincia': cliente.provincia, 'direccion': cliente.direccion
                })
            }

        } else {
            throw new RangeError();
        }
    } catch (error) {
        return res.status(404).send({
            message: 'Usuario no encontrado', 'error': error.message
        });

    }
}

exports.getClienteandServicios = async (req, res) => {
    const { id_cliente } = req.query;
    try {
        const result = await Cliente.findAll({
            include: [
                {
                    model: Servicios_Empresa,
                    //Para que no se muestre la tabla intermedia en los resultados
                    through: { attributes: [] },
                    include: [
                        {
                            model: Empresa, // Incluye los datos de la empresa
                            attributes: ['nombre', 'provincia'], // Campos que deseas obtener
                        },
                        {
                            model: Servicios, // Incluye los datos del servicio
                            attributes: ['tarea'], // Campos que deseas obtener
                        },
                    ],
                }
            ],
        });
        return res.status(200).send({ result });
    } catch (error) {
        return res.status(500).send({ message: 'Error obtener empresas y sus servicios.', 'error': error.message });
    }
}
exports.crearClienteandServicios = async (req, res) => {
    const { id_cliente, id_servicio_empresa, preciocontrat } = req.body;
    try {
        // Buscamos si ya existe un registro con el id_cliente e  id_servicio_empresa
        const registroExistente = await Clientes_Servicios_Empresa.findOne({
            where: {
                id_cliente: id_cliente,
                id_servicio_empresa: id_servicio_empresa,
            },
        });
        if (registroExistente) {
            // Si ya existe, suma el valor nuevo al valor existente
            const nuevoPreciocontrat = parseFloat(registroExistente.preciocontrat) + parseFloat(preciocontrat);

            // Actualiza el valor de preciocontrat
            await registroExistente.update({ preciocontrat: nuevoPreciocontrat });

            res.status(200).send({
                message: 'Registro existente actualizado con éxito'
            });
        } else {
            console.log(id_cliente, id_servicio_empresa, preciocontrat)
            const nuevoRegistro = await Clientes_Servicios_Empresa.create({
                id_cliente: id_cliente,
                id_servicio_empresa: id_servicio_empresa,
                preciocontrat: preciocontrat
            })
            res.status(201).send({ message: 'Creación de un registro en Clientes_Servicios_Empresas con éxito' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Error al registrar Clientes_Servicios_Empresas', 'error': error.message });
    }
}

exports.eliminarClienteandServicios = async (req, res) => {
    const { id_cliente, id_servicio_empresa } = req.query;
    Clientes_Servicios_Empresa.destroy({
        where: {
            id_cliente: id_cliente,
            id_servicio_empresa: id_servicio_empresa
        }
    })
        .then((rowsDeleted) => {
            if (rowsDeleted > 0) {
                return res.status(200).send({ message: `Eliminado el servicio del cliente ${id_cliente} ${id_servicio_empresa}` });
            } else {
                return res.status(404).send({ error: `No se encontró ningún registro que coincidiera con la condición: id_cliente=${id_cliente}, id_servicio_empresa=${id_servicio_empresa}` });
            }
        })
        .catch(error => {
            return res.status(500).json({
                message: 'Error al eliminar los registros.',
                error: error.message, // Envía un mensaje de error específico
            });
        })
}