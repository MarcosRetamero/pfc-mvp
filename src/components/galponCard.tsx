"use client"

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material"
import { Thermostat, Opacity, ArrowForward } from "@mui/icons-material"

type Galpon = {
  id: string
  nombre: string
  temperatura: number
  humedad: number
  estado: "normal" | "precaucion" | "critico"
  pollosVivos: number
  pollosFallecidos: number
  alertas: { tipo: string; mensaje: string }[]
}

type Props = {
  galpon: Galpon
  onSelect: () => void
}

export default function GalponCard({ galpon, onSelect }: Props) {
  const estadoColor = {
    normal: "success",
    precaucion: "warning",
    critico: "error",
  }

  return (
    <Card className="h-full flex flex-col justify-between" sx={{borderRadius: 3}}>
      <CardContent>
        <Box className="flex justify-between items-center mb-2">
          <Typography variant="h6">{galpon.nombre}</Typography>
          <Box
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: `var(--mui-palette-${estadoColor[galpon.estado]}-main)`,
            }}
          />
        </Box>

        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-1">
            <Thermostat fontSize="small" color="error" />
            <Typography variant="body2">{galpon.temperatura}°C</Typography>
          </div>
          <div className="flex items-center gap-1">
            <Opacity fontSize="small" color="primary" />
            <Typography variant="body2">{galpon.humedad}%</Typography>
          </div>
        </div>

        <Box className="mb-2 text-sm">
          <Typography className="text-gray-500">Pollos vivos</Typography>
          <Typography>{galpon.pollosVivos}</Typography>
          <Typography className="text-gray-500 mt-2">Fallecidos</Typography>
          <Typography>{galpon.pollosFallecidos}</Typography>
        </Box>

        {galpon.alertas.length > 0 && (
          <Box className="mt-2 space-y-1">
            {galpon.alertas.map((alerta, idx) => (
              <Chip
                key={idx}
                label={alerta.mensaje}
                variant="outlined"
                size="small"
                color={
                  alerta.tipo === "critico"
                    ? "error"
                    : alerta.tipo === "precaucion"
                    ? "warning"
                    : "default"
                }
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button onClick={onSelect} size="small" endIcon={<ArrowForward />}>
          Ver detalles
        </Button>
      </CardActions>
    </Card>
  )
}
