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
  Alert, // Añadir Alert para errores
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

type Proveedor = {
  proveedorId: number;
  nombre: string;
  email: string;
};

type Camada = {
  camadaId: number;
  fechaIngreso: string;
  fechaSalida: string | null;
  proveedorId: number; // Cambiado de proveedor: string
};

type CamadaGalpon = {
  camadaGalponId: number; // Cambiado de registroId
  galponId: number;
  camadaId: number;
  cantidadInicial: number;
};

type Galpon = {
  galponId: number;
  nombre: string;
  // Añadir otros campos si son necesarios para mostrar, pero nombre es el principal aquí
  capacidadMax?: number; // Opcional si quieres mostrarla
};
// --- Fin Tipos ---

export default function DetalleCamadaClient({ id }: { id: string }) {
  const router = useRouter()
  const camadaId = parseInt(id, 10); // Añadir radix 10

  const [camada, setCamada] = useState<Camada | null>(null)
  const [proveedor, setProveedor] = useState<Proveedor | null>(null); // Estado para el proveedor específico
  const [distribucion, setDistribucion] = useState<CamadaGalpon[]>([])
  const [galponesInfo, setGalponesInfo] = useState<Galpon[]>([]) // Estado para la info de todos los galpones
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validar que el ID sea un número válido
    if (isNaN(camadaId)) {
        setError('ID de camada inválido.');
        setLoading(false);
        return;
    }

    const cargarDatos = async () => {
      setLoading(true);
      setError(null); // Resetear error
      try {
        // Cambiar a backend_nuevo.json
        const res = await fetch('/backend_nuevo.json');
        if (!res.ok) {
          throw new Error(`Error al cargar datos: ${res.statusText}`);
        }
        const data = await res.json();

        // Validar estructura básica del JSON
        if (!data || typeof data !== 'object') throw new Error("Formato de datos inválido.");
        if (!Array.isArray(data.camada)) throw new Error("Falta el array 'camada' en los datos.");
        if (!Array.isArray(data.proveedor)) throw new Error("Falta el array 'proveedor' en los datos.");
        if (!Array.isArray(data.galpon)) throw new Error("Falta el array 'galpon' en los datos.");
        if (!Array.isArray(data.camadaGalpon)) throw new Error("Falta el array 'camadaGalpon' en los datos.");


        // Buscar la camada por ID
        const camadaEncontrada = data.camada.find((c: Camada) => c.camadaId === camadaId);
        if (!camadaEncontrada) {
          setError(`Camada con ID ${camadaId} no encontrada.`);
          setLoading(false); // Detener carga si no se encuentra
          return;
        }
        setCamada(camadaEncontrada);

        // Buscar el proveedor de esta camada
        const proveedorEncontrado = data.proveedor.find((p: Proveedor) => p.proveedorId === camadaEncontrada.proveedorId);
        setProveedor(proveedorEncontrado || null); // Guardar el proveedor o null si no se encuentra

        // Obtener distribución por galpón para esta camada
        const distribucionCamada = data.camadaGalpon.filter(
          (cg: CamadaGalpon) => cg.camadaId === camadaId
        );
        setDistribucion(distribucionCamada);

        // Cargar información de todos los galpones para buscar nombres
        setGalponesInfo(data.galpon || []);

      } catch (err) {
        console.error('Error al cargar datos de la camada:', err);
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de la camada.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [camadaId]); // Dependencia del efecto

  // Función para formatear la fecha (maneja null)
  const formatearFecha = (fechaStr: string | null): string => {
    if (!fechaStr) return '-';
    try {
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
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


  // Función para obtener el nombre del galpón desde galponesInfo
  const obtenerNombreGalpon = (galponId: number): string => {
    const galpon = galponesInfo.find(g => g.galponId === galponId);
    return galpon ? galpon.nombre : `ID ${galponId}`;
  }

  // Calcular total de aves
  const totalAves = distribucion.reduce((total, d) => total + d.cantidadInicial, 0);

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando detalles de la camada...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, m: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/camadas')}
          variant="outlined"
        >
          Volver a Camadas
        </Button>
      </Paper>
    );
  }

  if (!camada) {
     // Este caso ahora se maneja dentro del bloque de error si la camada no se encuentra
     // Podríamos mantener un mensaje específico si quisiéramos diferenciar
     return (
        <Paper elevation={3} sx={{ p: 3, m: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>No se encontró información para la camada solicitada.</Alert>
            <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/camadas')}
            variant="outlined"
            >
            Volver a Camadas
            </Button>
        </Paper>
     )
  }


  // Renderizado principal si hay datos
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}> {/* Padding responsivo */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/camadas')}
        sx={{ mb: 2, textTransform: 'none' }}
        variant="text" // Menos prominente
      >
        Volver a la lista
      </Button>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }} className='text-black'>
        Detalle de Camada #{camada.camadaId}
      </Typography>

      <Grid container spacing={3}>
        {/* Información general */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}> {/* Sombra sutil */}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>

              <Grid container spacing={1.5}> {/* Espaciado interno */}
                <Grid item xs={5}><Typography variant="body1" color="text.secondary">Estado:</Typography></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right' }}>
                  <Chip
                    label={camada.fechaSalida ? 'Finalizada' : 'Activa'}
                    color={camada.fechaSalida ? 'default' : 'success'}
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={5}><Typography variant="body1" color="text.secondary">Ingreso:</Typography></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right' }}><Typography variant="body1">{formatearFecha(camada.fechaIngreso)}</Typography></Grid>

                {camada.fechaSalida && (
                  <>
                    <Grid item xs={5}><Typography variant="body1" color="text.secondary">Salida:</Typography></Grid>
                    <Grid item xs={7} sx={{ textAlign: 'right' }}><Typography variant="body1">{formatearFecha(camada.fechaSalida)}</Typography></Grid>
                  </>
                )}

                <Grid item xs={5}><Typography variant="body1" color="text.secondary">Proveedor:</Typography></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">
                        {/* Mostrar nombre del proveedor o ID si no se encontró */}
                        {proveedor ? proveedor.nombre : `ID ${camada.proveedorId}`}
                    </Typography>
                </Grid>

                <Grid item xs={5}><Typography variant="body1" color="text.secondary">Total Aves:</Typography></Grid>
                <Grid item xs={7} sx={{ textAlign: 'right' }}><Typography variant="body1" fontWeight="bold">{totalAves.toLocaleString()}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por galpón */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Galpón
              </Typography>

              {distribucion.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#fafafa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Galpón</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cantidad Inicial</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {distribucion.map((d) => (
                        // Usar camadaGalponId como key
                        <TableRow key={d.camadaGalponId} hover>
                          <TableCell>{obtenerNombreGalpon(d.galponId)}</TableCell>
                          <TableCell align="right">{d.cantidadInicial.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {/* Fila de Total */}
                      <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{totalAves.toLocaleString()}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No hay información de distribución para esta camada.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}