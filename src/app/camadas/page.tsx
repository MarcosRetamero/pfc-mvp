'use client'

import { useState, useEffect } from 'react'; // Importar useState y useEffect
import ListaCamadas from '@/components/listaCamadas'
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material' // Añadir CircularProgress y Alert
import { Add } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

// Definir tipo para la camada según backend_nuevo.json
type CamadaInfo = {
  camadaId: number;
  fechaIngreso: string;
  fechaSalida: string | null; // Clave para saber si está activa
  proveedorId: number;
};

export default function CamadasPage() {
  const router = useRouter()
  const [hayCamadaActiva, setHayCamadaActiva] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificarCamadaActiva = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/backend_nuevo.json');
        if (!res.ok) {
          throw new Error('No se pudo cargar la información de las camadas.');
        }
        const data = await res.json();
        const camadas: CamadaInfo[] = data.camada || [];
        // Verificar si alguna camada tiene fechaSalida === null
        const activa = camadas.some(camada => camada.fechaSalida === null);
        setHayCamadaActiva(activa);
      } catch (err) {
        console.error("Error verificando camada activa:", err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        // Considerar cómo manejar el error, quizás deshabilitar el botón por precaución
        setHayCamadaActiva(true); // Deshabilitar si hay error
      } finally {
        setLoading(false);
      }
    };

    verificarCamadaActiva();
  }, []); // Ejecutar solo al montar

  const handleNuevaCamada = () => {
    router.push('/camadas/nueva')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" className='text-black'>
          Gestión de Camadas
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNuevaCamada}
            disabled={hayCamadaActiva || !!error} // Deshabilitar si hay camada activa o si hubo error
            title={hayCamadaActiva ? "Ya existe una camada activa. Debe registrar su salida antes de crear una nueva." : error ? "Error al verificar camadas activas." : "Registrar una nueva camada"}
          >
            Registrar Nueva Camada
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Error al verificar estado de camadas: {error}</Alert>}
      {hayCamadaActiva && !loading && !error && (
         <Alert severity="info" sx={{ mb: 2 }}>
           Actualmente hay una camada activa. Para registrar una nueva, primero debe finalizar la actual.
         </Alert>
      )}

      <ListaCamadas />

    </Box>
  )
}