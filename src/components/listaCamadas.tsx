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

// --- Tipos basados en backend_nuevo.json ---
type Proveedor = {
  proveedorId: number;
  nombre: string;
  email: string;
};

type Camada = {
  camadaId: number;
  fechaIngreso: string;
  fechaSalida: string | null;
  proveedorId: number; // Cambiado de 'proveedor' a 'proveedorId'
};

type Galpon = {
  galponId: number;
  nombre: string;
  superficieM2: number;
  cantidadSecciones: number;
  capacidadMax: number;
  capacidadSiloKg: number;
  // 'camadaId' no está directamente en el objeto galpon en backend_nuevo.json
};

type CamadaGalpon = {
  camadaGalponId: number; // Cambiado de 'registroId'
  galponId: number;
  camadaId: number;
  cantidadInicial: number;
};
// --- Fin Tipos ---

export default function ListaCamadas() {
  const router = useRouter()
  const [camadas, setCamadas] = useState<Camada[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([]) // Añadido para buscar nombres
  const [galpones, setGalpones] = useState<Galpon[]>([])
  const [camadaGalpon, setCamadaGalpon] = useState<CamadaGalpon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0) // 0 for active, 1 for all

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        // Cambiado a backend_nuevo.json
        const res = await fetch('/backend_nuevo.json')
        if (!res.ok) {
          throw new Error(`Error al cargar datos: ${res.statusText}`);
        }
        const data = await res.json()

        // Validar que los datos esperados existan y sean arrays
        if (!Array.isArray(data.camada)) throw new Error("Formato inválido: 'camada' no es un array.");
        if (!Array.isArray(data.proveedor)) throw new Error("Formato inválido: 'proveedor' no es un array.");
        if (!Array.isArray(data.galpon)) throw new Error("Formato inválido: 'galpon' no es un array.");
        if (!Array.isArray(data.camadaGalpon)) throw new Error("Formato inválido: 'camadaGalpon' no es un array.");

        setCamadas(data.camada)
        setProveedores(data.proveedor)
        setGalpones(data.galpon)
        setCamadaGalpon(data.camadaGalpon)

      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos. Intente nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Función para formatear la fecha
  const formatearFecha = (fechaStr: string | null): string => {
    if (!fechaStr) return '-';
    try {
        const fecha = new Date(fechaStr);
        // Verificar si la fecha es válida
        if (isNaN(fecha.getTime())) {
            return 'Fecha inválida';
        }
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        console.error("Error formateando fecha:", fechaStr, e);
        return 'Error fecha';
    }
}


  // Función para determinar el estado de la camada
  const estadoCamada = (fechaSalida: string | null) => {
    return fechaSalida ? 'Finalizada' : 'Activa'
  }

  // Función para obtener el nombre del proveedor
  const obtenerNombreProveedor = (proveedorId: number): string => {
    const proveedor = proveedores.find(p => p.proveedorId === proveedorId);
    return proveedor ? proveedor.nombre : `ID ${proveedorId}`;
  }

  // Función para ver detalles de una camada
  const verDetalleCamada = (camadaId: number) => {
    router.push(`/camadas/${camadaId}`)
  }

  // Obtener galpones asociados a una camada a través de camadaGalpon
  const obtenerGalponesPorCamada = (camadaId: number): Galpon[] => {
    const galponIdsAsociados = camadaGalpon
      .filter(cg => cg.camadaId === camadaId)
      .map(cg => cg.galponId);

    // Filtrar la lista completa de galpones para obtener los objetos Galpon correspondientes
    return galpones.filter(g => galponIdsAsociados.includes(g.galponId));
  }

  // Obtener cantidad de aves por galpón y camada desde camadaGalpon
  const obtenerCantidadAves = (galponId: number, camadaId: number): number => {
    const registro = camadaGalpon.find(
      cg => cg.galponId === galponId && cg.camadaId === camadaId
    )
    return registro ? registro.cantidadInicial : 0
  }

  // Calcular total de aves por camada usando camadaGalpon
  const calcularTotalAvesPorCamada = (camadaId: number): number => {
    const registros = camadaGalpon.filter(cg => cg.camadaId === camadaId)
    return registros.reduce((total, registro) => total + registro.cantidadInicial, 0)
  }

  // Filtrar camadas activas (sin fecha de salida)
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
        <Typography color="error">Error al cargar datos: {error}</Typography>
      </Paper>
    )
  }

  // El botón de "Nueva Camada" ahora está en la página /camadas, no aquí.

  return (
    <Paper className="p-4">
      {/* El título y botón de nueva camada se manejan en la página */}
      {/* <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">Camadas Registradas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/camadas/nueva')}
        >
          Nueva Camada
        </Button>
      </Box> */}

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        className="mb-4"
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={`Activas (${camadasActivas.length})`} />
        <Tab label={`Todas (${camadas.length})`} />
      </Tabs>

      {camadasAMostrar.length === 0 ? (
        <Typography className="p-4 text-center text-gray-500">
          No hay camadas {tabValue === 0 ? "activas" : ""} para mostrar.
        </Typography>
      ) : (
        camadasAMostrar.map((camada) => (
          <Accordion key={camada.camadaId} className="mb-4 shadow-sm border border-gray-200 rounded-md">
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls={`panel-${camada.camadaId}-content`}
              id={`panel-${camada.camadaId}-header`}
              sx={{ backgroundColor: '#f9f9f9' }} // Fondo ligero para el resumen
            >
              <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pr-4 gap-2 sm:gap-4">
                {/* Info Principal */}
                <Box>
                    <Typography variant="subtitle1" className='text-black font-semibold'>
                    Camada #{camada.camadaId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                    Proveedor: {obtenerNombreProveedor(camada.proveedorId)}
                    </Typography>
                </Box>

                {/* Info Secundaria y Estado */}
                <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
                  <Chip
                    label={estadoCamada(camada.fechaSalida)}
                    color={camada.fechaSalida ? 'default' : 'success'}
                    size="small"
                    variant='outlined'
                  />
                  <Typography variant="body2" color="textSecondary">
                    Ingreso: {formatearFecha(camada.fechaIngreso)}
                  </Typography>
                  {camada.fechaSalida && (
                    <Typography variant="body2" color="textSecondary">
                      Salida: {formatearFecha(camada.fechaSalida)}
                    </Typography>
                  )}
                   <Typography variant="body2" className='font-medium text-black'>
                    Total: {calcularTotalAvesPorCamada(camada.camadaId).toLocaleString()} aves
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: '1px solid #eee', pt: 2 }}>
              {/* <Divider className="mb-3" /> */}
              <Typography variant="subtitle2" className="mb-2 font-medium text-black">
                Distribución por Galpones:
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small" aria-label={`distribucion-camada-${camada.camadaId}`}>
                  <TableHead sx={{ backgroundColor: '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Galpón</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cantidad Inicial</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {obtenerGalponesPorCamada(camada.camadaId).map((galpon) => (
                      <TableRow key={galpon.galponId} hover>
                        <TableCell>{galpon.nombre}</TableCell>
                        <TableCell align="right">
                          {obtenerCantidadAves(galpon.galponId, camada.camadaId).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Fila de Total */}
                    <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right">
                        <strong>{calcularTotalAvesPorCamada(camada.camadaId).toLocaleString()}</strong>
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
                  sx={{ textTransform: 'none' }}
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