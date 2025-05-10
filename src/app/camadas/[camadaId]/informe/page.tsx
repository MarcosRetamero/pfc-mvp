"use client";

import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import SummaryCards from "./SummaryCards";
import GalponReportTable from "./GalponReportTable";

const mockDetallePorGalpon = {
  1: [
    {
      id: "1-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 12000,
      avesFallecidas: 0,
      alimento: 94.3,
      pesoProm: 0.04,
      tasaCrec: 0.04,
      tasaEngorde: 0,
      temp: 30,
      humedad: 65,
    },
    {
      id: "1-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 11985,
      avesFallecidas: 25,
      alimento: 94.3,
      pesoProm: 0.09,
      tasaCrec: 0.05,
      tasaEngorde: 2.5,
      temp: 29,
      humedad: 68,
    },
    {
      id: "1-2025-05-03",
      fecha: "2025-05-03",
      avesVivas: 11970,
      avesFallecidas: 20,
      alimento: 94.3,
      pesoProm: 0.15,
      tasaCrec: 0.06,
      tasaEngorde: 2.8,
      temp: 28,
      humedad: 70,
    },
    {
      id: "1-2025-05-04",
      fecha: "2025-05-04",
      avesVivas: 11955,
      avesFallecidas: 27,
      alimento: 94.3,
      pesoProm: 0.22,
      tasaCrec: 0.07,
      tasaEngorde: 2.9,
      temp: 27,
      humedad: 72,
    },
    {
      id: "1-2025-05-05",
      fecha: "2025-05-05",
      avesVivas: 11940,
      avesFallecidas: 10,
      alimento: 94.3,
      pesoProm: 0.30,
      tasaCrec: 0.08,
      tasaEngorde: 3.0,
      temp: 26,
      humedad: 74,
    },
    {
      id: "1-2025-05-06",
      fecha: "2025-05-06",
      avesVivas: 11925,
      avesFallecidas: 15,
      alimento: 94.3,
      pesoProm: 0.39,
      tasaCrec: 0.09,
      tasaEngorde: 3.1,
      temp: 25,
      humedad: 75,
    },
    {
      id: "1-2025-05-07",
      fecha: "2025-05-07",
      avesVivas: 11910,
      avesFallecidas: 7,
      alimento: 94.3,
      pesoProm: 0.49,
      tasaCrec: 0.10,
      tasaEngorde: 3.2,
      temp: 24,
      humedad: 76,
    },
  ],
  2: [
    {
      id: "2-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 10000,
      avesFallecidas: 0,
      alimento: 82.5,
      pesoProm: 0.042,
      tasaCrec: 0.042,
      tasaEngorde: 0,
      temp: 29.5,
      humedad: 66,
    },
    {
      id: "2-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 9987,
      avesFallecidas: 35,
      alimento: 82.5,
      pesoProm: 0.092,
      tasaCrec: 0.050,
      tasaEngorde: 2.48,
      temp: 28.6,
      humedad: 67,
    },
    {
      id: "2-2025-05-03",
      fecha: "2025-05-03",
      avesVivas: 9975,
      avesFallecidas: 12,
      alimento: 82.5,
      pesoProm: 0.151,
      tasaCrec: 0.059,
      tasaEngorde: 2.79,
      temp: 27.9,
      humedad: 69,
    },
    {
      id: "2-2025-05-04",
      fecha: "2025-05-04",
      avesVivas: 9962,
      avesFallecidas: 3,
      alimento: 82.5,
      pesoProm: 0.221,
      tasaCrec: 0.070,
      tasaEngorde: 2.85,
      temp: 26.8,
      humedad: 71,
    },
    {
      id: "2-2025-05-05",
      fecha: "2025-05-05",
      avesVivas: 9950,
      avesFallecidas: 12,
      alimento: 82.5,
      pesoProm: 0.302,
      tasaCrec: 0.081,
      tasaEngorde: 2.97,
      temp: 25.9,
      humedad: 73,
    },
    {
      id: "2-2025-05-06",
      fecha: "2025-05-06",
      avesVivas: 9935,
      avesFallecidas: 1,
      alimento: 82.5,
      pesoProm: 0.395,
      tasaCrec: 0.093,
      tasaEngorde: 3.05,
      temp: 24.7,
      humedad: 74,
    },
    {
      id: "2-2025-05-07",
      fecha: "2025-05-07",
      avesVivas: 9920,
      avesFallecidas: 0,
      alimento: 82.5,
      pesoProm: 0.500,
      tasaCrec: 0.105,
      tasaEngorde: 3.15,
      temp: 23.8,
      humedad: 76,
    },
  ],
  
  3: [
    {
      id: "3-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 12000,
      avesFallecidas: 0,
      alimento: 81.0,
      pesoProm: 0.038,
      tasaCrec: 0.038,
      tasaEngorde: 0,
      temp: 28.9,
      humedad: 64,
    },
    {
      id: "3-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 11988,
      avesFallecidas: 43,
      alimento: 81.0,
      pesoProm: 0.085,
      tasaCrec: 0.047,
      tasaEngorde: 2.49,
      temp: 28.0,
      humedad: 65,
    },
    {
      id: "3-2025-05-03",
      fecha: "2025-05-03",
      avesVivas: 11976,
      avesFallecidas: 12,
      alimento: 81.0,
      pesoProm: 0.139,
      tasaCrec: 0.054,
      tasaEngorde: 2.78,
      temp: 27.2,
      humedad: 67,
    },
    {
      id: "3-2025-05-04",
      fecha: "2025-05-04",
      avesVivas: 11964,
      avesFallecidas: 13,
      alimento: 81.0,
      pesoProm: 0.204,
      tasaCrec: 0.065,
      tasaEngorde: 2.85,
      temp: 26.5,
      humedad: 69,
    },
    {
      id: "3-2025-05-05",
      fecha: "2025-05-05",
      avesVivas: 11951,
      avesFallecidas: 14,
      alimento: 81.0,
      pesoProm: 0.280,
      tasaCrec: 0.076,
      tasaEngorde: 2.97,
      temp: 25.6,
      humedad: 71,
    },
    {
      id: "3-2025-05-06",
      fecha: "2025-05-06",
      avesVivas: 11938,
      avesFallecidas: 3,
      alimento: 81.0,
      pesoProm: 0.365,
      tasaCrec: 0.085,
      tasaEngorde: 3.06,
      temp: 24.5,
      humedad: 73,
    },
    {
      id: "3-2025-05-07",
      fecha: "2025-05-07",
      avesVivas: 11925,
      avesFallecidas: 5,
      alimento: 81.0,
      pesoProm: 0.460,
      tasaCrec: 0.095,
      tasaEngorde: 3.15,
      temp: 23.9,
      humedad: 75,
    },
  ],
  
  4: [
    {
      id: "4-2025-05-01",
      fecha: "2025-05-01",
      avesVivas: 15000,
      avesFallecidas: 0,
      alimento: 118.0,
      pesoProm: 0.043,
      tasaCrec: 0.043,
      tasaEngorde: 0,
      temp: 30.5,
      humedad: 66,
    },
    {
      id: "4-2025-05-02",
      fecha: "2025-05-02",
      avesVivas: 14985,
      avesFallecidas: 23,
      alimento: 118.0,
      pesoProm: 0.095,
      tasaCrec: 0.052,
      tasaEngorde: 2.27,
      temp: 29.8,
      humedad: 67,
    },
    {
      id: "4-2025-05-03",
      fecha: "2025-05-03",
      avesVivas: 14970,
      avesFallecidas: 20,
      alimento: 118.0,
      pesoProm: 0.160,
      tasaCrec: 0.065,
      tasaEngorde: 2.68,
      temp: 29.0,
      humedad: 69,
    },
    {
      id: "4-2025-05-04",
      fecha: "2025-05-04",
      avesVivas: 14955,
      avesFallecidas: 15,
      alimento: 118.0,
      pesoProm: 0.235,
      tasaCrec: 0.075,
      tasaEngorde: 2.73,
      temp: 28.3,
      humedad: 71,
    },
    {
      id: "4-2025-05-05",
      fecha: "2025-05-05",
      avesVivas: 14940,
      avesFallecidas: 10,
      alimento: 118.0,
      pesoProm: 0.320,
      tasaCrec: 0.085,
      tasaEngorde: 2.78,
      temp: 27.4,
      humedad: 73,
    },
    {
      id: "4-2025-05-06",
      fecha: "2025-05-06",
      avesVivas: 14925,
      avesFallecidas: 10,
      alimento: 118.0,
      pesoProm: 0.415,
      tasaCrec: 0.095,
      tasaEngorde: 2.84,
      temp: 26.5,
      humedad: 74,
    },
    {
      id: "4-2025-05-07",
      fecha: "2025-05-07",
      avesVivas: 14910,
      avesFallecidas: 9,
      alimento: 118.0,
      pesoProm: 0.520,
      tasaCrec: 0.105,
      tasaEngorde: 2.90,
      temp: 25.7,
      humedad: 75,
    },
  ],
  
};

