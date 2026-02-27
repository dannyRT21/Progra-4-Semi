// services/user.service.js
import { db } from "../db/db.js";

export const userService = {

  async registrarUsuario({ usuario, clave, nombre }) {

    usuario = usuario.toLowerCase().trim();
    nombre = nombre.trim();

    if (!usuario || !clave || !nombre)
      return { ok: false, error: "Todos los campos son obligatorios." };

    if (clave.length < 6)
      return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(usuario))
      return { ok: false, error: "Correo electrónico inválido." };

    const existe = await db.usuarios.where("usuario").equals(usuario).first();
    if (existe)
      return { ok: false, error: "El usuario ya existe." };

    const hashClave = CryptoJS.SHA256(clave).toString();

    const registro = {
      usuario,
      clave: hashClave,
      nombre,
      hash: CryptoJS.SHA256(usuario + hashClave + nombre).toString()
    };

    await db.usuarios.add(registro);

    return { ok: true };
  },

  async login(usuario, clave) {

    usuario = usuario.toLowerCase().trim();
    const user = await db.usuarios.where("usuario").equals(usuario).first();

    if (!user)
      return { ok: false, error: "Credenciales inválidas." };

    const hashClave = CryptoJS.SHA256(clave).toString();

    if (hashClave !== user.clave)
      return { ok: false, error: "Credenciales inválidas." };

    localStorage.setItem("sessionUser", user.idUsuario);

    return { ok: true, user };
  },

  logout() {
    localStorage.removeItem("sessionUser");
  },

  async getUsuarioActual() {
    const id = localStorage.getItem("sessionUser");
    if (!id) return null;
    return await db.usuarios.get(Number(id));
  }

};