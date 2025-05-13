"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import FormularioAlerta from "@/components/configurarAlerta";

interface ConfiguracionAlerta {
  configId: number;
  galponId: number;
  tipo: string;
  rolANotificar: string;
  valorMin: number;
  valorMax: number;
  canalNotificacion: string;
  activa: boolean;
}

interface FormularioAlertaProps {
  galponesDisponibles: { galponId: number; nombre: string }[];
  onGuardar: (nuevaAlerta: ConfiguracionAlerta) => void;
  alertaExistente?: ConfiguracionAlerta | null;
}

const AlertasPage = () => {
  const [alertas, setAlertas] = useState<ConfiguracionAlerta[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alertaEditando, setAlertaEditando] = useState<ConfiguracionAlerta | null>(null);
  const [galpones, setGalpones] = useState<{ galponId: number; nombre: string }[]>([]);

  useEffect(() => {
    setAlertas([
      {
        configId: 1,
        galponId: 1,
        tipo: "temperatura",
        rolANotificar: "Gerente,Operario",
        valorMin: 20,
        valorMax: 30,
        canalNotificacion: "WhatsApp",
        activa: true,
      },
      {
        configId: 2,
        galponId: 2,
        tipo: "humedad",
        rolANotificar: "Operario",
        valorMin: 40,
        valorMax: 60,
        canalNotificacion: "Email",
        activa: true,
      },
      {
        configId: 3,
        galponId: 3,
        tipo: "mortandad",
        rolANotificar: "Operario, Gerente",
        valorMin: 0,
        valorMax: 2,
        canalNotificacion: "WhatsApp",
        activa: true,
      },
    ]);

    setGalpones([
      { galponId: 1, nombre: "Galpón 1" },
      { galponId: 2, nombre: "Galpón 2" },
      { galponId: 3, nombre: "Galpón 3" },
    ]);
  }, []);

  const toggleAlerta = (configId: number) => {
    setAlertas((prev) =>
      prev.map((a) =>
        a.configId === configId ? { ...a, activa: !a.activa } : a
      )
    );
    setSuccessMsg("Estado de alerta actualizado.");
  };

  const eliminarAlerta = (configId: number) => {
    setAlertas((prev) => prev.filter((a) => a.configId !== configId));
    setSuccessMsg("Alerta eliminada correctamente.");
  };

  const handleGuardarAlerta = (nuevaAlerta: ConfiguracionAlerta) => {
    if (alertaEditando) {
      setAlertas((prev) =>
        prev.map((a) =>
          a.configId === alertaEditando.configId
            ? { ...nuevaAlerta, configId: alertaEditando.configId }
            : a
        )
      );
      setSuccessMsg("Alerta modificada correctamente.");
    } else {
      setAlertas((prev) => [
        ...prev,
        { ...nuevaAlerta, configId: Date.now() },
      ]);
      setSuccessMsg("Nueva alerta registrada.");
    }
    setAlertaEditando(null);
    setModalAbierto(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Alertas Configuradas
      </Typography>

      <Button
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => {
          setAlertaEditando(null);
          setModalAbierto(true);
        }}
        sx={{ mb: 3 }}
      >
        Nueva Alerta
      </Button>

      <Stack spacing={2}>
        {alertas.map((alerta) => (
          <Paper key={alerta.configId} sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="subtitle1">
                  {alerta.tipo} — Galpón #{alerta.galponId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notifica por {alerta.canalNotificacion} a {alerta.rolANotificar}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Modificar alerta">
                  <IconButton
                    onClick={() => {
                      setAlertaEditando(alerta);
                      setModalAbierto(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar alerta">
                  <IconButton onClick={() => eliminarAlerta(alerta.configId)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={alerta.activa ? "Desactivar" : "Activar"}>
                  <Switch
                    checked={alerta.activa}
                    onChange={() => toggleAlerta(alerta.configId)}
                  />
                </Tooltip>
                <IconButton
                  onClick={() =>
                    setExpandedId(
                      expandedId === alerta.configId ? null : alerta.configId
                    )
                  }
                >
                  {expandedId === alerta.configId ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Stack>
            </Stack>

            {expandedId === alerta.configId && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <b>Valor mínimo:</b> {alerta.valorMin} |{" "}
                  <b>Valor máximo:</b>{" "}
                  {alerta.tipo === "mortandad"
                    ? `${alerta.valorMax}%`
                    : alerta.valorMax}
                </Typography>
                <Typography variant="body2">
                  <b>Roles a notificar:</b> {alerta.rolANotificar}
                </Typography>
                <Typography variant="body2">
                  <b>Canal:</b> {alerta.canalNotificacion}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}

        {alertas.length === 0 && (
          <Typography color="text.secondary">
            No hay alertas configuradas.
          </Typography>
        )}
      </Stack>

      {/* Diálogo de creación o modificación de alerta */}
      <Dialog
        open={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setAlertaEditando(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {alertaEditando ? "Modificar Alerta" : "Nueva Configuración de Alerta"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormularioAlerta
            galponesDisponibles={galpones}
            onGuardar={handleGuardarAlerta}
            alertaExistente={alertaEditando}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setModalAbierto(false);
              setAlertaEditando(null);
            }}
          >
            Cancelar
          </Button>
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
};

export default AlertasPage;
