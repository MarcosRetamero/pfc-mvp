'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Box,
  Alert,
  FormHelperText,
} from '@mui/material'

// Tipo para la nueva camada
type NuevaCamada = {
  fechaIngreso: string
  proveedor: string
  galponId: number
  cantidadAves: number
}

export default function FormularioCamada() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Configuración de react-hook-form con validaciones
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NuevaCamada>({
    defaultValues: {
      fechaIngreso: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      proveedor: '',
      galponId: 0,
      cantidadAves: 0,
    },
  })

  // Galpones disponibles (simulados, en una app real se cargarían desde la API)
  const galpones = [
    { galponId: 1, nombre: 'Galpón 1' },
    { galponId: 2, nombre: 'Galpón 2' },
    { galponId: 3, nombre: 'Galpón 3' },
    { galponId: 4, nombre: 'Galpón 4' },
  ]

  // Función para manejar el envío del formulario
  const onSubmit = async (data: NuevaCamada) => {
    setLoading(true)
    setError(null)

    try {
      // En una app real, aquí se haría una llamada a la API
      // Simulamos una llamada a la API con un timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulamos guardar los datos
      console.log('Datos de la nueva camada:', data)

      // Obtener el último ID de camada para generar uno nuevo
      const res = await fetch('/backend.json')
      const backendData = await res.json()
      
      // Crear nueva camada
      const nuevaCamadaId = Math.max(...backendData.camadas.map((c: any) => c.camadaId)) + 1
      const nuevaCamada = {
        camadaId: nuevaCamadaId,
        fechaIngreso: data.fechaIngreso,
        fechaSalida: null,
        proveedor: data.proveedor
      }
      
      // Crear registro de camada-galpón
      const nuevoRegistroId = Math.max(...backendData.camadaGalpon.map((cg: any) => cg.registroId)) + 1
      const nuevoCamadaGalpon = {
        registroId: nuevoRegistroId,
        galponId: data.galponId,
        camadaId: nuevaCamadaId,
        cantidadInicial: data.cantidadAves
      }
      
      // En una app real, aquí se enviarían estos datos al backend
      console.log('Nueva camada a guardar:', nuevaCamada)
      console.log('Nuevo registro camada-galpón a guardar:', nuevoCamadaGalpon)

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error al guardar la camada:', err)
      setError('Ocurrió un error al guardar la camada. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper className="p-6 max-w-2xl mx-auto">
      <Typography variant="h5" className="mb-6 text-center text-black mt-6">
        Registrar Nueva Camada
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        {/* Fecha de Ingreso */}
        <Controller
          name="fechaIngreso"
          control={control}
          rules={{ required: 'La fecha de ingreso es obligatoria' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Fecha de Ingreso"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.fechaIngreso}
              helperText={errors.fechaIngreso?.message}
              className="mb-4"  
            />
          )}
        />

        {/* Proveedor */}
        <Controller
          name="proveedor"
          control={control}
          rules={{ required: 'El proveedor es obligatorio' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Proveedor"
              fullWidth
              error={!!errors.proveedor}
              helperText={errors.proveedor?.message}
            />
          )}
        />

        {/* Galpón */}
        <Controller
          name="galponId"
          control={control}
          rules={{ required: 'Debes seleccionar un galpón', min: { value: 1, message: 'Selecciona un galpón válido' } }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.galponId}>
              <InputLabel>Galpón</InputLabel>
              <Select {...field} label="Galpón">
                <MenuItem value={0} disabled>
                  Selecciona un galpón
                </MenuItem>
                {galpones.map((galpon) => (
                  <MenuItem key={galpon.galponId} value={galpon.galponId}>
                    {galpon.nombre}
                  </MenuItem>
                ))}
              </Select>
              {errors.galponId && <FormHelperText>{errors.galponId.message}</FormHelperText>}
            </FormControl>
          )}
        />

        {/* Cantidad de Aves */}
        <Controller
          name="cantidadAves"
          control={control}
          rules={{
            required: 'La cantidad de aves es obligatoria',
            min: { value: 1, message: 'Debe haber al menos 1 ave' },
            validate: (value) => Number.isInteger(value) || 'Debe ser un número entero',
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cantidad de Aves"
              type="number"
              fullWidth
              inputProps={{ min: 1, step: 1 }}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              error={!!errors.cantidadAves}
              helperText={errors.cantidadAves?.message}
            />
          )}
        />

        {/* Botones */}
        <Box className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Camada'}
          </Button>
        </Box>
      </form>
    </Paper>
  )
}