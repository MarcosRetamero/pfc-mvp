'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper
} from '@mui/material'
import { Add, Timeline } from '@mui/icons-material'
import ReposicionAlimentoForm from '@/components/reposicionAlimentoForm'
import HistorialAlimentacion from '@/components/historialAlimentacion'

export default function GestionAlimentacionPage() {
  const [reposiciones, setReposiciones] = useState<any[]>([])
  const [galpones, setGalpones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openReposicion, setOpenReposicion] = useState(false)
  const [openHistorial, setOpenHistorial] = useState(false)
  const [selectedGalponHistorial, setSelectedGalponHistorial] = useState<number | null>(null)
  
  const handleOpenHistorial = (galponId: number) => {
    setSelectedGalponHistorial(galponId)
    setOpenHistorial(true)
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch('/backend_nuevo.json')
        const data = await res.json()
        
        setGalpones(data.galpon)
        setReposiciones(data.reposicionAlimento || [])
      } catch (err) {
        setError('Error al cargar los datos de alimentación')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  const calcularConsumoEstimado = (galponId: number) => {
    const reposicionesGalpon = reposiciones
      .filter(r => r.galponId === galponId)
      .sort((a, b) => new Date(b.fechaReposicion).getTime() - new Date(a.fechaReposicion).getTime())
  
    if (reposicionesGalpon.length === 0) return null
  
    const ultimaReposicion = reposicionesGalpon[0]
    const diasTranscurridos = Math.floor(
      (new Date().getTime() - new Date(ultimaReposicion.fechaReposicion).getTime()) / (1000 * 60 * 60 * 24)
    )
  
    return {
      cantidadInicial: ultimaReposicion.cantidadKg,
      diasTranscurridos,
      consumoDiario: ultimaReposicion.cantidadKg / diasTranscurridos
    }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Gestión de Alimentación
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenReposicion(true)}
        >
          Nueva Reposición Total
        </Button>
      </Box>

      <Grid container spacing={3}>
        {galpones.map(galpon => {
          const consumoEstimado = calcularConsumoEstimado(galpon.galponId)

          return (
            <Grid item xs={12} md={6} key={galpon.galponId}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {galpon.nombre}
                  </Typography>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Capacidad del Silo</TableCell>
                          <TableCell align="right">{galpon.capacidadSiloKg} kg</TableCell>
                        </TableRow>
                        {consumoEstimado && (
                          <>
                            <TableRow>
                              <TableCell>Última Reposición</TableCell>
                              <TableCell align="right">{consumoEstimado.cantidadInicial} kg</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Días desde última reposición</TableCell>
                              <TableCell align="right">{consumoEstimado.diasTranscurridos} días</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Consumo diario estimado</TableCell>
                              <TableCell align="right">
                                {consumoEstimado.consumoDiario.toFixed(2)} kg/día
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Button
                    startIcon={<Timeline />}
                    sx={{ mt: 2 }}
                    fullWidth
                    variant="outlined"
                    onClick={() => handleOpenHistorial(galpon.galponId)}
                  >
                    Ver Historial
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Dialog 
        open={openReposicion} 
        onClose={() => setOpenReposicion(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Nueva Reposición Total de Alimento
          </Typography>
          <ReposicionAlimentoForm
            galpones={galpones}
            onSubmit={(data) => {
              console.log('Nueva reposición:', data)
              setOpenReposicion(false)
            }}
          />
        </Box>
      </Dialog>

      {selectedGalponHistorial && (
        <HistorialAlimentacion
          open={openHistorial}
          onClose={() => setOpenHistorial(false)}
          galpon={galpones.find(g => g.galponId === selectedGalponHistorial)}
          reposiciones={reposiciones}
          calcularConsumoEstimado={calcularConsumoEstimado}
        />
      )}
    </Box>
)
}