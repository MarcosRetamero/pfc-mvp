"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Switch,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Tooltip as MuiTooltip,
  Slider,
  Stack,
  Divider,
  Container,
} from "@mui/material";
import {
  Thermostat,
  Opacity,
  PeopleAlt,
  DangerousOutlined,
  Air,
  Add,
  WaterDrop,
  Sensors,
  Lightbulb,
  ShowChart,
  History,
  NotificationsActive,
  ArrowBack,
  VerticalSplit,
  WarningAmber,
  ErrorOutline,
  InfoOutlined,
  FiberManualRecord,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

// --- Tipos (Idealmente centralizados) ---

type Usuario = {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  rol: number;
  activo: boolean;
  numero: number;
  ultimoLogin: string;
};
type Seccion = { seccionId: number; galponId: number; nombre: string };
type Sensor = {
  sensorId: number;
  seccionId: number;
  tipo: string;
  modelo: string;
  unidadMedida: string;
};
type LecturaSensor = {
  lecturaId: number;
  sensorId: number;
  valor: number;
  fechaHora: string;
};
type Dispositivo = {
  dispositivoId: number;
  seccionId: number;
  tipo: string;
  estadoInicial: string;
};
type LogDispositivo = {
  logId: number;
  dispositivoId: number;
  accion: string;
  fechaHora: string;
  usuarioId: number;
};
type AlertaJson = {
  alertaId: number;
  seccionId: number;
  tipo: string;
  descripcion: string;
  fechaHora: string;
  resuelta: boolean;
  resolucion: string;
  severidad?: "normal" | "precaucion" | "critico";
};
type Incidencia = {
  incidenciaId: number;
  fecha: string;
  descripcion: string;
  tipo: string;
  usuarioId: number;
  galponId: number;
  camadaId: number;
};
type LogSistema = {
  logId: number;
  usuarioId: number;
  descripcion: string;
  fechaHora: string;
  modulo: string;
  tipoAccion: string;
};
type CamadaGalpon = {
  camadaGalponId: number;
  camadaId: number;
  galponId: number;
  cantidadInicial: number;
};
type Mortalidad = {
  mortalidadId: number;
  camadaGalponId: number;
  fecha: string;
  cantidad: number;
  motivo: string;
};
type RegistroPeso = {
  pesoId: number;
  camadaGalponId: number;
  fecha: string;
  pesoPromedio: number;
  cantidadMuestra: number;
};

// Nuevo tipo para las cortinas del galpón
type CortinaGalpon = {
  cortinaId: number;
  galponId: number;
  lado: "izquierda" | "derecha";
  aperturaPorcentaje: number;
  ultimaActualizacion: string;
};

type GalponDashboard = {
  galponId: number;
  nombre: string;
  temperatura: number;
  humedad: number;
  estado: "normal" | "precaucion" | "critico";
  pollosVivos: number;
  pollosFallecidos: number;
  alertas: AlertaJson[];
};

type HistorialEvento = {
  id: string;
  fechaHora: string;
  evento: string;
  tipo: string;
  usuarioNombre: string;
};

type ChartDataPoint = {
  time: string;
  temperatura?: number;
  humedad?: number;
};

const statCardStyles = {
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: 2,
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 2,
  },
  value: {
    fontSize: "2rem",
    fontWeight: "bold",
    lineHeight: 1,
  },
};

interface GalponDetalleProps {
  galpon: GalponDashboard | undefined;
  onVolver: () => void;
}

// --- Funciones de Utilidad ---

const formatDateTime = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    // Si la hora es 00:00, solo mostrar la fecha
    if (hours === "00" && minutes === "00") {
      return `${year}-${month}-${day}`;
    }
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date:", dateTimeString, e);
    return "Fecha inválida";
  }
};

const formatRelativeTime = (dateTimeString: string): string => {
  try {
    const now = new Date();
    const past = new Date(dateTimeString);
    if (isNaN(past.getTime())) return "Fecha inválida";

    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Hace segundos";
    if (diffInMinutes < 60)
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;
    if (diffInHours < 24)
      return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    if (diffInDays < 7)
      return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
    return past.toLocaleDateString("es-ES"); // Formato local para fechas más antiguas
  } catch (e) {
    console.error("Error formatting relative time:", dateTimeString, e);
    return "Fecha inválida";
  }
};

