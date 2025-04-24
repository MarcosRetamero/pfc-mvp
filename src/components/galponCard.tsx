import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Switch, Divider, Grid } from "@mui/material";
import { Thermostat, Opacity, Circle, ArrowForward, Air, WaterDrop, Sensors, Lightbulb } from "@mui/icons-material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Tipos basados en backend_nuevo.json ---
type Seccion = {
  seccionId: number;
  galponId: number;
  nombre: string;
};

type Sensor = {
  sensorId: number;
  seccionId: number;
  tipo: string; // "temperatura", "humedad"
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
  seccionId: number;
  tipo: string;
  descripcion: string;
  fechaHora: string;
  resuelta: boolean;
  resolucion: string;
  severidad?: "normal" | "precaucion" | "critico";
};

type GalponDashboard = {
  galponId: number;
  nombre: string;
  temperatura: number; // Promedio actual (puede ser diferente al histórico)
  humedad: number; // Promedio actual (puede ser diferente al histórico)
  estado: "normal" | "precaucion" | "critico";
  pollosVivos: number;
  pollosFallecidos: number;
  alertas: Alerta[];
};

interface GalponCardProps {
  galpon: GalponDashboard;
  onSelect: () => void;
}

// Tipo para los datos del gráfico
type ChartDataPoint = {
  time: string;
  temperatura?: number;
  humedad?: number;
};

