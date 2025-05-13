'use client'

import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  // Grid, // Eliminamos Grid
  Stack, // Añadimos Stack
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

// ... existing code ...

type ReposicionFormProps = {
  galpones: Array<{
    galponId: number;
    nombre: string;
    capacidadSiloKg: number;
  }>;
  onSubmit: (data: ReposicionFormData) => void;
}

type ReposicionFormData = {
  fecha: string;
  observaciones?: string;
  reposicionesPorGalpon: Array<{
    galponId: number;
    cantidadKg: number;
    tipoAlimento: string;
  }>;
}

const tiposAlimento = ['Inicial', 'Crecimiento', 'Final']

export default function ReposicionAlimentoForm({ galpones, onSubmit }: ReposicionFormProps) {
  const [formData, setFormData] = useState<ReposicionFormData>({
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    reposicionesPorGalpon: galpones.map(g => ({
      galponId: g.galponId,
      cantidadKg: g.capacidadSiloKg, // Considera si este debe ser 0 o un valor vacío por defecto
      tipoAlimento: ''
    }))
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.fecha) {
      setError('Debe seleccionar una fecha de reposición')
      return
    }

    const cantidadesInvalidas = formData.reposicionesPorGalpon.some(r => r.cantidadKg <= 0)
    if (cantidadesInvalidas) {
        setError('La cantidad a reponer debe ser mayor a 0 para todos los galpones seleccionados.')
        return
    }

    const tiposIncompletos = formData.reposicionesPorGalpon.some(r => r.cantidadKg > 0 && !r.tipoAlimento)
    if (tiposIncompletos) {
      setError('Debe seleccionar el tipo de alimento para todos los galpones con cantidad a reponer.')
      return
    }
    
    // Filtramos solo las reposiciones que tienen una cantidad mayor a 0
    const reposicionesValidas = formData.reposicionesPorGalpon.filter(r => r.cantidadKg > 0);

    if (reposicionesValidas.length === 0) {
        setError('Debe ingresar una cantidad a reponer para al menos un galpón.');
        return;
    }

    onSubmit({
        fecha: formData.fecha,
        observaciones: formData.observaciones,
        reposicionesPorGalpon: reposicionesValidas
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}> {/* Reemplazo de Grid container principal */}
        <Box sx={{ width: '100%' }}> {/* Reemplazo de Grid item xs={12} */}
          <TextField
            fullWidth
            type="date"
            label="Fecha de Reposición"
            InputLabelProps={{ shrink: true }}
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
          />
        </Box>

        <Box sx={{ width: '100%' }}> {/* Reemplazo de Grid item xs={12} */}
          <Typography variant="h6" gutterBottom>
            Detalle de Reposición por Galpón
          </Typography>
          {galpones.map((galpon, index) => (
            <Paper key={galpon.galponId} sx={{ p: 2, mb: 2, mt: 1 }}>
              <Typography variant="subtitle1">
                {galpon.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Capacidad máxima: {galpon.capacidadSiloKg}kg
              </Typography>
              {/* Reemplazo de Grid container interno */}
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Box sx={{ width: { xs: '100%', sm: (theme) => `calc(50% - ${theme.spacing(1)})` } }}> {/* Reemplazo de Grid item xs={12} sm={6} */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad a Reponer (kg)"
                    value={formData.reposicionesPorGalpon[index].cantidadKg}
                    onChange={(e) => {
                      const newReposiciones = [...formData.reposicionesPorGalpon]
                      const value = Number(e.target.value)
                      newReposiciones[index].cantidadKg = value < 0 ? 0 : value // Evitar negativos
                      setFormData({ ...formData, reposicionesPorGalpon: newReposiciones })
                    }}
                    inputProps={{
                      max: galpon.capacidadSiloKg,
                      min: 0
                    }}
                    helperText={`Máximo: ${galpon.capacidadSiloKg}kg. Dejar en 0 o vacío si no se repone.`}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: (theme) => `calc(50% - ${theme.spacing(1)})` } }}> {/* Reemplazo de Grid item xs={12} sm={6} */}
                  <FormControl fullWidth required={formData.reposicionesPorGalpon[index].cantidadKg > 0}>
                    <InputLabel id={`tipoAlimento-label-${index}`}>Tipo de Alimento</InputLabel>
                    <Select
                      labelId={`tipoAlimento-label-${index}`}
                      value={formData.reposicionesPorGalpon[index].tipoAlimento}
                      label="Tipo de Alimento"
                      onChange={(e) => {
                        const newReposiciones = [...formData.reposicionesPorGalpon]
                        newReposiciones[index].tipoAlimento = e.target.value
                        setFormData({ ...formData, reposicionesPorGalpon: newReposiciones })
                      }}
                      disabled={formData.reposicionesPorGalpon[index].cantidadKg <= 0}
                    >
                      <MenuItem value="">
                        <em>Seleccionar...</em>
                      </MenuItem>
                      {tiposAlimento.map(tipo => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        <Box sx={{ width: '100%' }}> {/* Reemplazo de Grid item xs={12} */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            helperText="Opcional: Agregue notas o comentarios sobre la reposición"
          />
        </Box>

        {error && (
          <Box sx={{ width: '100%' }}> {/* Reemplazo de Grid item xs={12} */}
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Box sx={{ width: '100%' }}> {/* Reemplazo de Grid item xs={12} */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
          >
            Registrar Reposición Total
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}