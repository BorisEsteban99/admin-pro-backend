const {response} =require('express');
const bcrypt =require('bcryptjs')

const Usuario = require('../models/usuarios');
const { generarJWT } = require('../Helpers/jwt');



const getUsuario = async( req, res) => {

    const usuarios = await Usuario.find({}, 'nombre email role google ');

    res.json({
        ok: true, 
        usuarios
    });

}

const crearUsuarios = async ( req, res=response) => {

    console.log(req.body)

    const { email, password, nombre } = req.body;

    try {
        const existeEmail = await Usuario.findOne({email})

        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg:'El correo ya se encuentra registrado'
            });
        }
    
        
        const usuario = new Usuario(req.body);

        //encriptar contraseña
        const salt =bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt)
        
        //Guardar usuario
        await usuario.save();

        const token = await generarJWT(usuario.id);

        res.json({
            ok: true, 
            usuario,
            token
        });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'Error inesperado... revisar logs'
        })
        
    }

    
}

const actualizarUsuario = async ( req , res = response) =>{

    //TODO: Validar Token y comprobar si es el usuario correcto

    const uid = req.params.id;
    
    

    try {

        const usuarioDB = await Usuario.findById(uid);

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario por ese id'
            })
        }

        //Actualizacion 
        const {password, google, email,  ...campos} = req.body;


        if (usuarioDB.email !== email) {
  
            const existeEmail = await Usuario.findOne({email})

            if (existeEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'ya existe un usuario con ese email'
                })
            }

        }

        campos.email = email;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, {new: true})

        res.json({
            ok: true,
            usuario: usuarioActualizado
        })

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg:'Error inesperado'
        }); 
    }

}



const borrarUsuario = async (req , res = response) => {

    const uid = req.params.id;

    try {

        const usuarioDB= await Usuario.findById(uid)


        if (!usuarioDB) {
            return res.status(404).json({
                ok:false,
                msg: 'No existe un usuario por ese id'
            });

        }

        await Usuario.findByIdAndDelete(uid);

        res.json({
            ok:true,
            msg:'Usuario borrado'
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
        ok: false,
        msg: 'hable con el administrador'
    })
    }
    
}



 
module.exports = {
    getUsuario,
    crearUsuarios,
    actualizarUsuario,
    borrarUsuario
}


// const usuarioDB= await Usuario.findById(uid)


        // if (!usuarioDB) {
        //     return res.status(404).json({
        //         ok:false,
        //         msg: 'No existe un usuario por ese id'
        //     });

        // }

        // // Actualizaciones
        // const campos =req.body;

        // if (usuarioDB === req.body.email) {
        //     delete campos.email

        // }else{
        //     const existeEmail = await Usuario.findOne({ email: req.body.email})
        //     if (existeEmail) {
        //         return res.status(400).json({
        //             ok: false,
        //             msg: 'ya existe un usuario con ese email'
        //         })
        //     }
        // }

        // delete campos.password;
        // delete campos.google;

        // const usuarioActualizado = await Usuario.findByIdAndUpdate(uid, campos, {new: true});


        // res.json({
        //     ok: true,
        //     usuario: usuarioActualizado
        // })