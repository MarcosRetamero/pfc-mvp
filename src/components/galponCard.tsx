'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Switch, Divider, Grid, CircularProgress } from "@mui/material";
import { Thermostat, Opacity, Circle, ArrowForward, Air, WaterDrop, Sensors, Lightbulb, WarningAmber, CheckCircleOutline, ReportProblemOutlined } from "@mui/icons-material";
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
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [humedad, setHumedad] = useState<number | null>(null);
  const [loadingSensores, setLoadingSensores] = useState(true);
  const [alertasActivas, setAlertasActivas] = useState<Alerta[]>([]);
  const [loadingAlertas, setLoadingAlertas] = useState(true);

  const [ventiladoresOn, setVentiladoresOn] = useState(true);
  const [aspersoresOn, setAspersoresOn] = useState(false);
  const [cortinasOn, setCortinasOn] = useState(true);
  const [lucesOn, setLucesOn] = useState(true);

  useEffect(() => {
    const fetchDatosGalpon = async () => {
      setLoadingSensores(true);
      setLoadingAlertas(true);
      try {
        const response = await fetch('/backend_nuevo.json');
        const data = await response.json();

        // 1. Encontrar secciones del galpón actual
        const seccionesGalpon = data.seccion.filter((s: Seccion) => s.galponId === galpon.galponId);
        const seccionIds = seccionesGalpon.map((s: Seccion) => s.seccionId);

        // 2. Encontrar sensores de T y H en esas secciones
        const sensoresGalpon = data.sensor.filter((sensor: Sensor) =>
          seccionIds.includes(sensor.seccionId) && (sensor.tipo === 'temperatura' || sensor.tipo === 'humedad')
        );

        // 3. Obtener las últimas lecturas para esos sensores
        let tempLecturas: number[] = [];
        let humLecturas: number[] = [];

        sensoresGalpon.forEach((sensor: Sensor) => {
          const lecturasSensor = data.lecturaSensor
            .filter((lectura: LecturaSensor) => lectura.sensorId === sensor.sensorId)
            .sort((a: LecturaSensor, b: LecturaSensor) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

          if (lecturasSensor.length > 0) {
            if (sensor.tipo === 'temperatura') {
              tempLecturas.push(lecturasSensor[0].valor);
            } else if (sensor.tipo === 'humedad') {
              humLecturas.push(lecturasSensor[0].valor);
            }
          }
        });

        if (tempLecturas.length > 0) {
          setTemperatura(parseFloat((tempLecturas.reduce((a, b) => a + b, 0) / tempLecturas.length).toFixed(1)));
        }
        if (humLecturas.length > 0) {
          setHumedad(parseFloat((humLecturas.reduce((a, b) => a + b, 0) / humLecturas.length).toFixed(1)));
        }
        setLoadingSensores(false);

        // 4. Cargar alertas activas para este galpón (o sus secciones)
        const alertasGalpon = data.alerta.filter(
          (alerta: Alerta) => !alerta.resuelta && (alerta.galponId === galpon.galponId || (alerta.seccionId && seccionIds.includes(alerta.seccionId)))
        );
        setAlertasActivas(alertasGalpon);
        setLoadingAlertas(false);

      } catch (error) {
        console.error("Error fetching sensor data for galpon:", galpon.galponId, error);
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
    <Card className="h-full flex flex-col shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="flex-grow">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h6" component="div" className="font-semibold text-gray-800">
            {galpon.nombre}
          </Typography>
          <Chip
            icon={estadoGeneral.icon}
            label={estadoGeneral.text}
            color={estadoGeneral.color as "default" | "error" | "warning" | "success"}
            size="small"
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Datos de Sensores */}
        <Grid container spacing={1.5} mb={2}>
          <Grid item xs={6} display="flex" alignItems="center">
            <Thermostat color="error" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Temp: {loadingSensores ? <CircularProgress size={14} /> : (temperatura !== null ? `${temperatura}°C` : 'N/A')}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" alignItems="center">
            <Opacity color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Hum: {loadingSensores ? <CircularProgress size={14} /> : (humedad !== null ? `${humedad}%` : 'N/A')}
            </Typography>
          </Grid>
          {/* Podrías añadir más sensores aquí si es necesario */}
        </Grid>

        {/* Controles (Toggles) */}
        <Grid container spacing={1} justifyContent="space-around" mb={2}>
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center">
            <Air fontSize="small" color={ventiladoresOn ? "primary" : "disabled"} />
            <Switch size="small" checked={ventiladoresOn} onChange={() => setVentiladoresOn(!ventiladoresOn)} />
            <Typography variant="caption" color="text.secondary">Vent.</Typography>
          </Grid>
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center">
            <WaterDrop fontSize="small" color={aspersoresOn ? "primary" : "disabled"} />
            <Switch size="small" checked={aspersoresOn} onChange={() => setAspersoresOn(!aspersoresOn)} />
            <Typography variant="caption" color="text.secondary">Aspers.</Typography>
          </Grid>
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center">
            <Sensors fontSize="small" color={cortinasOn ? "primary" : "disabled"} /> {/* Icono genérico para cortinas */}
            <Switch size="small" checked={cortinasOn} onChange={() => setCortinasOn(!cortinasOn)} />
            <Typography variant="caption" color="text.secondary">Cortinas</Typography>
          </Grid>
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center">
            <Lightbulb fontSize="small" color={lucesOn ? "primary" : "disabled"} />
            <Switch size="small" checked={lucesOn} onChange={() => setLucesOn(!lucesOn)} />
            <Typography variant="caption" color="text.secondary">Luces</Typography>
          </Grid>
        </Grid>

      </CardContent>

      <Divider />

      <Box p={1.5} display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          size="small"
          color="primary"
          endIcon={<ArrowForward />}
          onClick={() => onSelect(galpon.galponId)}
          sx={{ textTransform: 'none' }}
        >
          Ver Detalles
        </Button>
      </Box>
    </Card>
  );
};

export default GalponCard;