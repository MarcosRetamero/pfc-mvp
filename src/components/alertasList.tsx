'use client'

import { Box, Typography, Chip, Paper } from '@mui/material'

// Tipo Alerta (según backend.json)
type Alerta = {
  alertaId: number
  seccionId: number
  tipo: 'normal' | 'precaucion' | 'critico'
  descripcion: string
  fechaHora: string
  resuelta: boolean
  resolucion: string
}

// Tipo Galpon enriquecido (solo para esta vista)
type Galpon = {
  galponId: number
  nombre: string
  alertas: Alerta[]
}

type Props = {
  galpones: Galpon[]
}

export default function AlertasList({ galpones }: Props) {
  const galponesConAlertas = galpones.filter((g) => g.alertas.length > 0)

  return (
    <div className="space-y-4">
      {galponesConAlertas.length === 0 ? (
        <Typography variant="body1" className="text-gray-500">
          No hay alertas activas.
        </Typography>
      ) : (
        galponesConAlertas.map((galpon) => (
          <Paper key={galpon.galponId} className="p-4">
            <Typography variant="subtitle1" className="font-semibold mb-2">
              {galpon.nombre}
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {galpon.alertas.map((alerta) => (
                <Chip
                  key={alerta.alertaId}
                  label={alerta.descripcion}
                  variant="outlined"
                  size="small"
                  color={
                    alerta.tipo === 'critico'
                      ? 'error'
                      : alerta.tipo === 'precaucion'
                      ? 'warning'
                      : 'default'
                  }
                />
              ))}
            </Box>
          </Paper>
        ))
      )}
    </div>
  )
}
