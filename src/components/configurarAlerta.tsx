'use client'

import React, { useState, useEffect } from 'react'
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

interface ConfiguracionAlerta {
  configId: number;
  galponId: number | null;
  tipoAlerta: string;
  valorMin?: number;
  valorMax?: number;
  umbralMortalidad?: number;
  umbralHoras?: number;
  canalNotificacion: string;
  rolANotificar: string;
  activa: boolean;
  dispositivoObjetivo?: string; // agregado para soporte de dispositivos
}

interface FormularioAlertaProps {
  galponesDisponibles: Galpon[]
  onGuardar: (data: ConfiguracionAlerta) => void
  onCancel?: () => void
  alertaExistente?: ConfiguracionAlerta | null
}

const tiposAlerta = [
  'Temperatura',
  'Humedad',
  'Mortalidad Alta',
  'Dispositivo Tiempo'
]

const canalesDisponibles = ['WhatsApp', 'Email']
const rolesDisponibles = ['Operario', 'Gerente']
const dispositivosDisponibles = ['Ventilador', 'Aspersor']

export default function FormularioAlerta({
  galponesDisponibles,
  onGuardar,
  onCancel,
  alertaExistente
}: FormularioAlertaProps) {
  const [galponId, setGalponId] = useState('todos')
  const [tipoAlerta, setTipoAlerta] = useState('')
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')
  const [umbralMort, setUmbralMort] = useState('')
  const [umbralTiempo, setUmbralTiempo] = useState('')
  const [dispositivo, setDispositivo] = useState('')
  const [canal, setCanal] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (alertaExistente) {
      setGalponId(alertaExistente.galponId?.toString() ?? 'todos')
      setTipoAlerta(alertaExistente.tipoAlerta || '')
      setCanal(alertaExistente.canalNotificacion || '')
      setRoles(alertaExistente.rolANotificar?.split(',') || [])
      setValorMin(alertaExistente.valorMin?.toString() || '')
      setValorMax(alertaExistente.valorMax?.toString() || '')
      setUmbralMort(alertaExistente.umbralMortalidad?.toString() || '')
      setUmbralTiempo(alertaExistente.umbralHoras?.toString() || '')
      setDispositivo((alertaExistente as any).dispositivoObjetivo || '')
    }
  }, [alertaExistente])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!tipoAlerta || !canal || roles.length === 0) {
      setError('Completa tipo de alerta, canal y roles.')
      return
    }

    let payload: ConfiguracionAlerta = {
      configId: alertaExistente?.configId ?? Date.now(),
      galponId: galponId === 'todos' ? null : Number(galponId),
      tipoAlerta,
      canalNotificacion: canal,
      rolANotificar: roles.join(','),
      activa: true,
    }

    if (tipoAlerta === 'Temperatura' || tipoAlerta === 'Humedad') {
      if (!valorMin || !valorMax) {
        setError('Debes indicar umbral mínimo y máximo.')
        return
      }
      payload.valorMin = Number(valorMin)
      payload.valorMax = Number(valorMax)
    } else if (tipoAlerta === 'Mortalidad Alta') {
      if (!umbralMort) {
        setError('Debes indicar el umbral de mortalidad.')
        return
      }
      payload.umbralMortalidad = Number(umbralMort)
    } else if (tipoAlerta === 'Dispositivo Tiempo') {
      if (!umbralTiempo) {
        setError('Debes indicar el umbral de tiempo (horas).')
        return
      }
      if (!dispositivo) {
        setError('Debes seleccionar un tipo de dispositivo.')
        return
      }
      payload.umbralHoras = Number(umbralTiempo)
      payload.dispositivoObjetivo = dispositivo
    }

    onGuardar(payload)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', py: 2 }}>
      <Stack spacing={3}>
        {/* Galpón y Tipo */}
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
            <FormControl fullWidth required>
              <InputLabel id="galpon-label">Galpón</InputLabel>
              <Select
                labelId="galpon-label"
                label="Galpón"
                value={galponId || 'todos'}
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
                value={tipoAlerta || ''}
                onChange={e => setTipoAlerta(e.target.value)}
              >
                {tiposAlerta.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/* Umbrales */}
        {(tipoAlerta === 'Temperatura' || tipoAlerta === 'Humedad') && (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Min"
              type="number"
              required
              fullWidth
              value={valorMin || ''}
              onChange={e => setValorMin(e.target.value)}
            />
            <TextField
              label="Max"
              type="number"
              required
              fullWidth
              value={valorMax || ''}
              onChange={e => setValorMax(e.target.value)}
            />
          </Stack>
        )}

        {tipoAlerta === 'Mortalidad Alta' && (
          <TextField
            label="Umbral mortalidad"
            type="number"
            required
            fullWidth
            helperText="Cantidad de aves fallecidas para alertar"
            value={umbralMort || ''}
            onChange={e => setUmbralMort(e.target.value)}
          />
        )}

        {tipoAlerta === 'Dispositivo Tiempo' && (
          <>
            <TextField
              label="Umbral tiempo (h)"
              type="number"
              required
              fullWidth
              helperText="Horas de dispositivo encendido"
              value={umbralTiempo || ''}
              onChange={e => setUmbralTiempo(e.target.value)}
            />

            <FormControl fullWidth required>
              <InputLabel id="dispositivo-label">Dispositivo</InputLabel>
              <Select
                labelId="dispositivo-label"
                label="Dispositivo"
                value={dispositivo || ''}
                onChange={e => setDispositivo(e.target.value)}
              >
                {dispositivosDisponibles.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        {/* Roles */}
        <FormControl fullWidth required>
          <InputLabel id="roles-label">Rol a notificar</InputLabel>
          <Select
            labelId="roles-label"
            multiple
            value={roles}
            onChange={(e: SelectChangeEvent<string[]>) =>
              setRoles(typeof e.target.value === 'string'
                ? e.target.value.split(',')
                : e.target.value)
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

        {/* Canal */}
        <FormControl fullWidth required>
          <InputLabel id="canal-label">Canal de notificación</InputLabel>
          <Select
            labelId="canal-label"
            label="Canal de notificación"
            value={canal || ''}
            onChange={e => setCanal(e.target.value)}
          >
            {canalesDisponibles.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Error */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Botones */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {onCancel && (
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="contained">
            {alertaExistente ? "Guardar cambios" : "Guardar alerta"}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