const mockGalpones = [
  { galponId: 1, nombre: "Galpón 1" },
  { galponId: 2, nombre: "Galpón 2" },
  { galponId: 3, nombre: "Galpón 3" },
  { galponId: 4, nombre: "Galpón 4" },
];
function calcularResumenCamada(detallePorGalpon: typeof mockDetallePorGalpon) {
  let pollosRecibidos = 0;
  let pollosActuales = 0;
  let alimentoTotal = 0;
  let ultimoPesos: number[] = [];
  let tasasCrecimiento: number[] = [];
  let tasasEngorde: number[] = [];
  let temperaturas: number[] = [];
  let humedades: number[] = [];

  for (const registros of Object.values(detallePorGalpon)) {
    if (registros.length === 0) continue;
    const avesFinales = registros[registros.length - 1].avesVivas;
    const totalMuertes = registros.reduce((sum, r) => sum + r.avesFallecidas, 0);
    const avesIniciales = avesFinales + totalMuertes;
    

    pollosRecibidos += avesIniciales;
    pollosActuales += avesFinales;
    alimentoTotal += registros.reduce((sum, r) => sum + r.alimento, 0);
    ultimoPesos.push(registros[registros.length - 1].pesoProm);
    tasasCrecimiento.push(
      registros.reduce((sum, r) => sum + r.tasaCrec, 0) / registros.length
    );
    tasasEngorde.push(
      registros
        .filter((r) => r.tasaEngorde > 0)
        .reduce((sum, r) => sum + r.tasaEngorde, 0) / (registros.length - 1)
    );
    temperaturas.push(...registros.map((r) => r.temp));
    humedades.push(...registros.map((r) => r.humedad));
  }

  return {
    camadaId: 1,
    fechaIngreso: "2025-05-01",
    fechaSalida: null,
    pollosRecibidos,
    pollosActuales,
    porcentajeMortandad: Number((((pollosRecibidos - pollosActuales) / pollosRecibidos) * 100).toFixed(2)),

    alimentoConsumido: Number(alimentoTotal.toFixed(1)),
    ultimoPesoPromedio: Number(
      (ultimoPesos.reduce((a, b) => a + b, 0) / ultimoPesos.length).toFixed(3)
    ),
    tasaEngorde: Number(
      (tasasEngorde.reduce((a, b) => a + b, 0) / tasasEngorde.length).toFixed(3)
    ),
    tempPromedio: Number(
      (temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length).toFixed(1)
    ),
    humedadPromedio: Number(
      (humedades.reduce((a, b) => a + b, 0) / humedades.length).toFixed(1)
    ),
    visitasVet: 2, // hardcoded
    incidencias: 1, // hardcoded
    tasaCrecimiento: Number(
      (tasasCrecimiento.reduce((a, b) => a + b, 0) / tasasCrecimiento.length).toFixed(3)
    ),
  };
}

// ✅ Ejecutar función y obtener resumen
const mockSummary = calcularResumenCamada(mockDetallePorGalpon);

// 🔄 Página final
export default function InformeCamadaPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Informe de camada
      </Typography>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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

      <Grid container justifyContent="flex-end" alignItems="center" sx={{ mt: 4 }}>
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
