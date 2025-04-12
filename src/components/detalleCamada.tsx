'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

type Camada = {
  camadaId: number
  fechaIngreso: string
  fechaSalida: string | null
  proveedor: string
}

type CamadaGalpon = {
  registroId: number
  galponId: number
  camadaId: number
  cantidadInicial: number
}

type Galpon = {
  galponId: number
  nombre: string
  capacidad: number
}

export default function DetalleCamadaClient({ id }: { id: string }) {
  const router = useRouter()
  const camadaId = parseInt(id)
  
  const [camada, setCamada] = useState<Camada | null>(null)
  const [distribucion, setDistribucion] = useState<CamadaGalpon[]>([])
  const [galpones, setGalpones] = useState<Galpon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const res = await fetch('/backend.json')
        const data = await res.json()
        
        // Buscar la camada por ID
        const camadaEncontrada = data.camadas.find((c: Camada) => c.camadaId === camadaId)
        if (!camadaEncontrada) {
          setError('Camada no encontrada')
          return
        }
        
        setCamada(camadaEncontrada)
        
        // Obtener distribución por galpón
        const distribucionCamada = data.camadaGalpon.filter(
          (cg: CamadaGalpon) => cg.camadaId === camadaId
        )
        setDistribucion(distribucionCamada)
        
        // Cargar información de galpones
        setGalpones(data.galpones || [])
      } catch (err) {
        console.error('Error al cargar datos de la camada:', err)
        setError('No se pudieron cargar los datos de la camada')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [camadaId])

  // Función para formatear la fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Función para obtener el nombre del galpón
  const obtenerNombreGalpon = (galponId: number) => {
    const galpon = galpones.find(g => g.galponId === galponId)
    return galpon ? galpon.nombre : `Galpón ${galponId}`
  }

  // Calcular total de aves
  const totalAves = distribucion.reduce((total, d) => total + d.cantidadInicial, 0)

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !camada) {
    return (
      <Paper className="p-4">
        <Typography color="error">{error || 'No se encontró la camada'}</Typography>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.push('/camadas')}
          className="mt-4"
        >
          Volver a Camadas
        </Button>
      </Paper>
    )
  }

  return (
    <div className="p-6">
      <Box className="mb-6 flex flex-col ">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => router.push('/camadas')}
          className="mr-4 self-start"
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1" className="text-black">
          Detalle de Camada #{camada.camadaId}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Información general */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Información General
              </Typography>
              
              <Box className="space-y-3">
                <Box className="flex justify-between">
                  <Typography variant="body1" color="textSecondary">
                    Estado:
                  </Typography>
                  <Chip 
                    label={camada.fechaSalida ? 'Finalizada' : 'Activa'}
                    color={camada.fechaSalida ? 'default' : 'success'}
                  />
                </Box>
                
                <Box className="flex justify-between">
                  <Typography variant="body1" color="textSecondary">
                    Fecha de Ingreso:
                  </Typography>
                  <Typography variant="body1">
                    {formatearFecha(camada.fechaIngreso)}
                  </Typography>
                </Box>
                
                {camada.fechaSalida && (
                  <Box className="flex justify-between">
                    <Typography variant="body1" color="textSecondary">
                      Fecha de Salida:
                    </Typography>
                    <Typography variant="body1">
                      {formatearFecha(camada.fechaSalida)}
                    </Typography>
                  </Box>
                )}
                
                <Box className="flex justify-between">
                  <Typography variant="body1" color="textSecondary">
                    Proveedor:
                  </Typography>
                  <Typography variant="body1">
                    {camada.proveedor}
                  </Typography>
                </Box>
                
                <Box className="flex justify-between">
                  <Typography variant="body1" color="textSecondary">
                    Total de Aves:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {totalAves}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por galpón */}
        <Grid component="div" item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Distribución por Galpón
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Galpón</TableCell>
                      <TableCell align="right">Cantidad Inicial</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distribucion.map((d) => (
                      <TableRow key={d.registroId}>
                        <TableCell>{obtenerNombreGalpon(d.galponId)}</TableCell>
                        <TableCell align="right">{d.cantidadInicial}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{totalAves}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}