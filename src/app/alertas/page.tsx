'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FormularioAlerta from '@/components/configurarAlerta'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Button
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

// Tipos
type Galpon = {
  galponId: number
  nombre: string
}

type NuevaAlertaData = {
  galponId: number | null
  variable: string
  valorMin: number
  valorMax: number
  canalNotificacion: string
  rolANotificar: string // CSV (Ej: "Operario,Gerente")
}

const Alertas = () => {
  const router = useRouter()
  const [galpones, setGalpones] = useState<Galpon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Cargar galpones desde JSON al montar
  useEffect(() => {
    const fetchGalpones = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/backend_nuevo.json')
        if (!res.ok) throw new Error("Error al obtener galpones")
        const data = await res.json()

        if (!data.galpon || !Array.isArray(data.galpon)) {
          throw new Error("No se encontró la lista de galpones en el JSON")
        }

        setGalpones(data.galpon)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Error desconocido")
        setGalpones([])
      } finally {
        setLoading(false)
      }
    }

    fetchGalpones()
  }, [])

  // Simulación del guardado de alerta
  const handleGuardarAlerta = (nuevaAlertaData: NuevaAlertaData) => {
    console.log("Simulando guardado de alerta (datos ya validados):", nuevaAlertaData)

    // Aquí iría el POST real al backend o update al JSON
    setSuccessMsg("Alerta registrada correctamente.")
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Botón de navegación */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/dashboard')}
        sx={{ mb: 2 }}
      >
        Volver al Dashboard
      </Button>

      <Typography variant="h4" gutterBottom className="text-black">
        Nueva Configuración de Alerta
      </Typography>

      <Paper elevation={3} sx={{ p: 8 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando datos de galpones...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : galpones.length === 0 ? (
          <Alert severity="warning">No se encontraron galpones disponibles para configurar alertas.</Alert>
        ) : (
          <FormularioAlerta
            galponesDisponibles={galpones}
            onGuardar={handleGuardarAlerta}
          />
        )}
      </Paper>

      {/* Feedback visual */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        message={successMsg}
      />
    </Box>
  )
}

export default Alertas
