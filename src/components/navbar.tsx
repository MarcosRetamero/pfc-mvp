'use client'
import {
  AppBar, Toolbar, Typography, Button, Menu, MenuItem
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleNavegar = (ruta: string) => {
    handleMenuClose();
    router.push(ruta);
  };

  return (
    <AppBar position="static" className="bg-blue-600">
      <Toolbar className="flex justify-between">
        <Typography variant="h6" component="div">
          Avito
        </Typography>
        <div className="flex gap-4 mx-4">
          <Button color="inherit" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => router.push("/camadas")}>
            Camadas
          </Button>
          <Button color="inherit" onClick={() => router.push("/alertas/alimentacion")}>
            Alertas
          </Button>
          <Button color="inherit" onClick={handleMenuClick}>
            Más Opciones
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleNavegar("/alimentacion")}>Alimento</MenuItem>
            <MenuItem onClick={() => handleNavegar("/visitasVeterinarias")}>Visitas veterinarias</MenuItem>
            <MenuItem onClick={() => handleNavegar("/incidencias")}>Incidencias</MenuItem>

          </Menu>
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
