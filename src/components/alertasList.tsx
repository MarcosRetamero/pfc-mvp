import React from 'react';
import {
  Typography, Box, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";

// Mock de alertas según estructura real de la tabla alerta
const alertasMockeadas = [
  {
    alertaId: 1,
    nombreGalpon: "Galpón 1",
    descripcion: "Temperatura excesiva detectada: 32°C",
    fechaHora: "2024-05-12T15:30:00",
    resuelta: true,
  },
  {
    alertaId: 2,
    nombreGalpon: "Galpón 2",
    descripcion: "Humedad alta detectada: 90%",
    fechaHora: "2024-05-12T13:10:00",
    resuelta: true,
  },
  {
    alertaId: 3,
    nombreGalpon: "Galpón 3",
    descripcion: "Ventilador encendido más de 3hs",
    fechaHora: "2024-05-11T20:15:00",
    resuelta: false,
  },

    {
    alertaId: 4,
    nombreGalpon: "Galpón 2",
    descripcion: "Mortandad excesiva: 8%",
    fechaHora: "2024-05-11T20:15:00",
    resuelta: false,
  },
];

const AlertasList: React.FC = () => {



  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold' }}>
          Alertas del sistema
        </Typography>
      </Box>

      <TableContainer>
        <Table aria-label="tabla-alertas">
          <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Galpón</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Fecha y hora</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'black' }} align="center">Resuelta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alertasMockeadas.map((alerta) => (
              <TableRow key={alerta.alertaId}>
                <TableCell>{alerta.nombreGalpon}</TableCell>
                <TableCell>{alerta.descripcion}</TableCell>
                <TableCell>{new Date(alerta.fechaHora).toLocaleString('es-AR')}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={alerta.resuelta ? "Sí" : "No"}
                    color={alerta.resuelta ? "success" : "error"}
                    size="small"
                    icon={alerta.resuelta ? <CheckCircle /> : <ErrorOutline />}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AlertasList;
