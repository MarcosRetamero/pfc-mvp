'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from "@mui/material";
import { Thermostat, Opacity, ArrowForward, WarningAmber, CheckCircleOutline, ReportProblemOutlined } from "@mui/icons-material";
import { useRouter } from 'next/navigation';

// --- Tipos basados en backend_nuevo.json ---
type Galpon = {
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
  tipo: 'temperatura' | 'humedad' | 'gas' | 'luz' | 'agua'; // Extender según sea necesario
  modelo: string;
  unidadMedida: string;
};

type LecturaSensor = {
  lecturaId: number;
  sensorId: number;
  valor: number;
  fechaHora: string;
};

type Alerta = {
  alertaId: number;
  seccionId?: number; // Puede ser a nivel de galpón o sección
  galponId?: number;
  tipo: string; // 'temperatura', 'humedad', 'gas', 'sistema', etc.
  descripcion: string;
  fechaHora: string;
  resuelta: boolean;
  resolucion?: string;
  severidad: 'critico' | 'precaucion' | 'informativo';
};

// --- Fin Tipos ---

interface GalponCardProps {
  galpon: Galpon;
  onSelect: (galponId: number) => void;
}

const GalponCard: React.FC<GalponCardProps> = ({ galpon, onSelect }) => {
  const router = useRouter();
  const [seccionesDatos, setSeccionesDatos] = useState<Array<{
    seccionId: number,
    nombre: string,
    temperatura: number | null,
    humedad: number | null
  }>>([]);
  const [loadingSensores, setLoadingSensores] = useState(true);
  const [alertasActivas, setAlertasActivas] = useState<Alerta[]>([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);
  const [promedios, setPromedios] = useState<{ temperatura: number | null, humedad: number | null }>({
    temperatura: null,
    humedad: null
  });
  const [pollosVivos, setPollosVivos] = useState<number>(0);

  useEffect(() => {
    const fetchDatosGalpon = async () => {
      setLoadingSensores(true);
      setLoadingAlertas(true);
      try {
        const response = await fetch('/backend_nuevo.json');
        const data = await response.json();

        // 1. Encontrar secciones del galpón y sus datos
        const seccionesGalpon = data.seccion.filter((s: Seccion) => s.galponId === galpon.galponId);
        
        // 2. Procesar datos por sección
        const datosSecciones = await Promise.all(seccionesGalpon.map(async (seccion: Seccion) => {
          const sensoresSeccion = data.sensor.filter((sensor: Sensor) => 
            sensor.seccionId === seccion.seccionId && 
            (sensor.tipo === 'temperatura' || sensor.tipo === 'humedad')
          );

          let tempValor = null;
          let humValor = null;

          sensoresSeccion.forEach((sensor: Sensor) => {
            const lecturas = data.lecturaSensor
              .filter((l: LecturaSensor) => l.sensorId === sensor.sensorId)
              .sort((a: LecturaSensor, b: LecturaSensor) => 
                new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
              );

            if (lecturas.length > 0) {
              if (sensor.tipo === 'temperatura') {
                tempValor = lecturas[0].valor;
              } else if (sensor.tipo === 'humedad') {
                humValor = lecturas[0].valor;
              }
            }
          });

          return {
            seccionId: seccion.seccionId,
            nombre: seccion.nombre,
            temperatura: tempValor,
            humedad: humValor
          };
        }));

        setSeccionesDatos(datosSecciones);

        // 3. Calcular promedios generales
        const tempsValidas = datosSecciones.map(s => s.temperatura).filter((t): t is number => t !== null);
        const humsValidas = datosSecciones.map(s => s.humedad).filter((h): h is number => h !== null);

        setPromedios({
          temperatura: tempsValidas.length > 0 ? 
            parseFloat((tempsValidas.reduce((a, b) => a + b, 0) / tempsValidas.length).toFixed(1)) : null,
          humedad: humsValidas.length > 0 ? 
            parseFloat((humsValidas.reduce((a, b) => a + b, 0) / humsValidas.length).toFixed(1)) : null
        });

        // 4. Calcular pollos vivos
        const camadasEnGalpon = data.camadaGalpon.filter((cg: any) => cg.galponId === galpon.galponId);
        let totalVivos = 0;

        camadasEnGalpon.forEach((cg: any) => {
          const muertes = data.mortalidad
            .filter((m: any) => m.camadaGalponId === cg.camadaGalponId)
            .reduce((sum: number, m: any) => sum + m.cantidad, 0);
          totalVivos += cg.cantidadInicial - muertes;
        });

        setPollosVivos(Math.max(0, totalVivos));

        // 5. Cargar alertas activas
        const alertasGalpon = data.alerta.filter(
          (alerta: Alerta) => !alerta.resuelta && 
            (alerta.galponId === galpon.galponId || 
             seccionesGalpon.some(s => s.seccionId === alerta.seccionId))
        );
        setAlertasActivas(alertasGalpon);

        setLoadingSensores(false);
        setLoadingAlertas(false);
      } catch (error) {
        console.error("Error fetching data for galpon:", galpon.galponId, error);
        setLoadingSensores(false);
        setLoadingAlertas(false);
      }
    };

    fetchDatosGalpon();
  }, [galpon.galponId]);

  const getEstadoGeneral = () => {
    if (loadingAlertas) return { text: "Cargando...", color: "default", icon: <CircularProgress size={16} color="inherit" /> };
    if (alertasActivas.some(a => a.severidad === 'critico')) return { text: "Crítico", color: "error", icon: <WarningAmber /> };
    if (alertasActivas.some(a => a.severidad === 'precaucion')) return { text: "Precaución", color: "warning", icon: <ReportProblemOutlined /> };
    return { text: "Normal", color: "success", icon: <CheckCircleOutline /> };
  };

  const estadoGeneral = getEstadoGeneral();

  return (
    <Card className="h-full flex flex-col shadow-lg border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardContent className="flex-grow p-0">
        {/* Encabezado con nombre y estado */}
        <Box className="bg-gradient-to-r from-blue-50 to-blue-100 p-4">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div" className="font-semibold text-gray-800">
              {galpon.nombre}
            </Typography>
            <Chip
              icon={estadoGeneral.icon}
              label={estadoGeneral.text}
              color={estadoGeneral.color as "default" | "error" | "warning" | "success"}
              size="small"
              className="shadow-sm"
            />
          </Box>
        </Box>

        {/* Datos Generales - Diseño mejorado */}
        <Box className="p-6 grid grid-cols-3 gap-4">
          {/* Temperatura Promedio */}
          <Box className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50">
            <Thermostat color="error" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h4" className="font-bold text-red-600">
              {loadingSensores ? <CircularProgress size={32} /> : 
                (promedios.temperatura !== null ? `${promedios.temperatura}°` : 'N/A')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Temperatura
            </Typography>
          </Box>

          {/* Humedad Promedio */}
          <Box className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50">
            <Opacity color="primary" sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h4" className="font-bold text-blue-600">
              {loadingSensores ? <CircularProgress size={32} /> : 
                (promedios.humedad !== null ? `${promedios.humedad}%` : 'N/A')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Humedad
            </Typography>
          </Box>

          {/* Cantidad de Aves */}
          <Box className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50">
            <Box className="rounded-full bg-green-100 p-2 mb-1">
              🐤
            </Box>
            <Typography variant="h4" className="font-bold text-green-600">
              {pollosVivos.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Aves
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Datos por Sección - Tabla Moderna */}
        <Box className="p-4">
          <Typography variant="subtitle1" className="font-semibold mb-3">
            Secciones del Galpón
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="font-medium">Sección</TableCell>
                  <TableCell align="center" className="font-medium">Temperatura</TableCell>
                  <TableCell align="center" className="font-medium">Humedad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {seccionesDatos.map((seccion) => (
                  <TableRow 
                    key={seccion.seccionId}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <TableCell>{seccion.nombre}</TableCell>
                    <TableCell align="center">
                      <Box className="inline-flex items-center gap-1">
                        <Thermostat fontSize="small" color="error" />
                        <Typography>
                          {seccion.temperatura !== null ? 
                            `${seccion.temperatura.toFixed(1)}°C` : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box className="inline-flex items-center gap-1">
                        <Opacity fontSize="small" color="primary" />
                        <Typography>
                          {seccion.humedad !== null ? 
                            `${seccion.humedad.toFixed(1)}%` : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>

      <Divider />

      <Box className="p-3 bg-gray-50">
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForward />}
          onClick={() => onSelect(galpon.galponId)}
          className="shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          Ver Detalles
        </Button>
      </Box>
    </Card>
  );
};

export default GalponCard;