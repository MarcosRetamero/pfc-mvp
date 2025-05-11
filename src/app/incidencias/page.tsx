"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TextField,
  Collapse,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface Incidencia {
  incidenciaId: number;
  camadaId: number;
  galponId: number | null;
  fecha: string;
  descripcion: string;
  tipo: string;
  usuarioId: number;
}

export default function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [camadas, setCamadas] = useState<number[]>([]);
  const [galpones, setGalpones] = useState<{ galponId: number; nombre: string }[]>([]);
  const [camadaSeleccionada, setCamadaSeleccionada] = useState<number | null>(null);
  const [galponSeleccionado, setGalponSeleccionado] = useState<number | "" | "ninguno">("ninguno");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const tiposOpciones = ["Sistema", "Sanitaria", "Otro"];

  useEffect(() => {
    setCamadas([1, 2, 3]);
    setGalpones([
      { galponId: 1, nombre: "Galpón 1" },
      { galponId: 2, nombre: "Galpón 2" },
      { galponId: 3, nombre: "Galpón 3" },
    ]);
    setCamadaSeleccionada(1);
    setIncidencias([
      {
        incidenciaId: 1,
        camadaId: 1,
        galponId: 2,
        fecha: "2025-05-07",
        descripcion: "Problema en sensor de humedad.",
        tipo: "Sistema",
        usuarioId: 101,
      },
    ]);
  }, []);

  const handleGuardarIncidencia = () => {
    if (!fecha || !descripcion || !tipo || !camadaSeleccionada) {
      setError("Por favor, completá todos los campos obligatorios.");
      return;
    }

    const nueva: Incidencia = {
      incidenciaId: Date.now(),
      camadaId: camadaSeleccionada,
      galponId: galponSeleccionado === "ninguno" ? null : Number(galponSeleccionado),
      fecha,
      descripcion,
      tipo,
      usuarioId: 999, // valor simulado
    };

    setIncidencias((prev) => [...prev, nueva]);
    setSuccessMsg("Incidencia registrada correctamente.");
    setModalAbierto(false);
    setFecha("");
    setDescripcion("");
    setTipo("");
    setGalponSeleccionado("ninguno");
    setError(null);
  };

  const filtradas = incidencias.filter((i) => i.camadaId === camadaSeleccionada);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Incidencias
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Camada</InputLabel>
          <Select
            value={camadaSeleccionada ?? ""}
            label="Camada"
            onChange={(e) => setCamadaSeleccionada(Number(e.target.value))}
          >
            {camadas.map((id) => (
              <MenuItem key={id} value={id}>Camada #{id}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalAbierto(true)}
        >
          Registrar Nueva Incidencia
        </Button>
      </Stack>

      <Stack spacing={2}>
        {filtradas.map((inc) => (
          <Paper key={inc.incidenciaId} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">
                  {new Date(inc.fecha).toLocaleDateString("es-AR")} — {inc.tipo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Galpón: {inc.galponId ? `#${inc.galponId}` : "Todos/Ninguno"} — Usuario ID: {inc.usuarioId}
                </Typography>
              </Box>
              <IconButton onClick={() => setExpandedId(expandedId === inc.incidenciaId ? null : inc.incidenciaId)}>
                {expandedId === inc.incidenciaId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={expandedId === inc.incidenciaId}>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <b>Descripción:</b> {inc.descripcion || "—"}
              </Typography>
            </Collapse>
          </Paper>
        ))}
        {filtradas.length === 0 && (
          <Typography color="text.secondary">No hay incidencias para esta camada.</Typography>
        )}
      </Stack>

      <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Incidencia</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            type="date"
            fullWidth
            required
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={fecha || new Date().toISOString().split("T")[0]}
            onChange={(e) => setFecha(e.target.value)}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              label="Tipo"
              onChange={(e) => setTipo(e.target.value)}
            >
              {tiposOpciones.map((op) => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Galpón</InputLabel>
            <Select
              value={galponSeleccionado}
              label="Galpón"
              onChange={(e) => setGalponSeleccionado(e.target.value as any)}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="ninguno">Ninguno</MenuItem>
              {galpones.map((g) => (
                <MenuItem key={g.galponId} value={g.galponId}>{g.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Descripción"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarIncidencia}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(null)}
        message={successMsg}
      />
    </Box>
  );
}
