// src/app/camadas/[camadaId]/informe/MockInformeCamadaPage.tsx
"use client";

import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import SummaryCards from "./SummaryCards";
import GalponReportTable from "./GalponReportTable";

const mockSummary = {
  camadaId: 1,
  fechaIngreso: "2025-05-01",
  fechaSalida: null,
  pollosRecibidos: 12000,
  pollosActuales: 11640,
  alimentoConsumido: 14500,
  ultimoPesoPromedio: 2.35,
  tasaEngorde: 3.2,
  tempPromedio: 27.8,
  humedadPromedio: 58.4,
  visitasVet: 2,
  incidencias: 1,
  tasaCrecimiento: 0.084,
};

const mockDetallePorGalpon = {
  1: [
    {
      id: "1-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 4000,
      avesFallecidas: 10,
      alimento: 500,
      pesoProm: 0.35,
      tasaCrec: 0.35,
      tasaEngorde: 1.42,
      temp: 26.5,
      humedad: 55.2,
    },
    {
      id: "1-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 3985,
      avesFallecidas: 15,
      alimento: 520,
      pesoProm: 0.70,
      tasaCrec: 0.35,
      tasaEngorde: 1.49,
      temp: 27.1,
      humedad: 56.1,
    },
  ],
  2: [
    {
      id: "2-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 4000,
      avesFallecidas: 5,
      alimento: 490,
      pesoProm: 0.36,
      tasaCrec: 0.36,
      tasaEngorde: 1.36,
      temp: 28.0,
      humedad: 59.9,
    },
    {
      id: "2-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 3990,
      avesFallecidas: 10,
      alimento: 515,
      pesoProm: 0.72,
      tasaCrec: 0.36,
      tasaEngorde: 1.43,
      temp: 28.2,
      humedad: 60.2,
    },
  ],
  3: [
    {
      id: "3-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 4000,
      avesFallecidas: 7,
      alimento: 505,
      pesoProm: 0.34,
      tasaCrec: 0.34,
      tasaEngorde: 1.48,
      temp: 29.1,
      humedad: 60.8,
    },
    {
      id: "3-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 3990,
      avesFallecidas: 10,
      alimento: 510,
      pesoProm: 0.69,
      tasaCrec: 0.35,
      tasaEngorde: 1.46,
      temp: 29.0,
      humedad: 60.5,
    },
  ],
};

const mockGalpones = [
  { galponId: 1, nombre: "Galpón Sur" },
  { galponId: 2, nombre: "Galpón Centro" },
  { galponId: 3, nombre: "Galpón Norte" },
];

export default function MockInformeCamadaPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Informe de camada (Mock)
      </Typography>

      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Grid item>
          <Button onClick={() => history.back()}>← Volver</Button>
        </Grid>
      </Grid>

      <SummaryCards data={mockSummary} />

      {mockGalpones.map((gp) => (
        <Box key={gp.galponId} sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {gp.nombre}
          </Typography>
          <GalponReportTable
            galpon={gp}
            registros={mockDetallePorGalpon[gp.galponId]}
          />
        </Box>
      ))}

      <Grid
        container
        justifyContent="flex-end"
        alignItems="center"
        sx={{ mt: 4 }}
      >
        <Button sx={{ mr: 1 }} variant="outlined">
          Exportar CSV
        </Button>
        <Button variant="contained" color="primary">
          Enviar al proveedor
        </Button>
      </Grid>
    </Box>
  );
}
