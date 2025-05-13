'use client'

import React from 'react'
import { Stack, Paper, Typography } from '@mui/material'

/**
 * Shape of the summary object passed in from page.tsx
 */
export interface Summary {
  camadaId: number
  fechaIngreso: string
  fechaSalida: string | null
  pollosRecibidos: number
  pollosActuales: number
  porcentajeMortandad: number
  alimentoConsumido: number
  ultimoPesoPromedio: number
  tasaEngorde: number
  tempPromedio: number
  humedadPromedio: number
  visitasVet: number
  incidencias: number
  tasaCrecimiento: number
}

interface SummaryCardsProps {
  data: Summary
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const cards = [
    { label: 'Camada #',            value: data.camadaId },
    { label: 'Fecha Desde',         value: data.fechaIngreso },
    { label: 'Fecha Hasta',         value: data.fechaSalida ?? '—' },
    { label: 'Pollos recibidos',    value: data.pollosRecibidos },
    { label: 'Pollos actualmente',  value: data.pollosActuales },
    { label: 'Mortandad (%)',       value: `${data.porcentajeMortandad.toFixed(2)}%` },
    { label: 'Temp. prom. (°C)',    value: data.tempPromedio.toFixed(1) },
    { label: 'Hum. prom. (%)',      value: data.humedadPromedio.toFixed(1) },
    { label: 'Peso prom. (kg)',     value: data.ultimoPesoPromedio.toFixed(2) },
    { label: 'Alimento (kg)',       value: data.alimentoConsumido.toFixed(1) },
    { label: 'Tasa engorde',        value: data.tasaEngorde.toFixed(2) },
    { label: 'Tasa crecimiento',    value: data.tasaCrecimiento.toFixed(3) },
    { label: 'Visitas vet.',        value: data.visitasVet },
    { label: 'Incidencias',         value: data.incidencias },
  ]

  return (
    <Stack
      direction="row"
      spacing={2}
      flexWrap="wrap"
      sx={{ '& > *': { flex: '1 1 200px', minWidth: 160 } }}
    >
      {cards.map(({ label, value }) => (
        <Paper key={label} sx={{ p: 2, textAlign: 'center' }} elevation={2}>
          <Typography variant="subtitle2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6">
            {value}
          </Typography>
        </Paper>
      ))}
    </Stack>
  )
}
