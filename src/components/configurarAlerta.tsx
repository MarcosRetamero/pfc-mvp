// components/FormularioAlerta.tsx
'use client'

import React, { useState } from 'react'
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  Alert,
  SelectChangeEvent
} from '@mui/material'

type Galpon = { galponId: number; nombre: string }

interface FormularioAlertaProps {
  galponesDisponibles: Galpon[]
  onGuardar:           (data: any) => void
  onCancel?:           () => void
}

const tiposAlerta = [
  'Temperatura',
  'Humedad',
  'Mortalidad Alta',
  'Dispositivo Tiempo'
]
const canalesDisponibles = ['WhatsApp', 'Email']
const rolesDisponibles   = ['Operario', 'Gerente']

export default function FormularioAlerta({
  galponesDisponibles,
  onGuardar,
  onCancel
}: FormularioAlertaProps) {
  const [galponId,     setGalponId]     = useState('todos')
  const [tipoAlerta,   setTipoAlerta]   = useState('')
  const [valorMin,     setValorMin]     = useState('')
  const [valorMax,     setValorMax]     = useState('')
  const [umbralMort,   setUmbralMort]   = useState('')
  const [umbralTiempo, setUmbralTiempo] = useState('')
  const [canal,        setCanal]        = useState('')
  const [roles,        setRoles]        = useState<string[]>([])
  const [error,        setError]        = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones genéricas
    if (!tipoAlerta || !canal || roles.length === 0) {
      setError('Completa tipo de alerta, canal y roles.')
      return
    }

    // Validaciones específicas
    let payload: any = {
      galponId: galponId === 'todos' ? null : Number(galponId),
      tipoAlerta,
      canalNotificacion: canal,
      rolANotificar:     roles.join(',')
    }

    if (tipoAlerta === 'Temperatura' || tipoAlerta === 'Humedad') {
      if (!valorMin || !valorMax) {
        setError('Debes indicar umbral mínimo y máximo.')
        return
      }
      payload = { ...payload, valorMin: Number(valorMin), valorMax: Number(valorMax) }
    } else if (tipoAlerta === 'Mortalidad Alta') {
      if (!umbralMort) {
        setError('Debes indicar el umbral de mortalidad.')
        return
      }
      payload = { ...payload, umbralMortalidad: Number(umbralMort) }
    } else if (tipoAlerta === 'Dispositivo Tiempo') {
      if (!umbralTiempo) {
        setError('Debes indicar el umbral de tiempo (horas).')
        return
      }
      payload = { ...payload, umbralHoras: Number(umbralTiempo) }
    }

    onGuardar(payload)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        {/** FILA 1: Galpón + Tipo de alerta **/}
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
            <FormControl fullWidth required>
              <InputLabel id="galpon-label">Galpón</InputLabel>
              <Select
                labelId="galpon-label"
                label="Galpón"
                value={galponId}
                onChange={e => setGalponId(e.target.value)}
              >
                <MenuItem value="todos"><em>Todos los galpones</em></MenuItem>
                {galponesDisponibles.map(g => (
                  <MenuItem key={g.galponId} value={g.galponId.toString()}>
                    {g.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
            <FormControl fullWidth required>
              <InputLabel id="tipo-label">Tipo de alerta</InputLabel>
              <Select
                labelId="tipo-label"
                label="Tipo de alerta"
                value={tipoAlerta}
                onChange={e => setTipoAlerta(e.target.value)}
              >
                {tiposAlerta.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/** FILA 2: Umbrales según tipo de alerta **/}
        {(tipoAlerta === 'Temperatura' || tipoAlerta === 'Humedad') && (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Box sx={{ flex: '0 0 100px', minWidth: 100 }}>
              <TextField
                label="Min"
                type="number"
                required
                fullWidth
                value={valorMin}
                onChange={e => setValorMin(e.target.value)}
              />
            </Box>
            <Box sx={{ flex: '0 0 100px', minWidth: 100 }}>
              <TextField
                label="Max"
                type="number"
                required
                fullWidth
                value={valorMax}
                onChange={e => setValorMax(e.target.value)}
              />
            </Box>
          </Stack>
        )}

        {tipoAlerta === 'Mortalidad Alta' && (
          <Box sx={{ maxWidth: 240 }}>
            <TextField
              label="Umbral mortalidad"
              type="number"
              required
              fullWidth
              helperText="Cantidad de aves fallecidas para alertar"
              value={umbralMort}
              onChange={e => setUmbralMort(e.target.value)}
            />
          </Box>
        )}

        {tipoAlerta === 'Dispositivo Tiempo' && (
          <Box sx={{ maxWidth: 240 }}>
            <TextField
              label="Umbral tiempo (h)"
              type="number"
              required
              fullWidth
              helperText="Horas de dispositivo encendido"
              value={umbralTiempo}
              onChange={e => setUmbralTiempo(e.target.value)}
            />
          </Box>
        )}

        {/** FILA 3: Rol a notificar **/}
        <Box>
          <FormControl fullWidth required>
            <InputLabel id="roles-label">Rol a notificar</InputLabel>
            <Select
              labelId="roles-label"
              multiple
              value={roles}
              onChange={(e: SelectChangeEvent<string[]>) =>
                setRoles(
                  typeof e.target.value === 'string'
                    ? e.target.value.split(',')
                    : e.target.value
                )
              }
              input={<OutlinedInput label="Rol a notificar" />}
              renderValue={sel => sel.join(', ')}
            >
              {rolesDisponibles.map(r => (
                <MenuItem key={r} value={r}>
                  <Checkbox checked={roles.includes(r)} />
                  <ListItemText primary={r} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/** FILA 4: Canal de notificación **/}
        <Box>
          <FormControl fullWidth required>
            <InputLabel id="canal-label">Canal de notificación</InputLabel>
            <Select
              labelId="canal-label"
              label="Canal de notificación"
              value={canal}
              onChange={e => setCanal(e.target.value)}
            >
              {canalesDisponibles.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/** FILA 5: Error **/}
        {error && (
          <Box>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/** FILA 6: Botones **/}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {onCancel && (
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="contained">
            Guardar alerta
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
