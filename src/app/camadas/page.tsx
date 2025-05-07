// app/camadas/alertas/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormularioAlerta from '@/components/configurarAlerta' //D:\Repositorios\pfc-mvp\src\components\configurarAlerta.tsx
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

type GalponInfo = { galponId: number; nombre: string }

export default function AlertasPage() {
  const router = useRouter()
  const [galpones, setGalpones]     = useState<GalponInfo[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const res = await fetch('/backend_nuevo.json')
        if (!res.ok) throw new Error('No se pudieron cargar los galpones')
        const data = await res.json()
        setGalpones(Array.isArray(data.galpon) ? data.galpon : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleGuardar = (alertaData: any) => {
    console.log('Alerta creada:', alertaData)
    // aquí podrías hacer un POST real...
    setSuccessMsg('Alerta registrada correctamente')
  }

  return (
    <Container maxWidth="md" sx={{ pt: 3, pb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard')}
        >
          Volver al dashboard
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Nueva Configuración de Alerta
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 1 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 120
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando galpones...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <FormularioAlerta
            galponesDisponibles={galpones}
            onGuardar={handleGuardar}
            onCancel={() => router.push('/dashboard')}
          />
        )}
      </Paper>

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg(null)}
          sx={{ mt: 2 }}
        >
          {successMsg}
        </Alert>
      )}
    </Container>
  )
}