const getChipProps = (severidad?: "normal" | "precaucion" | "critico") => {
  switch (severidad) {
    case "critico":
      return {
        label: "Crítico",
        color: "error" as const,
        icon: <ErrorOutline />,
      };
    case "precaucion":
      return {
        label: "Precaución",
        color: "warning" as const,
        icon: <WarningAmber />,
      };
    case "normal":
      // Usamos un punto pequeño para 'normal' si no hay icono específico
      return {
        label: "Normal",
        color: "success" as const,
        icon: <FiberManualRecord sx={{ fontSize: 12 }} />,
      };
    default:
      return { label: "Info", color: "info" as const, icon: <InfoOutlined /> };
  }
};

// Nuevo tipo para el estado de los dispositivos por sección
type DispositivoControl = {
  id: number; // dispositivoId
  tipo: string; // 'Ventilador', 'Aspersor', 'Cortina', 'Luz'
  estado: boolean; // true para ON, false para OFF
};

type SeccionConControles = Seccion & {
  dispositivos: DispositivoControl[];
  temperatura?: number | null;
  humedad?: number | null;
};

const GalponDetalle: React.FC<GalponDetalleProps> = ({ galpon, onVolver }) => {
  const router = useRouter();
  const [tabIndex, setTabIndex] = useState(0);

  const [historialGalpon, setHistorialGalpon] = useState<HistorialEvento[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  const [seccionesDetalle, setSeccionesDetalle] = useState<
    SeccionConControles[]
  >([]);
  const [loadingSeccionesDetalle, setLoadingSeccionesDetalle] = useState(true);

  // Estado para las cortinas del galpón
  const [cortinasGalpon, setCortinasGalpon] = useState<{
    izquierda: number;
    derecha: number;
  }>({
    izquierda: 0,
    derecha: 0,
  });
  const [loadingCortinas, setLoadingCortinas] = useState(true);
  const [guardandoCortinas, setGuardandoCortinas] = useState(false);

  // useEffect para cargar historial
  useEffect(() => {
    if (galpon) {
      const cargarHistorial = async () => {
        setLoadingHistorial(true);
        setErrorHistorial(null);
        try {
          const response = await fetch("/backend_nuevo.json");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const {
            usuario: usuarios = [],
            seccion: secciones = [],
            dispositivo: dispositivos = [],
            logDispositivo = [],
            alerta: alertasJson = [],
            incidencia: incidencias = [],
            logSistema = [],
            camadaGalpon = [],
            mortalidad = [],
            registroPeso = [],
          } = data;

          const getUsuarioNombre = (
            userId: number | null | undefined
          ): string => {
            if (userId === null || userId === undefined) return "Sistema";
            const user = usuarios.find((u: Usuario) => u.usuarioId === userId);
            return user ? user.nombreUsuario : `Usuario ${userId}`;
          };
          const getSeccion = (seccionId: number): Seccion | undefined =>
            secciones.find((s: Seccion) => s.seccionId === seccionId);
          const getDispositivo = (
            dispositivoId: number
          ): Dispositivo | undefined =>
            dispositivos.find(
              (d: Dispositivo) => d.dispositivoId === dispositivoId
            );

          const camadaGalponMap = new Map<number, number>();
          camadaGalpon.forEach((cg: CamadaGalpon) =>
            camadaGalponMap.set(cg.camadaGalponId, cg.galponId)
          );

          const seccionesDelGalponIds = secciones
            .filter((s: Seccion) => s.galponId === galpon.galponId)
            .map((s: Seccion) => s.seccionId);

          let eventosCombinados: HistorialEvento[] = [];

          logDispositivo.forEach((log: LogDispositivo) => {
            const dispositivo = getDispositivo(log.dispositivoId);
            if (
              dispositivo &&
              seccionesDelGalponIds.includes(dispositivo.seccionId)
            ) {
              const seccion = getSeccion(dispositivo.seccionId);
              eventosCombinados.push({
                id: `logDisp-${log.logId}`,
                fechaHora: log.fechaHora,
                evento: `Dispositivo '${dispositivo.tipo}' (${
                  seccion?.nombre || "Sección Desconocida"
                }) ${log.accion === "ON" ? "encendido" : "apagado"}`,
                tipo: "Dispositivo",
                usuarioNombre: getUsuarioNombre(log.usuarioId),
              });
            }
          });

          alertasJson.forEach((alerta: AlertaJson) => {
            if (
              alerta.seccionId &&
              seccionesDelGalponIds.includes(alerta.seccionId)
            ) {
              // Asegurarse que alerta.seccionId existe
              const seccion = getSeccion(alerta.seccionId);
              eventosCombinados.push({
                id: `alerta-${alerta.alertaId}`,
                fechaHora: alerta.fechaHora,
                evento: `Alerta ${alerta.severidad || alerta.tipo}: ${
                  alerta.descripcion
                } (${seccion?.nombre || "Sección Desconocida"}) ${
                  alerta.resuelta
                    ? `(Resuelta: ${alerta.resolucion || "OK"})`
                    : ""
                }`,
                tipo: "Alerta",
                usuarioNombre: "Sistema",
              });
            }
          });

          incidencias.forEach((inc: Incidencia) => {
            if (inc.galponId === galpon.galponId) {
              eventosCombinados.push({
                id: `inc-${inc.incidenciaId}`,
                fechaHora: inc.fecha,
                evento: `Incidencia (${inc.tipo}): ${inc.descripcion}`,
                tipo: "Incidencia",
                usuarioNombre: getUsuarioNombre(inc.usuarioId),
              });
            }
          });

          logSistema.forEach((log: LogSistema) => {
            if (
              log.descripcion
                .toLowerCase()
                .includes(galpon.nombre.toLowerCase())
            ) {
              eventosCombinados.push({
                id: `logSys-${log.logId}`,
                fechaHora: log.fechaHora,
                evento: `Sistema (${log.modulo}): ${log.descripcion}`,
                tipo: "Sistema",
                usuarioNombre: getUsuarioNombre(log.usuarioId),
              });
            }
          });

          mortalidad.forEach((mort: Mortalidad) => {
            const galponIdAsociado = camadaGalponMap.get(mort.camadaGalponId);
            if (galponIdAsociado === galpon.galponId) {
              eventosCombinados.push({
                id: `mort-${mort.mortalidadId}`,
                fechaHora: mort.fecha,
                evento: `Mortalidad registrada: ${
                  mort.cantidad
                } ave(s). Motivo: ${mort.motivo || "No especificado"}`,
                tipo: "Mortalidad",
                usuarioNombre: "Operario",
              });
            }
          });

          registroPeso.forEach((peso: RegistroPeso) => {
            const galponIdAsociado = camadaGalponMap.get(peso.camadaGalponId);
            if (galponIdAsociado === galpon.galponId) {
              eventosCombinados.push({
                id: `peso-${peso.pesoId}`,
                fechaHora: peso.fecha,
                evento: `Registro de peso: ${peso.pesoPromedio.toFixed(
                  2
                )} kg (muestra: ${peso.cantidadMuestra})`,
                tipo: "Peso",
                usuarioNombre: "Operario",
              });
            }
          });

          eventosCombinados.sort(
            (a, b) =>
              new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
          );
          setHistorialGalpon(eventosCombinados);
        } catch (error) {
          console.error("Error fetching or processing historial:", error);
          setErrorHistorial(
            error instanceof Error
              ? error.message
              : "Error desconocido al cargar el historial."
          );
          setHistorialGalpon([]);
        } finally {
          setLoadingHistorial(false);
        }
      };
      cargarHistorial();
    } else {
      setHistorialGalpon([]);
      setLoadingHistorial(false);
      setErrorHistorial(null);
    }
  }, [galpon]);

  // useEffect para cargar datos del gráfico
  useEffect(() => {
    if (galpon) {
      const fetchChartData = async () => {
        setLoadingChart(true);
        try {
          const response = await fetch("/backend_nuevo.json");
          const data = await response.json();
          const seccionesGalpon = data.seccion.filter(
            (s: Seccion) => s.galponId === galpon.galponId
          );
          const seccionIds = seccionesGalpon.map((s: Seccion) => s.seccionId);
          const sensoresGalpon = data.sensor.filter(
            (sensor: Sensor) =>
              seccionIds.includes(sensor.seccionId) &&
              (sensor.tipo === "temperatura" || sensor.tipo === "humedad")
          );
          const sensorIds = sensoresGalpon.map(
            (sensor: Sensor) => sensor.sensorId
          );
          const lecturasRelevantes = data.lecturaSensor.filter(
            (lectura: LecturaSensor) => sensorIds.includes(lectura.sensorId)
          );
          const processedData: {
            [time: string]: { temps: number[]; hums: number[] };
          } = {};
          lecturasRelevantes.forEach((lectura: LecturaSensor) => {
            const sensor = sensoresGalpon.find(
              (s: Sensor) => s.sensorId === lectura.sensorId
            );
            if (!sensor) return;
            const time = new Date(lectura.fechaHora).toLocaleTimeString(
              "es-ES",
              { hour: "2-digit", minute: "2-digit" }
            );
            if (!processedData[time]) {
              processedData[time] = { temps: [], hums: [] };
            }
            if (sensor.tipo === "temperatura") {
              processedData[time].temps.push(lectura.valor);
            } else if (sensor.tipo === "humedad") {
              processedData[time].hums.push(lectura.valor);
            }
          });
          const finalChartData = Object.entries(processedData)
            .map(([time, values]) => {
              const avgTemp =
                values.temps.length > 0
                  ? values.temps.reduce((a, b) => a + b, 0) /
                    values.temps.length
                  : undefined;
              const avgHum =
                values.hums.length > 0
                  ? values.hums.reduce((a, b) => a + b, 0) / values.hums.length
                  : undefined;
              return {
                time,
                temperatura:
                  avgTemp !== undefined
                    ? parseFloat(avgTemp.toFixed(1))
                    : undefined,
                humedad:
                  avgHum !== undefined
                    ? parseFloat(avgHum.toFixed(1))
                    : undefined,
              };
            })
            .sort((a, b) => {
              const [hA, mA] = a.time.split(":").map(Number);
              const [hB, mB] = b.time.split(":").map(Number);
              if (hA !== hB) return hA - hB;
              return mA - mB;
            });
          setChartData(finalChartData);
        } catch (error) {
          console.error("Error fetching or processing chart data:", error);
          setChartData([]);
        } finally {
          setLoadingChart(false);
        }
      };
      fetchChartData();
    } else {
      setChartData([]);
      setLoadingChart(false);
    }
  }, [galpon]);

  // useEffect para cargar detalles de secciones y estado de sus dispositivos
  useEffect(() => {
    if (galpon) {
      const cargarDetallesSecciones = async () => {
        setLoadingSeccionesDetalle(true);
        try {
          const response = await fetch("/backend_nuevo.json");
          const data = await response.json();

          const todasLasSecciones: Seccion[] = data.seccion || [];
          const todosLosDispositivos: Dispositivo[] = data.dispositivo || [];
          const todosLosLogsDispositivos: LogDispositivo[] =
            data.logDispositivo || [];
          const todosLosSensores: Sensor[] = data.sensor || [];
          const todasLasLecturas: LecturaSensor[] = data.lecturaSensor || [];

          const seccionesDelGalpon = todasLasSecciones.filter(
            (s) => s.galponId === galpon.galponId
          );

          const seccionesConInfoCompleta = seccionesDelGalpon.map((sec) => {
            const dispositivosDeLaSeccion = todosLosDispositivos.filter(
              (d) => d.seccionId === sec.seccionId
            );

            const controlesDispositivos = dispositivosDeLaSeccion.map(
              (disp) => {
                const logsDelDispositivo = todosLosLogsDispositivos
                  .filter((log) => log.dispositivoId === disp.dispositivoId)
                  .sort(
                    (a, b) =>
                      new Date(b.fechaHora).getTime() -
                      new Date(a.fechaHora).getTime()
                  );

                let estadoActual = disp.estadoInicial.toUpperCase() === "ON";
                if (logsDelDispositivo.length > 0) {
                  estadoActual =
                    logsDelDispositivo[0].accion.toUpperCase() === "ON";
                }
                return {
                  id: disp.dispositivoId,
                  tipo: disp.tipo,
                  estado: estadoActual,
                };
              }
            );

            const sensoresDeLaSeccion = todosLosSensores.filter(
              (s) => s.seccionId === sec.seccionId
            );
            let tempSect: number | null = null;
            let humSect: number | null = null;

            const lecturasTemp = sensoresDeLaSeccion
              .filter((s) => s.tipo.toLowerCase() === "temperatura")
              .flatMap((s) =>
                todasLasLecturas
                  .filter((l) => l.sensorId === s.sensorId)
                  .sort(
                    (a, b) =>
                      new Date(b.fechaHora).getTime() -
                      new Date(a.fechaHora).getTime()
                  )
              )
              .map((l) => l.valor);

            if (lecturasTemp.length > 0)
              tempSect = parseFloat(lecturasTemp[0].toFixed(1));

            const lecturasHum = sensoresDeLaSeccion
              .filter((s) => s.tipo.toLowerCase() === "humedad")
              .flatMap((s) =>
                todasLasLecturas
                  .filter((l) => l.sensorId === s.sensorId)
                  .sort(
                    (a, b) =>
                      new Date(b.fechaHora).getTime() -
                      new Date(a.fechaHora).getTime()
                  )
              )
              .map((l) => l.valor);

            if (lecturasHum.length > 0)
              humSect = parseFloat(lecturasHum[0].toFixed(1));

            return {
              ...sec,
              dispositivos: controlesDispositivos,
              temperatura: tempSect,
              humedad: humSect,
            };
          });

          setSeccionesDetalle(seccionesConInfoCompleta);
        } catch (error) {
          console.error(
            "Error fetching or processing secciones detalle:",
            error
          );
          setSeccionesDetalle([]);
        } finally {
          setLoadingSeccionesDetalle(false);
        }
      };
      cargarDetallesSecciones();
    } else {
      setSeccionesDetalle([]);
      setLoadingSeccionesDetalle(false);
    }
  }, [galpon]);

  // Nuevo useEffect para cargar el estado de las cortinas
  useEffect(() => {
    if (galpon) {
      const cargarCortinas = async () => {
        setLoadingCortinas(true);
        try {
          const response = await fetch("/backend_nuevo.json");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          // Buscar las cortinas para este galpón
          const cortinas: CortinaGalpon[] = data.cortinaGalpon || [];
          const cortinasDelGalpon = cortinas.filter(
            (c) => c.galponId === galpon.galponId
          );

          // Inicializar valores por defecto
          let aperturaIzquierda = 0;
          let aperturaDerecha = 0;

          // Obtener valores de las cortinas si existen
          const cortinaIzquierda = cortinasDelGalpon.find(
            (c) => c.lado === "izquierda"
          );
          const cortinaDerecha = cortinasDelGalpon.find(
            (c) => c.lado === "derecha"
          );

          if (cortinaIzquierda) {
            aperturaIzquierda = cortinaIzquierda.aperturaPorcentaje;
          }

          if (cortinaDerecha) {
            aperturaDerecha = cortinaDerecha.aperturaPorcentaje;
          }

          setCortinasGalpon({
            izquierda: aperturaIzquierda,
            derecha: aperturaDerecha,
          });
        } catch (error) {
          console.error("Error cargando datos de cortinas:", error);
        } finally {
          setLoadingCortinas(false);
        }
      };

      cargarCortinas();
    }
  }, [galpon]);

  const handleDispositivoChange = (
    seccionId: number,
    dispositivoId: number,
    nuevoEstado: boolean
  ) => {
    setSeccionesDetalle((prevSecciones) =>
      prevSecciones.map((seccion) => {
        if (seccion.seccionId === seccionId) {
          return {
            ...seccion,
            dispositivos: seccion.dispositivos.map((disp) =>
              disp.id === dispositivoId
                ? { ...disp, estado: nuevoEstado }
                : disp
            ),
          };
        }
        return seccion;
      })
    );

    // Simular guardado en el backend
    console.log(
      `Dispositivo ${dispositivoId} en sección ${seccionId} cambiado a ${
        nuevoEstado ? "ON" : "OFF"
      }`
    );
  };

  // Función para actualizar el porcentaje de apertura de las cortinas
  const handleCambioApertura = (
    lado: "izquierda" | "derecha",
    valor: number
  ) => {
    setCortinasGalpon((prev) => ({
      ...prev,
      [lado]: valor,
    }));
  };

  // Función para guardar los cambios en las cortinas
  const guardarCambiosCortinas = async () => {
    if (!galpon) return;

    setGuardandoCortinas(true);
    try {
      // En una aplicación real, aquí se enviaría una petición al backend
      // para actualizar los valores de las cortinas
      console.log("Guardando cambios en cortinas:", {
        galponId: galpon.galponId,
        cortinas: cortinasGalpon,
      });

      // Simulamos un retraso para mostrar el estado de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Aquí se agregaría un evento al historial
      const nuevoEvento: HistorialEvento = {
        id: `cortina-${Date.now()}`,
        fechaHora: new Date().toISOString(),
        evento: `Cortinas ajustadas - Izquierda: ${cortinasGalpon.izquierda}%, Derecha: ${cortinasGalpon.derecha}%`,
        tipo: "Dispositivo",
        usuarioNombre: "Usuario Actual", // Idealmente obtener del contexto de autenticación
      };

      setHistorialGalpon((prev) => [nuevoEvento, ...prev]);
    } catch (error) {
      console.error("Error guardando cambios en cortinas:", error);
    } finally {
      setGuardandoCortinas(false);
    }
  };

  const handleCrearAlerta = () => {
    router.push("/alertas");
  };

  // Función para manejar el cambio de pestaña
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  if (!galpon) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            No se ha seleccionado ningún galpón
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={onVolver}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Volver
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={onVolver}
            variant="outlined"
            size="small"
          >
            Volver
          </Button>
          <Typography variant="h4" component="h1" className="text-black">
            {galpon?.nombre || "Galpón"}
          </Typography>
          {galpon?.estado && (
              <Chip
              {...getChipProps(galpon.estado)}
              size="small"
              sx={{ ml: "auto" }}
              />
            )}
            
        </Stack>
          {/* Encabezado con botón alineado */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
        py={2}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCrearAlerta} // Asegurate de definir esta función
          title="Registrar una nueva alerta manual" // Personalizá el tooltip según necesidad
        >
          Configurar Alerta
        </Button>
      </Box>
        {/* Panel de Resumen */}
        <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
          <Grid
            container
            spacing={3}
            sx={{
              display: "flex",
              "& .MuiGrid-item": {
                display: "flex",
                flex: 1,
                "& > *": {
                  width: "100%",
                },
              },
            }}
          >
            {/* Temperatura */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  ...statCardStyles.card,
                  width: "100%",
                  height: "100%",
                  p: 2,
                }}
                elevation={1}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={statCardStyles.iconWrapper}>
                    <Thermostat color="error" />
                    <Typography variant="subtitle1" color="text.secondary">
                      Temperatura
                    </Typography>
                  </Box>
                  <Typography sx={statCardStyles.value} color="error">
                    {galpon?.temperatura.toFixed(1)}°C
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>

            {/* Humedad */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  ...statCardStyles.card,
                  width: "100%",
                  height: "100%",
                  p: 2,
                }}
                elevation={1}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={statCardStyles.iconWrapper}>
                    <Opacity color="primary" />
                    <Typography variant="subtitle1" color="text.secondary">
                      Humedad
                    </Typography>
                  </Box>
                  <Typography sx={statCardStyles.value} color="primary">
                    {galpon?.humedad.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>

            {/* Aves Vivas */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  ...statCardStyles.card,
                  width: "100%",
                  height: "100%",
                  p: 2,
                }}
                elevation={1}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={statCardStyles.iconWrapper}>
                    <PeopleAlt color="success" />
                    <Typography variant="subtitle1" color="text.secondary">
                      Aves Vivas
                    </Typography>
                  </Box>
                  <Typography sx={statCardStyles.value} color="success.main">
                    {galpon?.pollosVivos.toLocaleString()}
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>

            {/* Mortalidad */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  ...statCardStyles.card,
                  width: "100%",
                  height: "100%",
                  p: 2,
                }}
                elevation={1}
              >
                <CardContent
                  sx={{
                    p: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={statCardStyles.iconWrapper}>
                    <DangerousOutlined color="error" />
                    <Typography variant="subtitle1" color="text.secondary">
                      Mortalidad
                    </Typography>
                  </Box>
                  <Typography sx={statCardStyles.value} color="error">
                    {galpon?.pollosFallecidos}
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {/* Control de Cortinas a nivel Galpón */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Control de Cortinas del Galpón
        </Typography>

        {loadingCortinas ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ p: 2 }}
          >
            <CircularProgress size={24} />
            <Typography>Cargando estado de cortinas...</Typography>
          </Stack>
        ) : (
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VerticalSplit color="primary" />
                  <Typography>Cortina Izquierda:</Typography>
                  <Chip label={`${cortinasGalpon.izquierda}%`} size="small" />
                </Stack>
                <Slider
                  value={cortinasGalpon.izquierda}
                  onChange={(_, value) =>
                    handleCambioApertura("izquierda", value as number)
                  }
                  aria-labelledby="cortina-izquierda-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VerticalSplit
                    color="primary"
                    sx={{ transform: "scaleX(-1)" }}
                  />
                  <Typography>Cortina Derecha:</Typography>
                  <Chip label={`${cortinasGalpon.derecha}%`} size="small" />
                </Stack>
                <Slider
                  value={cortinasGalpon.derecha}
                  onChange={(_, value) =>
                    handleCambioApertura("derecha", value as number)
                  }
                  aria-labelledby="cortina-derecha-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth // <--- Ocupa todo el ancho en su celda de Grid
                variant="contained"
                onClick={guardarCambiosCortinas}
                disabled={guardandoCortinas}
                startIcon={
                  guardandoCortinas ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {guardandoCortinas ? "Guardando..." : "Aplicar"}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>
      {/* Control de Secciones */}
      <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Control de Secciones
        </Typography>

        {loadingSeccionesDetalle ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ p: 4 }}
          >
            <CircularProgress />
            <Typography>Cargando secciones...</Typography>
          </Stack>
        ) : seccionesDetalle.length > 0 ? (
          <Grid container spacing={3}>
            {seccionesDetalle.map((seccion) => (
              <Grid item xs={12} sm={6} md={4} key={seccion.seccionId}>
                {" "}
                {/* <--- Ajustado para mejor responsividad */}
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  elevation={2}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {seccion.nombre}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      {seccion.temperatura !== null && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Thermostat color="error" fontSize="small" />
                          <Typography variant="body2">
                            {seccion.temperatura}°C
                          </Typography>
                        </Stack>
                      )}
                      {seccion.humedad !== null && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Opacity color="primary" fontSize="small" />
                          <Typography variant="body2">
                            {seccion.humedad}%
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Dispositivos
                    </Typography>

                    <Stack spacing={1.5}>
                      {" "}
                      {/* <--- Usando Stack para la lista de dispositivos */}
                      {seccion.dispositivos.map((disp) => {
                        let icon;
                        let color = disp.estado ? "primary" : "action"; // 'action' para color grisáceo de íconos desactivados

                        switch (disp.tipo.toLowerCase()) {
                          case "ventilador":
                            icon = <Air color={color} />;
                            break;
                          case "aspersor":
                            icon = <WaterDrop color={color} />;
                            break;
                          case "luz":
                            icon = (
                              <Lightbulb
                                color={disp.estado ? "warning" : "action"}
                              />
                            );
                            break;
                          default:
                            icon = <Sensors color={color} />;
                        }

                        return (
                          <Paper
                            key={disp.id}
                            variant="outlined"
                            sx={{ p: 1.5, borderRadius: 2 }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                {icon}
                                <Typography
                                  variant="body2"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {disp.tipo}
                                </Typography>
                              </Stack>
                              <Switch
                                size="small"
                                checked={disp.estado}
                                onChange={(e) =>
                                  handleDispositivoChange(
                                    seccion.seccionId,
                                    disp.id,
                                    e.target.checked
                                  )
                                }
                                color="primary"
                              />
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            sx={{ textAlign: "center", p: 4, color: "text.secondary" }}
          >
            No hay secciones configuradas para este galpón.
          </Typography>
        )}
      </Paper>
      {/* Pestañas para diferentes secciones */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="galpon-tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<ShowChart />}
            iconPosition="start"
            label="Gráficos"
            id="tab-0"
          />
          <Tab
            icon={<History />}
            iconPosition="start"
            label="Historial"
            id="tab-1"
          />
          <Tab
            icon={<NotificationsActive />}
            iconPosition="start"
            label="Alertas"
            id="tab-2"
          />
        </Tabs>
      </Box>
      {/* Contenido de las pestañas */}
      <Box>
        {/* Pestaña de Gráficos */}
        {tabIndex === 0 && (
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={2}>
            {" "}
            {/* <--- Padding responsivo */}
            <Typography variant="h6" gutterBottom>
              Evolución de Temperatura y Humedad
            </Typography>
            {loadingChart ? (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ p: 4 }}
              >
                <CircularProgress />
                <Typography>Cargando gráfico...</Typography>
              </Stack>
            ) : chartData.length > 0 ? (
              <Box sx={{ height: { xs: 300, md: 400 }, width: "100%" }}>
                {" "}
                {/* <--- Altura responsiva */}
                <ResponsiveContainer>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    {" "}
                    {/* <--- Ajustado margen izquierdo */}
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#8884d8"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#82ca9d"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperatura"
                      stroke="#8884d8"
                      name="Temp (°C)"
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="humedad"
                      stroke="#82ca9d"
                      name="Hum (%)"
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography
                sx={{ textAlign: "center", p: 4, color: "text.secondary" }}
              >
                No hay datos disponibles para mostrar en el gráfico.
              </Typography>
            )}
          </Paper>
        )}

        {/* Pestaña de Historial */}
        {tabIndex === 1 && (
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Historial de Eventos
            </Typography>
            {loadingHistorial ? (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ p: 4 }}
              >
                <CircularProgress />
                <Typography>Cargando historial...</Typography>
              </Stack>
            ) : errorHistorial ? (
              <Typography color="error" sx={{ p: 2, textAlign: "center" }}>
                Error: {errorHistorial}
              </Typography>
            ) : historialGalpon.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  {/* Remove any whitespace here */}
                  <TableHead>
                    {/* Keep these tags together */}
                    <TableRow>
                      <TableCell>Fecha/Hora</TableCell>
                      <TableCell>Evento</TableCell>
                      <TableCell>Usuario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Keep table body tight with its rows */}
                    {historialGalpon.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>
                          {formatDateTime(evento.fechaHora)}
                        </TableCell>
                        <TableCell>{evento.evento}</TableCell>
                        <TableCell>{evento.usuarioNombre}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                sx={{ textAlign: "center", p: 4, color: "text.secondary" }}
              >
                No hay eventos registrados para este galpón.
              </Typography>
            )}
          </Paper>
        )}

        {/* Pestaña de Alertas */}
        {tabIndex === 2 && (
          <Paper sx={{ p: { xs: 2, md: 3 } }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Alertas Activas
            </Typography>
            {galpon.alertas && galpon.alertas.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Severidad</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        Fecha/Hora
                      </TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {galpon.alertas.map((alerta) => {
                      const chipProps = getChipProps(alerta.severidad);
                      return (
                        <TableRow hover key={alerta.alertaId}>
                          <TableCell>
                            <Chip
                              icon={chipProps.icon}
                              label={chipProps.label}
                              color={chipProps.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {alerta.descripcion}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: "none", md: "table-cell" } }}
                          >
                            <MuiTooltip
                              title={formatDateTime(alerta.fechaHora)}
                            >
                              <Typography variant="body2">
                                {formatRelativeTime(alerta.fechaHora)}
                              </Typography>
                            </MuiTooltip>
                          </TableCell>
                          <TableCell>
                            {alerta.resuelta ? (
                              <Chip
                                label="Resuelta"
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Chip label="Activa" color="error" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                sx={{ textAlign: "center", p: 4, color: "text.secondary" }}
              >
                No hay alertas activas para este galpón.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default GalponDetalle;
