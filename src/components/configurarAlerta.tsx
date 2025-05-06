'use client'

import React, { useState } from 'react';
import {
  Box,
  Grid,
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
} from '@mui/material';

type Galpon = {
  galponId: number;
  nombre: string;
};

interface FormularioAlertaProps {
  galponesDisponibles: Galpon[];
  onGuardar: (data: any) => void;
  onCancel?: () => void;
}

const variablesDisponibles = ['Temperatura', 'Humedad', 'CO2'];
const canalesDisponibles = ['WhatsApp', 'Email'];
const rolesDisponibles = ['Operario', 'Gerente'];

const FormularioAlerta: React.FC<FormularioAlertaProps> = ({ galponesDisponibles, onGuardar, onCancel }) => {
  const [galponId, setGalponId] = useState<string>('todos');
  const [variable, setVariable] = useState<string>('');
  const [valorMin, setValorMin] = useState<string>('');
  const [valorMax, setValorMax] = useState<string>('');
  const [canal, setCanal] = useState<string>('');
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!variable || !valorMin || !valorMax || !canal || roles.length === 0) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const alertaData = {
      galponId: galponId === 'todos' ? null : parseInt(galponId),
      variable,
      valorMin: parseFloat(valorMin),
      valorMax: parseFloat(valorMax),
      canalNotificacion: canal,
      rolANotificar: roles.join(','),
    };

    onGuardar(alertaData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item md={2.4}>
          <FormControl fullWidth required>
            <InputLabel id="galpon-label">Galpón</InputLabel>
            <Select
              labelId="galpon-label"
              value={galponId}
              label="Galpón"
              onChange={(e) => setGalponId(e.target.value)}
            >
              <MenuItem value="todos"><em>Todos los Galpones</em></MenuItem>
              {galponesDisponibles.map(g => (
                <MenuItem key={g.galponId} value={g.galponId.toString()}>
                  {g.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item md={2.4}>
          <FormControl fullWidth required>
            <InputLabel id="variable-label">Variable</InputLabel>
            <Select
              labelId="variable-label"
              value={variable}
              label="Variable"
              onChange={(e) => setVariable(e.target.value)}
            >
              {variablesDisponibles.map(v => (
                <MenuItem key={v} value={v}>{v}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item md={2.4}>
          <TextField
            label="Valor Mínimo"
            type="number"
            required
            fullWidth
            value={valorMin}
            onChange={(e) => setValorMin(e.target.value)}
          />
        </Grid>

        <Grid item md={2.4}>
          <TextField
            label="Valor Máximo"
            type="number"
            required
            fullWidth
            value={valorMax}
            onChange={(e) => setValorMax(e.target.value)}
          />
        </Grid>

        <Grid item md={2.4}>
          <FormControl fullWidth required>
            <InputLabel id="canal-label">Canal</InputLabel>
            <Select
              labelId="canal-label"
              value={canal}
              label="Canal"
              onChange={(e) => setCanal(e.target.value)}
            >
              {canalesDisponibles.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item md={2.4}>
          <FormControl fullWidth required>
            <InputLabel id="roles-label">Roles</InputLabel>
            <Select
              labelId="roles-label"
              multiple
              value={roles}
              onChange={(e: SelectChangeEvent<string[]>) =>
                setRoles(typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : e.target.value)
              }
              input={<OutlinedInput label="Roles" />}
              renderValue={(selected) => selected.join(', ')}
            >
              {rolesDisponibles.map((rol) => (
                <MenuItem key={rol} value={rol}>
                  <Checkbox checked={roles.indexOf(rol) > -1} />
                  <ListItemText primary={rol} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item md={2.4}>
          <Button type="submit" variant="contained" fullWidth>
            Guardar Alerta
          </Button>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FormularioAlerta;
