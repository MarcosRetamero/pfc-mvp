// src/app/camadas/[camadaId]/informe/SummaryCards.tsx
'use client'

import React from 'react'
import { Grid, Paper, Typography } from '@mui/material'

/**
 * Shape of the summary object passed in from page.tsx
 */
export interface Summary {
  camadaId: number
  fechaIngreso: string
  fechaSalida: string | null
  pollosRecibidos: number
  pollosActuales: number
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
    { label: 'Camada #',           value: data.camadaId },
    { label: 'Fecha Desde',        value: data.fechaIngreso },
    { label: 'Fecha Hasta',        value: data.fechaSalida ?? '—' },
    { label: 'Pollos recibidos',   value: data.pollosRecibidos },
    { label: 'Pollos actualmente', value: data.pollosActuales },
    { label: 'Temp. prom. (°C)',   value: data.tempPromedio.toFixed(1) },
    { label: 'Hum. prom. (%)',     value: data.humedadPromedio.toFixed(1) },
    { label: 'Peso prom. (kg)',    value: data.ultimoPesoPromedio.toFixed(2) },
    { label: 'Alimento (kg)',      value: data.alimentoConsumido.toFixed(1) },
    { label: 'Tasa engorde',       value: data.tasaEngorde.toFixed(2) },
    { label: 'Tasa crecimiento',   value: data.tasaCrecimiento.toFixed(3) },
    { label: 'Visitas vet.',       value: data.visitasVet },
    { label: 'Incidencias',        value: data.incidencias },
  ]

  return (
    <Grid container spacing={2}>
      {cards.map(({ label, value }) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={label}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="textSecondary">
              {label}
            </Typography>
            <Typography variant="h6">
              {value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}
