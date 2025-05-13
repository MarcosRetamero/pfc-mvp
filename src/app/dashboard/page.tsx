"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import EstadisticasGenerales from "@/components/estadisticasGenerales";
import GalponCard from "@/components/galponCard";
import AlertasList from "@/components/alertasList";
import GalponDetalle from "@/components/galponDetalle"; // Importa el nuevo componente

// --- Tipos basados en backend_nuevo.json ---


type Rol = {
  rolId: number;
  nombre: string;
  descripcion: string;
};

type Usuario = {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  rol: number;
  activo: boolean;
  numero: number;
  ultimoLogin: string;
};

type Proveedor = {
  proveedorId: number;
  nombre: string;
  email: string;
};

type GalponInfo = {
  // Renombrado para evitar conflicto con el tipo Galpon enriquecido
  galponId: number;
  nombre: string;
  superficieM2: number;
  cantidadSecciones: number;
  capacidadMax: number;
  capacidadSiloKg: number;
};

type Seccion = {
  seccionId: number;
  galponId: number;
  nombre: string;
};

type Sensor = {
  sensorId: number;
  seccionId: number;
  tipo: string; // "temperatura", "humedad", etc.
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

type Camada = {
  camadaId: number;
  fechaIngreso: string;
  fechaSalida: string | null;
  proveedorId: number;
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

type ReposicionAlimento = {
  reposicionId: number;
  galponId: number;
  fechaReposicion: string;
  tipoAlimento: string;
  cantidadKg: number;
  fechaEstimadoFin: string;
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

type VisitaVeterinaria = {
  visitaId: number;
  camadaId: number;
  fecha: string;
  profesional: string;
  descripcion: string;
  medicacion: string;
  severidad: string;
};

type ClimaExterno = {
  climaId: number;
  fechaHora: string;
  temperatura: number;
  humedad: number;
  viento: number;
  direccionViento: string;
  lluvia: boolean;
  presion: number;
};

type Alerta = {
  alertaId: number;
  seccionId: number;
  tipo: string; // "temperatura", "humedad", etc. Describe la causa
  descripcion: string;
  fechaHora: string;
  resuelta: boolean;
  resolucion: string;
  // Añadiremos severidad derivada
  severidad?: "normal" | "precaucion" | "critico";
};

type ConfiguracionAlerta = {
  configId: number;
  galponId: number;
  variable: string; // "temperatura", "humedad"
  rolANotificar: string;
  valorMin: number;
  valorMax: number;
  canalNotificacion: string;
};

type InformeDiario = {
  informeId: number;
  camadaId: number;
  fecha: string;
  diasVidaCamada: number;
  avesVivas: number;
  avesFallecidasHoy: number;
  mortalidadAcumulada: number;
  motivoFallecimiento: string;
  ultimoPesoPromedio: number;
  requiereVeterinario: boolean;
  reposicionAlimentoNecesaria: boolean;
  incidencia: string;
  enviado: boolean;
};

type LogSistema = {
  logId: number;
  usuarioId: number;
  descripcion: string;
  fechaHora: string;
  modulo: string;
  tipoAccion: string;
};

// Tipo enriquecido para la UI del Dashboard
type GalponDashboard = {
  galponId: number;
  nombre: string;
  superficieM2: number;
  cantidadSecciones: number;
  capacidadMax: number;
  capacidadSiloKg: number;
  temperatura: number;
  humedad: number;
  estado: "normal" | "precaucion" | "critico";
  pollosVivos: number;
  pollosFallecidos: number;
  alertas: Alerta[];
};

// --- Componente ---

export default function DashboardPage() {
  const [galponesDashboard, setGalponesDashboard] = useState<GalponDashboard[]>(
    []
  );
  const [tab, setTab] = useState(0);
  const [galponSeleccionado, setGalponSeleccionado] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [climaExterno, setClimaExterno] = useState<ClimaExterno | null>(null);

  useEffect(() => {
    const cargarYProcesarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/backend_nuevo.json");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        const {
          galpon: galponesInfo, // Array de GalponInfo
          seccion: secciones, // Array de Seccion
          sensor: sensores, // Array de Sensor
          lecturaSensor: lecturas, // Array de LecturaSensor
          alerta: alertas, // Array de Alerta
          configuracionAlerta: configsAlerta, // Array de ConfiguracionAlerta
          camadaGalpon: camadasGalpon, // Array de CamadaGalpon
          mortalidad: mortalidades, // Array de Mortalidad
        } = data;

        // 1. Procesar lecturas y alertas para determinar estado y promedios por galpón
        const galponesProcesados: GalponDashboard[] = galponesInfo.map(
          (g: GalponInfo) => {
            const seccionesDelGalpon = secciones.filter(
              (s: Seccion) => s.galponId === g.galponId
            );
            const idSeccionesDelGalpon = seccionesDelGalpon.map(
              (s: Seccion) => s.seccionId
            );

            const sensoresDelGalpon = sensores.filter((sen: Sensor) =>
              idSeccionesDelGalpon.includes(sen.seccionId)
            );
            const idSensoresDelGalpon = sensoresDelGalpon.map(
              (sen: Sensor) => sen.sensorId
            );

            // Obtener las últimas lecturas de cada sensor del galpón
            const ultimasLecturasMap = new Map<number, LecturaSensor>();
            lecturas
              .filter((l: LecturaSensor) =>
                idSensoresDelGalpon.includes(l.sensorId)
              )
              .sort(
                (a: LecturaSensor, b: LecturaSensor) =>
                  new Date(b.fechaHora).getTime() -
                  new Date(a.fechaHora).getTime()
              )
              .forEach((l: LecturaSensor) => {
                if (!ultimasLecturasMap.has(l.sensorId)) {
                  ultimasLecturasMap.set(l.sensorId, l);
                }
              });
            const ultimasLecturas = Array.from(ultimasLecturasMap.values());

            // Calcular promedios de temperatura y humedad
            let tempSum = 0;
            let tempCount = 0;
            let humSum = 0;
            let humCount = 0;

            ultimasLecturas.forEach((l) => {
              const sensorInfo = sensores.find(
                (sen: Sensor) => sen.sensorId === l.sensorId
              );
              if (sensorInfo?.tipo === "temperatura") {
                tempSum += l.valor;
                tempCount++;
              } else if (sensorInfo?.tipo === "humedad") {
                // Asumiendo que hay sensores de humedad
                humSum += l.valor;
                humCount++;
              }
            });

            const tempProm =
              tempCount > 0 ? parseFloat((tempSum / tempCount).toFixed(1)) : 0;
            const humProm =
              humCount > 0 ? parseFloat((humSum / humCount).toFixed(1)) : 0;

            // 2. Determinar estado y severidad de alertas
            const alertasDelGalpon = alertas.filter(
              (a: Alerta) =>
                idSeccionesDelGalpon.includes(a.seccionId) && !a.resuelta
            );
            let estadoGeneralGalpon: "normal" | "precaucion" | "critico" =
              "normal";

            alertasDelGalpon.forEach((alerta: Alerta) => {
              const config = configsAlerta.find(
                (c: ConfiguracionAlerta) =>
                  c.galponId === g.galponId && c.variable === alerta.tipo // Asume que alerta.tipo coincide con config.variable
              );
              // Buscar la lectura que disparó la alerta (o la más reciente para esa sección/variable)
              const sensorAlerta = sensores.find(
                (sen: Sensor) =>
                  sen.seccionId === alerta.seccionId && sen.tipo === alerta.tipo
              );
              const lecturaRelacionada = sensorAlerta
                ? ultimasLecturasMap.get(sensorAlerta.sensorId)
                : undefined;

              let severidad: "normal" | "precaucion" | "critico" = "precaucion"; // Default si no hay config o lectura

              if (config && lecturaRelacionada) {
                if (
                  lecturaRelacionada.valor < config.valorMin ||
                  lecturaRelacionada.valor > config.valorMax
                ) {
                  // Podríamos añadir lógica para diferenciar entre precaución y crítico (ej. qué tan lejos del rango)
                  // Por ahora, si está fuera de rango, es crítico si la alerta existe.
                  severidad = "critico";
                } else {
                  severidad = "normal"; // Si la lectura actual está bien, pero la alerta sigue activa? Raro.
                }
              } else if (config) {
                // Si hay config pero no lectura reciente, asumimos precaución por si acaso
                severidad = "precaucion";
              }
              // Si la alerta existe pero no hay config, es al menos precaución
              severidad = severidad === "normal" ? "precaucion" : severidad;

              alerta.severidad = severidad; // Añadir severidad a la alerta

              // Actualizar estado general del galpón
              if (severidad === "critico") {
                estadoGeneralGalpon = "critico";
              } else if (
                severidad === "precaucion" &&
                estadoGeneralGalpon === "normal"
              ) {
                estadoGeneralGalpon = "precaucion";
              }
            });

            // 3. Calcular población
            const camadasEnGalpon = camadasGalpon.filter(
              (cg: CamadaGalpon) => cg.galponId === g.galponId
            );
            let totalInicial = 0;
            let totalMuertes = 0;

            camadasEnGalpon.forEach((cg: CamadaGalpon) => {
              totalInicial += cg.cantidadInicial;
              const muertesCamadaGalpon = mortalidades
                .filter(
                  (m: Mortalidad) => m.camadaGalponId === cg.camadaGalponId
                )
                .reduce((sum: number, m: Mortalidad) => sum + m.cantidad, 0);
              totalMuertes += muertesCamadaGalpon;
            });

            const vivos = totalInicial - totalMuertes;

            return {
              galponId: g.galponId,
              nombre: g.nombre,
              temperatura: tempProm,
              humedad: humProm,
              estado: estadoGeneralGalpon,
              pollosVivos: vivos >= 0 ? vivos : 0, // Asegurar que no sea negativo
              pollosFallecidos: totalMuertes,
              alertas: alertasDelGalpon,
            };
          }
        );

        setGalponesDashboard(galponesProcesados);
        const ultimoClima = data.climaExterno?.[data.climaExterno.length - 1];
        setClimaExterno(ultimoClima || null);
      } catch (err: any) {
        console.error("Error al cargar o procesar datos del dashboard:", err);
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    cargarYProcesarDatos();
  }, []); // Ejecutar solo una vez al montar

  if (loading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  const galponSeleccionadoData = galponesDashboard.find(
    (g) => g.galponId === galponSeleccionado
  );

  return (
    <Box className="p-6">
      {!galponSeleccionado ? (
        <>
          {/* Vista General del Dashboard */}
          <EstadisticasGenerales galpones={galponesDashboard} />

          <Box className="mt-6 border-b border-gray-300">
            <Tabs
              value={tab}
              onChange={(_, newTab) => setTab(newTab)}
              aria-label="tabs"
            >
              <Tab label="Galpones" />
              <Tab label="Alertas" />
            </Tabs>
          </Box>

          {tab === 0 && (
            <div className="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galponesDashboard.map((galpon) => (
                <div key={galpon.galponId}>
                  <GalponCard
                    galpon={galpon}
                    onSelect={() => setGalponSeleccionado(galpon.galponId)}
                  />
                </div>
              ))}
            </div>
          )}

          {climaExterno && (
            <Box className="mt-8">
              <Box className="rounded-lg border border-gray-200 shadow-sm bg-white">
                <Box className="p-4 border-b border-gray-100 bg-blue-100 rounded-t-md">
                  <Typography
                    variant="h6"
                    className="text-blue-800 font-semibold"
                  >
                    Clima Externo Actual
                  </Typography>
                </Box>
                <Box className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-gray-800">
                  <Box className="flex flex-col">
                    <Typography variant="body1" className="font-medium">
                      Temperatura
                    </Typography>
                    <Typography variant="body1">
                      {climaExterno.temperatura}°C
                    </Typography>
                  </Box>
                  <Box className="flex flex-col">
                    <Typography variant="body1" className="font-medium">
                      Humedad
                    </Typography>
                    <Typography variant="body1">
                      {climaExterno.humedad}%
                    </Typography>
                  </Box>
                  <Box className="flex flex-col">
                    <Typography variant="body1" className="font-medium">
                      Viento
                    </Typography>
                    <Typography variant="body1">
                      {climaExterno.viento} km/h
                    </Typography>
                  </Box>
                  <Box className="flex flex-col">
                    <Typography variant="body1" className="font-medium">
                      Dirección del viento
                    </Typography>
                    <Typography variant="body1">
                      {climaExterno.direccionViento}
                    </Typography>
                  </Box>
                  <Box className="flex flex-col">
                    <Typography variant="body1" className="font-medium">
                      Presión
                    </Typography>
                    <Typography variant="body1">
                      {climaExterno.presion} hPa
                    </Typography>
                  </Box>
                  <Box className="flex flex-col">
                    <Typography variant="body1" className="font-medium">
                      Lluvia
                    </Typography>
                    <Typography variant="body1">
                      {climaExterno.lluvia ? "Sí" : "No"}
                    </Typography>
                  </Box>
                  <Box className="col-span-full">
                    <Typography variant="caption" color="text.secondary">
                      Última actualización:{" "}
                      {new Date(climaExterno.fechaHora).toLocaleString("es-AR")}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box className="mt-4">
              <AlertasList />
            </Box>
          )}
        </>
      ) : (
        // Vista de Detalle del Galpón
        <GalponDetalle
          galpon={galponSeleccionadoData} // Pasa los datos del galpón encontrado
          onVolver={() => setGalponSeleccionado(null)} // Pasa la función para volver
        />
      )}
    </Box>
  );
}
