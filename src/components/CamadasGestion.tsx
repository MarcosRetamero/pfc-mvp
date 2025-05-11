"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import {
  Scale,
  LocalHospital,
  ExitToApp,
  PictureAsPdf,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";


interface CamadasGestionProps {
  camada: {
    camadaId: number;
    fechaIngreso: string;
    fechaSalida: string | null;
    proveedorId: number;
  };
}

export const CamadasGestion: React.FC<CamadasGestionProps> = ({ camada }) => {
  const router = useRouter();
  const [openPeso, setOpenPeso] = useState(false);
  const [openMortalidad, setOpenMortalidad] = useState(false);
  const [openFinalizacion, setOpenFinalizacion] = useState(false);
  const [motivoFinalizacion, setMotivoFinalizacion] = useState("");
  const [distribucionGalpon, setDistribucionGalpon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [causa, setCausa] = useState('');
  const [openReporte, setOpenReporte] = useState(false);

  useEffect(() => {
    const cargarDistribucion = async () => {
      try {
        const res = await fetch("/backend_nuevo.json");
        const data = await res.json();

        // Obtener la distribución para esta camada
        const distribucion = data.camadaGalpon
          .filter((cg: any) => cg.camadaId === camada.camadaId)
          .map((cg: any) => {
            const galpon = data.galpon.find(
              (g: any) => g.galponId === cg.galponId
            );
            return {
              ...cg,
              nombreGalpon: galpon ? galpon.nombre : `Galpón ${cg.galponId}`,
            };
          });

        setDistribucionGalpon(distribucion);
      } catch (error) {
        console.error("Error cargando distribución:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDistribucion();
  }, [camada.camadaId]);

  const handleRegistrarPeso = () => {
    setOpenPeso(true);
  };

  const handleRegistrarMortalidad = () => {
    setOpenMortalidad(true);
  };

  const handleFinalizarCamada = () => {
    setOpenFinalizacion(true);
  };

  const handleConfirmarFinalizacion = async () => {
    if (!motivoFinalizacion) return;
    try {
      // Aquí iría la lógica para finalizar la camada
      console.log("Finalizando camada:", camada.camadaId, motivoFinalizacion);
      setOpenFinalizacion(false);
      setMotivoFinalizacion("");
    } catch (error) {
      console.error("Error al finalizar camada:", error);
    }
  };

  const handleGenerarReporte = () => {
    setOpenReporte(true);
    router.push(`/camadas/${camada.camadaId}/informe`);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Sección de Distribución por Galpón */}
      <Typography variant="h6" gutterBottom>
        Distribución por Galpón
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Galpón</TableCell>
              <TableCell align="right">Cantidad de Aves</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distribucionGalpon.map((item) => (
              <TableRow key={item.camadaGalponId}>
                <TableCell>{item.nombreGalpon}</TableCell>
                <TableCell align="right">{item.cantidadInicial}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!camada.fechaSalida && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Acciones Disponibles
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-start">
            <Tooltip title="Registrar Peso">
              <Button
                variant="contained"
                startIcon={<Scale />}
                onClick={handleRegistrarPeso}
                color="primary"
              >
                Registrar Peso
              </Button>
            </Tooltip>
            <Tooltip title="Registrar Mortalidad">
              <Button
                variant="contained"
                startIcon={<LocalHospital />}
                onClick={handleRegistrarMortalidad}
                color="primary"
              >
                Registrar Mortalidad
              </Button>
            </Tooltip>
            <Tooltip title="Finalizar Camada">
              <Button
                variant="contained"
                startIcon={<ExitToApp />}
                onClick={handleFinalizarCamada}
                color="error"
              >
                Finalizar Camada
              </Button>
            </Tooltip>
            <Tooltip title="Generar Reporte">
              <Button
                variant="contained"
                startIcon={<PictureAsPdf />}
                onClick={handleGenerarReporte}
                color="primary"
              >
                Informe camada
              </Button>
            </Tooltip>
          </Stack>
        </>
      )}

      {/* Diálogo de Registro de Peso */}
      <Dialog open={openPeso} onClose={() => setOpenPeso(false)}>
        <DialogTitle>Registrar Peso Promedio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Peso Promedio (kg)"
            type="number"
            fullWidth
            variant="outlined"
            inputProps={{ step: "0.01" }}
          />
            <TextField
            margin="dense"
            label="Fecha"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          <TextField
            margin="dense"
            label="Tamaño de la Muestra"
            type="number"
            fullWidth
            variant="outlined"
            helperText="Cantidad de aves pesadas"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPeso(false)}>Cancelar</Button>
          <Button variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Registro de Mortalidad */}
      <Dialog open={openMortalidad} onClose={() => setOpenMortalidad(false)}>
        <DialogTitle>Registrar Mortalidad</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Cantidad"
            type="number"
            fullWidth
            variant="outlined"
          />
            <TextField
            margin="dense"
            label="Fecha"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            defaultValue={new Date().toISOString().split('T')[0]}
          />
<FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="causa-label">Causa</InputLabel>
            <Select
              labelId="causa-label"
              value={causa}
              onChange={(e) => setCausa(e.target.value)}
              required
              label="Causa"
            >
              <MenuItem value="enfermedad">Enfermedad</MenuItem>
              <MenuItem value="temperatura">Temperatura</MenuItem>
              <MenuItem value="accidente">Accidente</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </Select>
          </FormControl>
          {causa === 'otro' && (
            <TextField
              margin="dense"
              label="Especifique la causa"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMortalidad(false)}>Cancelar</Button>
          <Button variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Finalización */}
      <Dialog
        open={openFinalizacion}
        onClose={() => setOpenFinalizacion(false)}
      >
        <DialogTitle>Finalizar Camada</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo de Finalización"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={motivoFinalizacion}
            onChange={(e) => setMotivoFinalizacion(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalizacion(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmarFinalizacion}
            variant="contained"
            color="primary"
          >
            Confirmar Finalización
          </Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo de Previsualización de Reporte */}
      <Dialog
        open={openReporte}
        onClose={() => setOpenReporte(false)}
        maxWidth="md"
        fullWidth
      >
        {/* <DialogTitle>Previsualización del Reporte</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Camada #{camada.camadaId}
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Información General</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Fecha de Ingreso</TableCell>
                    <TableCell>{new Date(camada.fechaIngreso).toLocaleDateString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Días en Granja</TableCell>
                    <TableCell>
                      {Math.floor((new Date().getTime() - new Date(camada.fechaIngreso).getTime()) / (1000 * 60 * 60 * 24))} días
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total de Aves Inicial</TableCell>
                    <TableCell>{distribucionGalpon.reduce((sum, item) => sum + item.cantidadInicial, 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Registros del Día
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo de Registro</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Detalles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Último Peso Registrado</TableCell>
                    <TableCell>2.5 kg</TableCell>
                    <TableCell>Muestra de 100 aves</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Mortalidad del Día</TableCell>
                    <TableCell>5 aves</TableCell>
                    <TableCell>Causa: Temperatura</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReporte(false)}>Cerrar</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdf />}
          >
            Descargar PDF
          </Button>
        </DialogActions> */}
      </Dialog>
    </Box>
  );
};
