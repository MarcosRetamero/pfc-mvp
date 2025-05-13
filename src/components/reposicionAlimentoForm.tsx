'use client'

import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

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
      cantidadKg: g.capacidadSiloKg,
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

    const tiposIncompletos = formData.reposicionesPorGalpon.some(r => !r.tipoAlimento)
    if (tiposIncompletos) {
      setError('Debe seleccionar el tipo de alimento para todos los galpones')
      return
    }

    onSubmit(formData)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="date"
            label="Fecha de Reposición"
            InputLabelProps={{ shrink: true }}
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Detalle de Reposición por Galpón
          </Typography>
          {galpones.map((galpon, index) => (
            <Paper key={galpon.galponId} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">
                {galpon.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Capacidad máxima: {galpon.capacidadSiloKg}kg
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cantidad a Reponer (kg)"
                    value={formData.reposicionesPorGalpon[index].cantidadKg}
                    onChange={(e) => {
                      const newReposiciones = [...formData.reposicionesPorGalpon]
                      newReposiciones[index].cantidadKg = Number(e.target.value)
                      setFormData({ ...formData, reposicionesPorGalpon: newReposiciones })
                    }}
                    inputProps={{
                      max: galpon.capacidadSiloKg,
                      min: 0
                    }}
                    helperText={`Máximo permitido: ${galpon.capacidadSiloKg}kg`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id={`tipoAlimento-${index}`}>Tipo de Alimento</InputLabel>
                    <Select
                      labelId={`tipoAlimento-${index}`}
                      value={formData.reposicionesPorGalpon[index].tipoAlimento}
                      label="Tipo de Alimento"
                      onChange={(e) => {
                        const newReposiciones = [...formData.reposicionesPorGalpon]
                        newReposiciones[index].tipoAlimento = e.target.value
                        setFormData({ ...formData, reposicionesPorGalpon: newReposiciones })
                      }}
                    >
                      {tiposAlimento.map(tipo => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            helperText="Opcional: Agregue notas o comentarios sobre la reposición"
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
          >
            Registrar Reposición Total
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
