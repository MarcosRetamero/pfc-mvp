import {
  Typography, Box, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { WarningAmber, ErrorOutline, InfoOutlined, FiberManualRecord } from "@mui/icons-material"; // FiberManualRecord para 'normal'

// ... (Tipos Alerta y GalponDashboard permanecen igual) ...
type Alerta = {
  alertaId: number;
  seccionId: number;
  tipo: string; // Causa de la alerta (temperatura, humedad, etc.)
  descripcion: string;
  fechaHora: string;
  resuelta: boolean;
  resolucion: string;
  severidad?: "normal" | "precaucion" | "critico"; // Severidad calculada
};

type GalponDashboard = {
  galponId: number;
  nombre: string;
  temperatura: number;
  humedad: number;
  estado: "normal" | "precaucion" | "critico";
  pollosVivos: number;
  pollosFallecidos: number;
  alertas: Alerta[]; // Alertas activas para este galpón
};


interface AlertasListProps {
  galpones: GalponDashboard[];
}

// Función para calcular el tiempo relativo
const formatRelativeTime = (dateTimeString: string): string => {
  const now = new Date();
  const past = new Date(dateTimeString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Hace segundos";
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  return past.toLocaleDateString(); // Si es más antiguo, mostrar fecha
};


const AlertasList: React.FC<AlertasListProps> = ({ galpones }) => {
  // 1. Extraer y aplanar todas las alertas activas de todos los galpones
  const todasLasAlertas = galpones.flatMap(galpon =>
      galpon.alertas
          .filter(alerta => !alerta.resuelta) // Asegurarse de que solo mostramos activas
          .map(alerta => ({ ...alerta, nombreGalpon: galpon.nombre })) // Añadir nombre del galpón
  );

  // 2. Ordenar las alertas por fecha más reciente
  todasLasAlertas.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

  const getChipProps = (severidad?: "normal" | "precaucion" | "critico") => {
      switch (severidad) {
          case "critico":
              return { label: "Crítico", color: "error" as const, icon: <ErrorOutline /> };
          case "precaucion":
              return { label: "Precaución", color: "warning" as const, icon: <WarningAmber /> };
          case "normal": // Asumiendo que 'normal' también puede ser un tipo de alerta/evento
               return { label: "Normal", color: "success" as const, icon: <FiberManualRecord sx={{ fontSize: 12 }} /> };
          default:
              return { label: "Info", color: "info" as const, icon: <InfoOutlined /> };
      }
  };

  return (
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}> {/* Añadido margen superior */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom sx={{ color: 'black', fontWeight: 'bold', mb: 0 }}>
                  Alertas Recientes
              </Typography>
              {/* Aquí podrías añadir el botón de Filtrar si es necesario */}
              {/* <Button variant="outlined" size="small">Filtrar</Button> */}
          </Box>
           <Typography variant="body2" color="text.secondary" mb={3}>
              Monitoreo de alertas en todos los galpones
          </Typography>

          {todasLasAlertas.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                  No hay alertas activas en este momento.
              </Typography>
          ) : (
              <TableContainer>
                  <Table aria-label="tabla de alertas recientes">
                      <TableHead sx={{ backgroundColor: '#f9f9f9' }}>
                          <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Galpón</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Tipo</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Mensaje</TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: 'black' }} align="right">Tiempo</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {todasLasAlertas.map((alerta) => {
                              const chipProps = getChipProps(alerta.severidad);
                              return (
                                  <TableRow
                                      key={alerta.alertaId}
                                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                  >
                                      <TableCell component="th" scope="row">
                                          {alerta.nombreGalpon}
                                      </TableCell>
                                      <TableCell>
                                          <Chip
                                              label={chipProps.label}
                                              color={chipProps.color}
                                              size="small"
                                              variant="outlined" // O 'filled' si prefieres fondo de color
                                              // icon={chipProps.icon} // Descomenta si quieres icono dentro del chip
                                              sx={{ textTransform: 'capitalize' }}
                                          />
                                      </TableCell>
                                      <TableCell>{alerta.descripcion}</TableCell>
                                      <TableCell align="right">{formatRelativeTime(alerta.fechaHora)}</TableCell>
                                  </TableRow>
                              );
                          })}
                      </TableBody>
                  </Table>
              </TableContainer>
          )}
      </Paper>
  );
};

export default AlertasList;