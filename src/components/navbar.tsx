"use client";

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const parsed = JSON.parse(usuario);
      setNombreUsuario(parsed.nombreUsuario);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  return (
    <AppBar position="static" className="bg-blue-600">
      <Toolbar className="flex justify-between">
        <Typography variant="h6" component="div">
          Sistema Avícola
        </Typography>
        <div className="flex gap-4 mx-4">
          <Button color="inherit" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => router.push("/camadas")}>
            Camadas
          </Button>
          <Button color="inherit" onClick={() => router.push("/alimentacion")}>
            Alimentos
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Typography variant="body1" className="hidden sm:block">
            Usuario: {nombreUsuario}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}
