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

interface VisitaVeterinaria {
  visitaId: number;
  camadaId: number;
  fecha: string;
  profesional: string;
  descripcion: string;
  medicacion: string;
  motivo: string;
  adjuntoUrl?: string;
}

export default function VisitasVeterinariasPage() {
  const [visitas, setVisitas] = useState<VisitaVeterinaria[]>([]);
  const [camadasDisponibles, setCamadasDisponibles] = useState<number[]>([]);
  const [camadaSeleccionada, setCamadaSeleccionada] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [fecha, setFecha] = useState("");
  const [profesional, setProfesional] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [medicacion, setMedicacion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const motivosOpciones = ["Rutinario", "Enfermedad", "Otro"];

  useEffect(() => {
    setCamadasDisponibles([1, 2, 3]);
    setCamadaSeleccionada(1);
    setVisitas([
      {
        visitaId: 1,
        camadaId: 1,
        fecha: "2025-05-07",
        profesional: "Dr. Juan Pérez",
        descripcion: "Control de rutina general.",
        medicacion: "Vitamina A",
        motivo: "Rutinario",
      },
      {
        visitaId: 2,
        camadaId: 1,
        fecha: "2025-05-05",
        profesional: "Dra. Marta Gómez",
        descripcion: "Tratamiento por problema respiratorio.",
        medicacion: "Antibióticos",
        motivo: "Enfermedad",
        adjuntoUrl: "https://example.com/informe.pdf",
      }
    ]);
  }, []);

  const handleGuardarVisita = () => {
    if (!fecha || !profesional || !motivo || !camadaSeleccionada) {
      setError("Por favor, completá todos los campos obligatorios.");
      return;
    }

    const nuevaVisita: VisitaVeterinaria = {
      visitaId: Date.now(),
      camadaId: camadaSeleccionada,
      fecha,
      profesional,
      descripcion,
      medicacion,
      motivo,
      adjuntoUrl: archivo ? URL.createObjectURL(archivo) : undefined,
    };

    setVisitas((prev) => [...prev, nuevaVisita]);
    setSuccessMsg("Visita registrada correctamente.");
    setModalAbierto(false);
    setFecha("");
    setProfesional("");
    setDescripcion("");
    setMedicacion("");
    setMotivo("");
    setArchivo(null);
    setError(null);
  };

  const visitasFiltradas = visitas.filter((v) => v.camadaId === camadaSeleccionada);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Visitas Veterinarias
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Camada</InputLabel>
          <Select
            value={camadaSeleccionada ?? ""}
            label="Camada"
            onChange={(e) => setCamadaSeleccionada(Number(e.target.value))}
          >
            {camadasDisponibles.map((id) => (
              <MenuItem key={id} value={id}>
                Camada #{id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalAbierto(true)}
        >
          Registrar Nueva Visita
        </Button>
      </Stack>

      <Stack spacing={2}>
        {visitasFiltradas.map((visita) => (
          <Paper key={visita.visitaId} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">
                  Visita {new Date(visita.fecha).toLocaleDateString("es-AR")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {visita.profesional} — {visita.motivo}
                </Typography>
              </Box>
              <IconButton onClick={() => setExpandedId(expandedId === visita.visitaId ? null : visita.visitaId)}>
                {expandedId === visita.visitaId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={expandedId === visita.visitaId}>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Descripción:</b> {visita.descripcion || "—"}</Typography>
              <Typography variant="body2"><b>Medicación:</b> {visita.medicacion || "—"}</Typography>
              <Typography variant="body2">
                <b>Archivo adjunto:</b> {visita.adjuntoUrl
                  ? <a href={visita.adjuntoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>Ver archivo adjunto</a>
                  : "No hay archivo adjunto"}
              </Typography>
            </Collapse>
          </Paper>
        ))}
        {visitasFiltradas.length === 0 && (
          <Typography color="text.secondary">No hay visitas registradas para esta camada.</Typography>
        )}
      </Stack>

      <Dialog open={modalAbierto} onClose={() => setModalAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Visita Veterinaria</DialogTitle>
        <DialogContent>
          <TextField
            label="Profesional"
            fullWidth
            required
            margin="dense"
            value={profesional}
            onChange={(e) => setProfesional(e.target.value)}
          />
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
            <InputLabel>Motivo</InputLabel>
            <Select
              value={motivo}
              label="Motivo"
              onChange={(e) => setMotivo(e.target.value)}
            >
              {motivosOpciones.map((op) => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
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
          <TextField
            label="Medicación"
            fullWidth
            margin="dense"
            multiline
            rows={2}
            value={medicacion}
            onChange={(e) => setMedicacion(e.target.value)}
          />
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
          >
            Cargar Adjunto
            <input
              type="file"
              hidden
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarVisita}>Guardar</Button>
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
