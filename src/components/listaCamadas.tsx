'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tabs,
  Tab,
} from '@mui/material'
import { Visibility, ExpandMore } from '@mui/icons-material'

type Camada = {
  camadaId: number
  fechaIngreso: string
  fechaSalida: string | null
  proveedor: string
}

type Galpon = {
  galponId: number
  nombre: string
  camadaId: number
}

type CamadaGalpon = {
  registroId: number
  galponId: number
  camadaId: number
  cantidadInicial: number
}

export default function ListaCamadas() {
  const router = useRouter()
  const [camadas, setCamadas] = useState<Camada[]>([])
  const [galpones, setGalpones] = useState<Galpon[]>([])
  const [camadaGalpon, setCamadaGalpon] = useState<CamadaGalpon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0) // 0 for active, 1 for all

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const res = await fetch('/backend.json')
        const data = await res.json()
        setCamadas(data.camadas || [])
        setGalpones(data.galpones || [])
        setCamadaGalpon(data.camadaGalpon || [])
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError('No se pudieron cargar los datos. Intente nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Función para formatear la fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Función para determinar el estado de la camada
  const estadoCamada = (fechaSalida: string | null) => {
    return fechaSalida ? 'Finalizada' : 'Activa'
  }

  // Función para ver detalles de una camada
  const verDetalleCamada = (camadaId: number) => {
    router.push(`/camadas/${camadaId}`)
  }

  // Obtener galpones por camada
  const obtenerGalponesPorCamada = (camadaId: number) => {
    // Get all galpones that have this camadaId
    const galponesDirectos = galpones.filter(galpon => galpon.camadaId === camadaId);
    
    // Also check camadaGalpon to find all galpon IDs associated with this camada
    const galponIdsFromRelation = camadaGalpon
      .filter(cg => cg.camadaId === camadaId)
      .map(cg => cg.galponId);
    
    // Find galpones that match these IDs but aren't already in galponesDirectos
    const galponesFromRelation = galpones.filter(
      galpon => galponIdsFromRelation.includes(galpon.galponId) && 
                !galponesDirectos.some(g => g.galponId === galpon.galponId)
    );
    
    // Combine both sets of galpones
    return [...galponesDirectos, ...galponesFromRelation];
  }

  // Obtener cantidad de aves por galpón y camada
  const obtenerCantidadAves = (galponId: number, camadaId: number) => {
    const registro = camadaGalpon.find(
      cg => cg.galponId === galponId && cg.camadaId === camadaId
    )
    return registro ? registro.cantidadInicial : 0
  }

  // Calcular total de aves por camada
  const calcularTotalAvesPorCamada = (camadaId: number) => {
    const registros = camadaGalpon.filter(cg => cg.camadaId === camadaId)
    return registros.reduce((total, registro) => total + registro.cantidadInicial, 0)
  }

  // Filtrar camadas activas
  const camadasActivas = camadas.filter(camada => camada.fechaSalida === null)
  
  // Determinar qué camadas mostrar según la pestaña seleccionada
  const camadasAMostrar = tabValue === 0 ? camadasActivas : camadas
  
  // Manejar cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Paper className="p-4">
        <Typography color="error">{error}</Typography>
      </Paper>
    )
  }

  if (camadas.length === 0) {
    return (
      <Paper className="p-6">
        <Typography variant="h6" className="mb-4">No hay camadas registradas</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => router.push('/camadas/nueva')}
        >
          Registrar Nueva Camada
        </Button>
      </Paper>
    )
  }

  return (
    <Paper className="p-4">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">Camadas Registradas</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => router.push('/camadas/nueva')}
        >
          Nueva Camada
        </Button>
      </Box>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        className="mb-4"
        variant="fullWidth"
      >
        <Tab label={`Activas (${camadasActivas.length})`} />
        <Tab label={`Todas (${camadas.length})`} />
      </Tabs>

      {camadasAMostrar.length === 0 ? (
        <Typography className="p-4 text-center">
          No hay camadas {tabValue === 0 ? "activas" : ""} para mostrar
        </Typography>
      ) : (
        camadasAMostrar.map((camada) => (
          <Accordion key={camada.camadaId} className="mb-4">
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls={`panel-${camada.camadaId}-content`}
              id={`panel-${camada.camadaId}-header`}
            >
              <Box className="flex justify-between items-center w-full pr-4">
                <Typography variant="subtitle1">
                  Camada #{camada.camadaId} - {camada.proveedor}
                </Typography>
                <Box className="flex items-center gap-4">
                  <Chip 
                    label={estadoCamada(camada.fechaSalida)}
                    color={camada.fechaSalida ? 'default' : 'success'}
                    size="small"
                  />
                  <Typography variant="body2">
                    Ingreso: {formatearFecha(camada.fechaIngreso)}
                  </Typography>
                  {camada.fechaSalida && (
                    <Typography variant="body2">
                      Salida: {formatearFecha(camada.fechaSalida)}
                    </Typography>
                  )}
                  <Typography variant="body2" fontWeight="bold">
                    Total: {calcularTotalAvesPorCamada(camada.camadaId)} aves
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Divider className="mb-3" />
              <Typography variant="subtitle2" className="mb-2">
                Distribución por Galpones:
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Galpón</TableCell>
                      <TableCell align="right">Cantidad de Aves</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {obtenerGalponesPorCamada(camada.camadaId).map((galpon) => (
                      <TableRow key={galpon.galponId}>
                        <TableCell>{galpon.nombre}</TableCell>
                        <TableCell align="right">
                          {obtenerCantidadAves(galpon.galponId, camada.camadaId)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right">
                        <strong>{calcularTotalAvesPorCamada(camada.camadaId)}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box className="flex justify-end mt-3">
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  size="small"
                  onClick={() => verDetalleCamada(camada.camadaId)}
                >
                  Ver Detalles
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  )
}