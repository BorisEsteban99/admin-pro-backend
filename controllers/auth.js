const  { response } =require('express')
const Usuario =require('../models/usuarios')
const bcrypt=require('bcryptjs');
const { generarJWT } = require('../Helpers/jwt');

const login = async ( req, res = response) => {


    const {email, password} = req.body;

    try {

        //Verificar email

        const usuarioDB = await Usuario.findOne({ email });

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Email incorrecto'
            })
        }
        //Verificar contraseña

        const verificarContraseña = bcrypt.compareSync( password, usuarioDB.password);
        if (!verificarContraseña) {
            return res.status(400).json({
                ok: false,
                msg:'Password no valida'
            })
        }

        // Generar el token - JWT
        const token = await generarJWT(usuarioDB.id);

        res.json({
            ok: true,
            token
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg:'hable con el administrados'
        })
    }

}


module.exports = {
    login
}