const GalponCard: React.FC<GalponCardProps> = ({ galpon, onSelect }) => {
  const estadoColorMap = {
    normal: "success.main",
    precaucion: "warning.main",
    critico: "error.main",
  };

  const estadoColor = estadoColorMap[galpon.estado];

  // Estados para los controles de dispositivos
  const [ventiladorOn, setVentiladorOn] = useState(false);
  const [aspersorOn, setAspersorOn] = useState(false);
  const [cortinasOn, setCortinasOn] = useState(true);
  const [lucesOn, setLucesOn] = useState(true);

  // Estado para los datos del gráfico
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingChart(true);
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
        const sensorIds = sensoresGalpon.map((sensor: Sensor) => sensor.sensorId);

        // 3. Filtrar lecturas para esos sensores
        const lecturasRelevantes = data.lecturaSensor.filter((lectura: LecturaSensor) =>
          sensorIds.includes(lectura.sensorId)
        );

        // 4. Procesar lecturas para el gráfico
        const processedData: { [time: string]: { temps: number[], hums: number[] } } = {};

        lecturasRelevantes.forEach((lectura: LecturaSensor) => {
          const sensor = sensoresGalpon.find((s: Sensor) => s.sensorId === lectura.sensorId);
          if (!sensor) return;

          const time = new Date(lectura.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

          if (!processedData[time]) {
            processedData[time] = { temps: [], hums: [] };
          }

          if (sensor.tipo === 'temperatura') {
            processedData[time].temps.push(lectura.valor);
          } else if (sensor.tipo === 'humedad') {
            processedData[time].hums.push(lectura.valor);
          }
        });

        // 5. Calcular promedios y formatear para Recharts
        const finalChartData = Object.entries(processedData)
          .map(([time, values]) => {
            const avgTemp = values.temps.length > 0 ? values.temps.reduce((a, b) => a + b, 0) / values.temps.length : undefined;
            const avgHum = values.hums.length > 0 ? values.hums.reduce((a, b) => a + b, 0) / values.hums.length : undefined;
            return {
              time,
              temperatura: avgTemp !== undefined ? parseFloat(avgTemp.toFixed(1)) : undefined,
              humedad: avgHum !== undefined ? parseFloat(avgHum.toFixed(1)) : undefined,
            };
          })
          .sort((a, b) => a.time.localeCompare(b.time)); // Ordenar por hora

        setChartData(finalChartData);

      } catch (error) {
        console.error("Error fetching or processing chart data:", error);
        // Podrías establecer un estado de error aquí si lo deseas
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [galpon.galponId]); // Dependencia para re-fetch si cambia el galpón

  return (
    <Card className="h-full flex flex-col shadow-lg border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="flex-grow p-4">
        {/* Encabezado */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'black' }}>
            {galpon.nombre}
          </Typography>
          <Circle sx={{ color: estadoColor, fontSize: '1.2rem' }} />
        </Box>

        {/* Lecturas de Sensores (Promedio Actual) */}
        <Box display="flex" justifyContent="space-around" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <Thermostat sx={{ color: 'error.light', mr: 0.5 }} />
            <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'black' }}>{galpon.temperatura}°C</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Opacity sx={{ color: 'primary.light', mr: 0.5 }} />
            <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'black' }}>{galpon.humedad}%</Typography>
          </Box>
        </Box>

        {/* Gráfico */}
        <Box sx={{ height: 150, mb: 2 }}> {/* Aumentado el tamaño del gráfico */}
          {loadingChart ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">Cargando gráfico...</Typography>
            </Box>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }} // Ajustado márgenes
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line yAxisId="left" type="monotone" dataKey="temperatura" stroke="#ef5350" strokeWidth={2} dot={false} name="Temp (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="humedad" stroke="#42a5f5" strokeWidth={2} dot={false} name="Hum (%)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f0f0f0', borderRadius: 1 }}>
               <Typography variant="caption" color="text.secondary">No hay datos históricos</Typography>
             </Box>
          )}
        </Box>

        {/* Controles (Toggles) */}
        <Grid container spacing={1} justifyContent="space-around" mb={2}>
          {/* Ventiladores */}
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
             <Air sx={{ color: ventiladorOn ? 'primary.main' : 'text.disabled', mb: 0.5 }} />
             <Switch checked={ventiladorOn} onChange={(e) => setVentiladorOn(e.target.checked)} size="small" />
          </Grid>
          {/* Aspersores */}
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
             <WaterDrop sx={{ color: aspersorOn ? 'primary.main' : 'text.disabled', mb: 0.5 }} />
             <Switch checked={aspersorOn} onChange={(e) => setAspersorOn(e.target.checked)} size="small" />
          </Grid>
          {/* Cortinas */}
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
             <Sensors sx={{ color: cortinasOn ? 'secondary.main' : 'text.disabled', mb: 0.5 }} /> {/* Usando secondary color */}
             <Switch checked={cortinasOn} onChange={(e) => setCortinasOn(e.target.checked)} size="small" />
          </Grid>
          {/* Luces */}
          <Grid item xs={6} sm={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
             <Lightbulb sx={{ color: lucesOn ? 'warning.main' : 'text.disabled', mb: 0.5 }} />
             <Switch checked={lucesOn} onChange={(e) => setLucesOn(e.target.checked)} size="small" />
          </Grid>
        </Grid>

        {/* Población */}
        <Box display="flex" justifyContent="space-around" textAlign="center" mb={2}>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>{galpon.pollosVivos.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Pollos vivos</Typography>
          </div>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black' }}>{galpon.pollosFallecidos.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Fallecidos</Typography>
          </div>
        </Box>

        {/* Alertas */}
        {galpon.alertas.length > 0 && (
          <Box mt={1} mb={2}>
            {galpon.alertas.map((alerta) => (
              <Chip
                key={alerta.alertaId}
                label={alerta.descripcion}
                size="small"
                color={alerta.severidad === 'critico' ? 'error' : alerta.severidad === 'precaucion' ? 'warning' : 'info'}
                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.75rem' }} // Ajuste de margen y tamaño de fuente
              />
            ))}
          </Box>
        )}
      </CardContent>

      {/* Footer con Botón */}
      <Divider />
      <Box p={1.5} display="flex" justifyContent="flex-end">
        <Button
          variant="text"
          color="primary"
          size="small"
          endIcon={<ArrowForward />}
          onClick={onSelect}
          sx={{ textTransform: 'none' }}
        >
          Ver detalles
        </Button>
      </Box>
    </Card>
  );
};

export default GalponCard;