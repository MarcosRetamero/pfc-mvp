'use client'

import { useState, useEffect } from 'react'
import FormularioCamada from '@/components/formularioCamada'
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

// Tipo para los datos del galpón que necesitamos (ya incluye capacidadMax)
type GalponInfo = {
  galponId: number;
  nombre: string;
  capacidadMax: number;
};

// Tipo para los datos que vienen del formulario (ya validados)
type NuevaCamadaData = {
    fechaIngreso: string;
    proveedorId: string;
    distribucion: Array<{ galponId: number; cantidadInicial: number }>;
};


export default function NuevaCamadaPage() {
  const router = useRouter()
  const [galpones, setGalpones] = useState<GalponInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de galpones al montar el componente (sin cambios aquí)
  useEffect(() => {
    const fetchGalpones = async () => {
      try {
        setLoading(true);
        setError(null); // Resetear error al intentar cargar
        const res = await fetch('/backend_nuevo.json');
        if (!res.ok) {
          throw new Error('No se pudo cargar la información de los galpones.');
        }
        const data = await res.json();
        const galponData = Array.isArray(data.galpon) ? data.galpon.map((g: { galponId: number; nombre: string; capacidadMax: number }) => ({
          galponId: g.galponId,
          nombre: g.nombre,
          capacidadMax: g.capacidadMax // Asegurarse que se extrae capacidadMax
        })) : [];

        // Validar que los galpones tengan capacidadMax
        if (galponData.some((g: GalponInfo) => typeof g.capacidadMax !== 'number')) {
             console.warn("Algunos galpones no tienen 'capacidadMax' definida en backend_nuevo.json");
             // Podrías lanzar un error o asignar un valor por defecto si es crítico
             // throw new Error("Faltan datos de capacidad máxima en algunos galpones.");
        }

        setGalpones(galponData);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        setGalpones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalpones();
  }, []);

  // handleGuardarCamada ahora solo recibe los datos validados y simula el guardado
  const handleGuardarCamada = (nuevaCamadaData: NuevaCamadaData) => {
    // Las validaciones ya se hicieron en FormularioCamada

    console.log("Simulando guardado de nueva camada (Datos ya validados):", nuevaCamadaData);

    // --- Lógica de persistencia (simulada) ---
    // Aquí iría la lógica para actualizar el backend_nuevo.json o llamar a una API real.
    // Por ahora, solo mostramos un mensaje y redirigimos.
    // Ejemplo (NO FUNCIONAL PARA ACTUALIZAR EL JSON EN EL CLIENTE):
    // 1. Leer backend_nuevo.json
    // 2. Encontrar el último camadaId y camadaGalponId
    // 3. Crear los nuevos objetos camada y camadaGalpon[]
    // 4. Añadirlos a los arrays correspondientes en los datos leídos
    // 5. (Idealmente) Escribir de vuelta al archivo JSON (esto no es posible directamente desde el navegador por seguridad)
    // --- Fin Lógica de persistencia ---

    alert('Camada registrada exitosamente (simulado).');
    router.push('/camadas'); // Redirigir a la lista de camadas
  };


  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.push('/camadas')}
        sx={{ mb: 2 }}
      >
        Volver a Camadas
      </Button>
      <Typography variant="h4" gutterBottom className="text-black">
        Registrar Nueva Camada
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando datos de galpones...</Typography>
          </Box>
        ) : error ? (
          // Mostrar error y quizás un botón para reintentar
          <Box>
             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          </Box>
        ) : galpones.length === 0 ? (
           // Si no hay galpones, no se puede registrar
           <Alert severity="warning">No se encontraron galpones disponibles para asignar. No se puede registrar una camada.</Alert>
        ) : (
          // Pasar los galpones disponibles al formulario
          <FormularioCamada
            galponesDisponibles={galpones}
            onGuardar={handleGuardarCamada}
          />
        )}
      </Paper>
    </Box>
  )
}