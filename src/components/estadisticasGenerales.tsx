'use client'

import { Paper, Typography, Box } from '@mui/material'
import {
  Thermostat,
  Opacity,
  Groups,
  Circle,
} from '@mui/icons-material'

type Galpon = {
  estado: 'normal' | 'precaucion' | 'critico'
  temperatura: number
  humedad: number
  pollosVivos: number
  pollosFallecidos: number
}

type Props = {
  galpones: Galpon[]
}

export default function EstadisticasGenerales({ galpones }: Props) {
  const totalVivos = galpones.reduce((acc, g) => acc + g.pollosVivos, 0)
  const totalMuertos = galpones.reduce((acc, g) => acc + g.pollosFallecidos, 0)
  const temperaturaProm = galpones.reduce((acc, g) => acc + g.temperatura, 0) / galpones.length
  const humedadProm = galpones.reduce((acc, g) => acc + g.humedad, 0) / galpones.length

  const estados = galpones.map(g => g.estado)
  const estadoGeneral = estados.includes('critico')
    ? 'critico'
    : estados.includes('precaucion')
    ? 'precaucion'
    : 'normal'

  const estadoColor: Record<
    'normal' | 'precaucion' | 'critico',
    { label: string; color: 'success' | 'warning' | 'error' }
  > = {
    normal: { label: 'Normal', color: 'success' },
    precaucion: { label: 'Precaución', color: 'warning' },
    critico: { label: 'Crítico', color: 'error' },
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Paper className="p-4 flex flex-col gap-2">
        <Box className="flex justify-between items-center">
          <Typography variant="subtitle2">Estado General</Typography>
          <Circle fontSize="small" color={estadoColor[estadoGeneral].color} />
        </Box>
        <Typography variant="h6" className="font-bold capitalize">
          {estadoColor[estadoGeneral].label}
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          {estadoGeneral === 'critico'
            ? 'Acción inmediata requerida'
            : estadoGeneral === 'precaucion'
            ? 'Revisión recomendada'
            : 'Todo en condiciones normales'}
        </Typography>
      </Paper>

      <Paper className="p-4">
        <Box className="flex justify-between items-center">
          <Typography variant="subtitle2">Temperatura Promedio</Typography>
          <Thermostat fontSize="small" color="error" />
        </Box>
        <Typography variant="h6" className="font-bold">
          {temperaturaProm.toFixed(1)}°C
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          Dentro del rango óptimo
        </Typography>
      </Paper>

      <Paper className="p-4">
        <Box className="flex justify-between items-center">
          <Typography variant="subtitle2">Humedad Promedio</Typography>
          <Opacity fontSize="small" color="primary" />
        </Box>
        <Typography variant="h6" className="font-bold">
          {humedadProm.toFixed(1)}%
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          Dentro del rango óptimo
        </Typography>
      </Paper>

      <Paper className="p-4">
        <Box className="flex justify-between items-center">
          <Typography variant="subtitle2">Población Total</Typography>
          <Groups fontSize="small" />
        </Box>
        <Typography variant="h6" className="font-bold">
          {totalVivos.toLocaleString()}
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          {totalMuertos} fallecidos ({((totalMuertos / (totalMuertos + totalVivos)) * 100).toFixed(2)}%)
        </Typography>
      </Paper>
    </div>
  )
}
