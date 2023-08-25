import usuarios from "../models/usuarios.js";
import bcrypt from "bcryptjs";
import { crearToken } from "../lib/jwt.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../config.js";

export const register = async (req, res) => {
  const { nombre, password, rol } = req.body;
  const nombreUser = await usuarios.findOne({ nombre });

  if (nombreUser) return res.status(400).json(["El correo ya existe"]);

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new usuarios({
      nombre,
      rol,
      password: passwordHash,
    });

    await newUser.save();

    const token = await crearToken({
      idUser: newUser._id,
      rol: newUser.rol,
      nombre: newUser.nombre,
    });
    console.log(token);
    res.cookie("token", token);

    res
      .status(200)
      .json({
        id: newUser._id,
        nombre: newUser.nombre,
        rol: newUser.rol,
        token: token,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  console.log("hola mani");
  const { nombre, password } = req.body;
  try {
    console.log(req.body);
    const nombreUser = await usuarios.findOne({ nombre });
    if (!nombreUser) return res.status(400).json("Usuario no encontrado");

    const passwordUser = await bcrypt.compare(password, nombreUser.password);
    if (!passwordUser) return res.status(400).json("Contraseña incorrecta");

    const token = await crearToken({
      idUser: nombreUser._id,
      rol: nombreUser.rol,
      nombre: nombreUser.nombre,
    });
    console.log(token);
    res.cookie("token", token);

    res
      .status(200)
      .json({
        id: nombreUser._id,
        nombre: nombreUser.nombre,
        rol: nombreUser.rol,
        token: token,
      });
  } catch (error) {
    res.status(500);
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  try {
    const user = await usuarios.findById(req.user.idUser);
    console.log(user);
    if (!user) return res.status(404).json("Usuario no encontrado");
    return res.json({ id: user._id, nombre: user.nombre, rol: user.rol });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verificarToken = (req, res) => {
  const  token  = req.cookies.token;
  if (!token) return res.status(401).json({ message: "no autorizado" });
  jwt.verify(token, SECRET, async (error, user) => {
    if (error) return res.status(401).json({ message: "no autorizado" });
    const userLogin = await usuarios.findById(user.idUser);
    if (!userLogin) return res.status(404).json({ message: "no autorizado" });
    return res.json({
      id: userLogin._id,
      nombre: userLogin.nombre,
      email: userLogin.email,
      rol: userLogin.rol,
    });
  });
};
