"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, Button, Typography, Paper, Box } from "@mui/material";
import Image from "next/image";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  interface Usuario {
    usuarioId: number;
    nombreUsuario: string;
    password: string;
    email: string;
    rolId: number;
    activo: boolean;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/backend.json");
    const data = await res.json();
    const user = data.usuarios.find(
      (u: Usuario) => u.nombreUsuario === usuario && u.password === password
    );

    if (user) {
      localStorage.setItem("usuario", JSON.stringify(user));
      router.push("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Paper elevation={3} className="p-6 w-full max-w-sm">
        <Box className="flex justify-center mb-4">
          <Image
            src="/logo-Photoroom.png"
            alt="Logo"
            width={200}
            height={200}
            priority
          />
        </Box>
        <Typography variant="h5" className="mb-4 text-center">
          Iniciar sesión
        </Typography>
        <form onSubmit={handleLogin} className="py-4">
          <div className="mb-4">
            <TextField
              fullWidth
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <TextField
              fullWidth
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button type="submit" variant="contained" fullWidth>
            Ingresar
          </Button>
        </form>
      </Paper>
    </div>
  );
}
