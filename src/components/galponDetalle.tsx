import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, Card, CardContent, Switch, Tabs, Tab, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Chip, Tooltip as MuiTooltip
} from '@mui/material';
import {
    Thermostat, Opacity, PeopleAlt, DangerousOutlined, Air, WaterDrop, Sensors, Lightbulb,
    ShowChart, History, NotificationsActive, ArrowBack,
    WarningAmber, ErrorOutline, InfoOutlined, FiberManualRecord
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Tipos (Idealmente centralizados) ---

type Usuario = { usuarioId: number; nombreUsuario: string; email: string; rol: number; activo: boolean; numero: number; ultimoLogin: string; };
type Seccion = { seccionId: number; galponId: number; nombre: string; };
type Sensor = { sensorId: number; seccionId: number; tipo: string; modelo: string; unidadMedida: string; };
type LecturaSensor = { lecturaId: number; sensorId: number; valor: number; fechaHora: string; };
type Dispositivo = { dispositivoId: number; seccionId: number; tipo: string; estadoInicial: string; };
type LogDispositivo = { logId: number; dispositivoId: number; accion: string; fechaHora: string; usuarioId: number; };
type AlertaJson = { alertaId: number; seccionId: number; tipo: string; descripcion: string; fechaHora: string; resuelta: boolean; resolucion: string; severidad?: "normal" | "precaucion" | "critico"; };
type Incidencia = { incidenciaId: number; fecha: string; descripcion: string; tipo: string; usuarioId: number; galponId: number; camadaId: number; };
type LogSistema = { logId: number; usuarioId: number; descripcion: string; fechaHora: string; modulo: string; tipoAccion: string; };
type CamadaGalpon = { camadaGalponId: number; camadaId: number; galponId: number; cantidadInicial: number; };
type Mortalidad = { mortalidadId: number; camadaGalponId: number; fecha: string; cantidad: number; motivo: string; };
type RegistroPeso = { pesoId: number; camadaGalponId: number; fecha: string; pesoPromedio: number; cantidadMuestra: number; };

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
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        // Si la hora es 00:00, solo mostrar la fecha
        if (hours === '00' && minutes === '00') {
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
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
        return past.toLocaleDateString('es-ES'); // Formato local para fechas más antiguas
    } catch(e) {
        console.error("Error formatting relative time:", dateTimeString, e);
        return "Fecha inválida";
    }
};


const getChipProps = (severidad?: "normal" | "precaucion" | "critico") => {
    switch (severidad) {
        case "critico":
            return { label: "Crítico", color: "error" as const, icon: <ErrorOutline /> };
        case "precaucion":
            return { label: "Precaución", color: "warning" as const, icon: <WarningAmber /> };
        case "normal":
             // Usamos un punto pequeño para 'normal' si no hay icono específico
             return { label: "Normal", color: "success" as const, icon: <FiberManualRecord sx={{ fontSize: 12 }} /> };
        default:
            return { label: "Info", color: "info" as const, icon: <InfoOutlined /> };
    }
};

// --- Componente Principal ---

const GalponDetalle: React.FC<GalponDetalleProps> = ({ galpon, onVolver }) => {
    const [tabIndex, setTabIndex] = useState(0);
    // Estados de control (simulados)
    const [ventiladorOn, setVentiladorOn] = useState(false);
    const [aspersorOn, setAspersorOn] = useState(false);
    const [cortinasOn, setCortinasOn] = useState(true); // Asumiendo estado inicial
    const [lucesOn, setLucesOn] = useState(true); // Asumiendo estado inicial

    // Estado para historial
    const [historialGalpon, setHistorialGalpon] = useState<HistorialEvento[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(true);
    const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

    // Estado para los datos del gráfico
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loadingChart, setLoadingChart] = useState(true);

    // useEffect para cargar historial
    useEffect(() => {
        if (galpon) {
            const cargarHistorial = async () => {
                setLoadingHistorial(true);
                setErrorHistorial(null);
                try {
                    const response = await fetch('/backend_nuevo.json'); // Asegúrate que la ruta es correcta
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();

                    // Desestructuración segura con valores por defecto
                    const {
                        usuario: usuarios = [], seccion: secciones = [], dispositivo: dispositivos = [],
                        logDispositivo = [], alerta: alertasJson = [], incidencia: incidencias = [],
                        logSistema = [], camadaGalpon = [], mortalidad = [], registroPeso = [],
                    } = data;

                    // Funciones auxiliares internas para evitar pasarlas como dependencias
                    const getUsuarioNombre = (userId: number | null | undefined): string => {
                        if (userId === null || userId === undefined) return "Sistema"; // O "Desconocido"
                        const user = usuarios.find((u: Usuario) => u.usuarioId === userId);
                        return user ? user.nombreUsuario : `Usuario ${userId}`;
                    };
                    const getSeccion = (seccionId: number): Seccion | undefined => secciones.find((s: Seccion) => s.seccionId === seccionId);
                    const getDispositivo = (dispositivoId: number): Dispositivo | undefined => dispositivos.find((d: Dispositivo) => d.dispositivoId === dispositivoId);

                    // Mapeo de camadaGalponId a galponId para eficiencia
                    const camadaGalponMap = new Map<number, number>();
                    camadaGalpon.forEach((cg: CamadaGalpon) => camadaGalponMap.set(cg.camadaGalponId, cg.galponId));

                    // Filtrar secciones del galpón actual
                    const seccionesDelGalponIds = secciones.filter((s: Seccion) => s.galponId === galpon.galponId).map((s: Seccion) => s.seccionId);

                    let eventosCombinados: HistorialEvento[] = [];

                    // Procesar Logs de Dispositivos
                    logDispositivo.forEach((log: LogDispositivo) => {
                        const dispositivo = getDispositivo(log.dispositivoId);
                        if (dispositivo && seccionesDelGalponIds.includes(dispositivo.seccionId)) {
                            const seccion = getSeccion(dispositivo.seccionId);
                            eventosCombinados.push({
                                id: `logDisp-${log.logId}`, fechaHora: log.fechaHora,
                                evento: `Dispositivo '${dispositivo.tipo}' (${seccion?.nombre || 'Sección Desconocida'}) ${log.accion === 'ON' ? 'encendido' : 'apagado'}`,
                                tipo: "Dispositivo", usuarioNombre: getUsuarioNombre(log.usuarioId),
                            });
                        }
                    });

                    // Procesar Alertas
                    alertasJson.forEach((alerta: AlertaJson) => {
                        if (seccionesDelGalponIds.includes(alerta.seccionId)) {
                             const seccion = getSeccion(alerta.seccionId);
                            eventosCombinados.push({
                                id: `alerta-${alerta.alertaId}`, fechaHora: alerta.fechaHora,
                                evento: `Alerta ${alerta.severidad || alerta.tipo}: ${alerta.descripcion} (${seccion?.nombre || 'Sección Desconocida'}) ${alerta.resuelta ? `(Resuelta: ${alerta.resolucion || 'OK'})` : ''}`,
                                tipo: "Alerta", usuarioNombre: "Sistema", // Las alertas suelen ser del sistema
                            });
                        }
                    });

                    // Procesar Incidencias
                    incidencias.forEach((inc: Incidencia) => {
                        // Asumiendo que incidencia tiene galponId directamente
                        if (inc.galponId === galpon.galponId) {
                            eventosCombinados.push({
                                id: `inc-${inc.incidenciaId}`, fechaHora: inc.fecha, // Asegúrate que 'fecha' es un string ISO
                                evento: `Incidencia (${inc.tipo}): ${inc.descripcion}`,
                                tipo: "Incidencia", usuarioNombre: getUsuarioNombre(inc.usuarioId),
                            });
                        }
                    });

                    // Procesar Logs del Sistema (filtrando por nombre del galpón en descripción)
                    logSistema.forEach((log: LogSistema) => {
                         // Cuidado con este filtro, puede ser impreciso. Idealmente habría un galponId en LogSistema.
                         if (log.descripcion.toLowerCase().includes(galpon.nombre.toLowerCase())) {
                            eventosCombinados.push({
                                id: `logSys-${log.logId}`, fechaHora: log.fechaHora,
                                evento: `Sistema (${log.modulo}): ${log.descripcion}`,
                                tipo: "Sistema", usuarioNombre: getUsuarioNombre(log.usuarioId),
                            });
                         }
                    });

                    // Procesar Mortalidad
                    mortalidad.forEach((mort: Mortalidad) => {
                        const galponIdAsociado = camadaGalponMap.get(mort.camadaGalponId);
                        if (galponIdAsociado === galpon.galponId) {
                            eventosCombinados.push({
                                id: `mort-${mort.mortalidadId}`, fechaHora: mort.fecha, // Asegúrate que 'fecha' es un string ISO
                                evento: `Mortalidad registrada: ${mort.cantidad} ave(s). Motivo: ${mort.motivo || 'No especificado'}`,
                                tipo: "Mortalidad", usuarioNombre: "Operario", // Asumiendo que lo registra un operario
                            });
                        }
                    });

                    // Procesar Registro de Peso
                    registroPeso.forEach((peso: RegistroPeso) => {
                        const galponIdAsociado = camadaGalponMap.get(peso.camadaGalponId);
                         if (galponIdAsociado === galpon.galponId) {
                            eventosCombinados.push({
                                id: `peso-${peso.pesoId}`, fechaHora: peso.fecha, // Asegúrate que 'fecha' es un string ISO
                                evento: `Registro de peso: ${peso.pesoPromedio.toFixed(2)} kg (muestra: ${peso.cantidadMuestra})`,
                                tipo: "Peso", usuarioNombre: "Operario", // Asumiendo que lo registra un operario
                            });
                        }
                    });

                    // Ordenar todos los eventos combinados por fecha descendente
                    eventosCombinados.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
                    setHistorialGalpon(eventosCombinados);

                } catch (error) {
                    console.error("Error fetching or processing historial:", error);
                    setErrorHistorial(error instanceof Error ? error.message : "Error desconocido al cargar el historial.");
                    setHistorialGalpon([]); // Limpiar en caso de error
                } finally {
                    setLoadingHistorial(false);
                }
            };
            cargarHistorial();
        } else {
             // Si no hay galpón seleccionado, limpiar el estado
             setHistorialGalpon([]);
             setLoadingHistorial(false); // No está cargando si no hay galpón
             setErrorHistorial(null);
        }
    }, [galpon]); // Dependencia: galpon

    // useEffect para cargar datos del gráfico
    useEffect(() => {
        if (galpon) {
            const fetchChartData = async () => {
                setLoadingChart(true);
                try {
                    const response = await fetch('/backend_nuevo.json'); // Asegúrate que la ruta es correcta
                    const data = await response.json();

                    // Tipos Sensor y LecturaSensor deben estar definidos arriba
                    const seccionesGalpon = data.seccion.filter((s: Seccion) => s.galponId === galpon.galponId);
                    const seccionIds = seccionesGalpon.map((s: Seccion) => s.seccionId);

                    const sensoresGalpon = data.sensor.filter((sensor: Sensor) =>
                        seccionIds.includes(sensor.seccionId) && (sensor.tipo === 'temperatura' || sensor.tipo === 'humedad')
                    );
                    const sensorIds = sensoresGalpon.map((sensor: Sensor) => sensor.sensorId);

                    const lecturasRelevantes = data.lecturaSensor.filter((lectura: LecturaSensor) =>
                        sensorIds.includes(lectura.sensorId)
                    );

                    // Procesar lecturas para el gráfico
                    const processedData: { [time: string]: { temps: number[], hums: number[] } } = {};

                    lecturasRelevantes.forEach((lectura: LecturaSensor) => {
                        const sensor = sensoresGalpon.find((s: Sensor) => s.sensorId === lectura.sensorId);
                        if (!sensor) return;

                        // Agrupar por hora y minuto para el gráfico
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

                    // Calcular promedios y formatear para Recharts
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
                        .sort((a, b) => {
                            // Ordenar correctamente por hora HH:MM
                            const [hA, mA] = a.time.split(':').map(Number);
                            const [hB, mB] = b.time.split(':').map(Number);
                            if (hA !== hB) return hA - hB;
                            return mA - mB;
                        });

                    setChartData(finalChartData);

                } catch (error) {
                    console.error("Error fetching or processing chart data:", error);
                    setChartData([]); // Limpiar datos en caso de error
                } finally {
                    setLoadingChart(false);
                }
            };

            fetchChartData();
        } else {
            // Si no hay galpón, limpiar datos del gráfico
            setChartData([]);
            setLoadingChart(false);
        }
    }, [galpon]); // Dependencia: galpon

    // --- Renderizado ---

    if (!galpon) {
        // Mensaje o componente cuando no hay galpón seleccionado
        return (
            <Box className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Typography variant="h6" color="text.secondary">Selecciona un galpón para ver los detalles.</Typography>
                {/* Podrías añadir un botón para volver si esta vista siempre espera un galpón */}
                 <Button onClick={onVolver} variant="outlined" startIcon={<ArrowBack />} className="mt-4">
                    Volver al Dashboard
                </Button>
            </Box>
        );
    }

    // Cálculos para mostrar
    const poblacionTotal = galpon.pollosVivos + galpon.pollosFallecidos;
    const porcentajeMortalidad = poblacionTotal > 0 ? ((galpon.pollosFallecidos / poblacionTotal) * 100).toFixed(1) : "0.0"; // 1 decimal es suficiente

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    // Ordenar alertas del galpón por fecha para la pestaña de Alertas (ya se hace en el useEffect de historial, pero podemos usar las del prop galpon si son las 'activas')
    const alertasActivasOrdenadas = [...galpon.alertas].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());


 // ... (imports y código anterior) ...

 return (
<Box className="p-4 md:p-6 bg-gray-50 min-h-screen"> {/* Ajuste de padding */}
        {/* Cabecera */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'black', mb: { xs: 2, sm: 0 } }}>
                {galpon.nombre}
            </Typography>
            <Button onClick={onVolver} variant="outlined" startIcon={<ArrowBack />}>
                Volver al Dashboard
            </Button>
        </Box>

        {/* Estadísticas Principales (Estilo Mejorado) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Temperatura */}
            <Paper className="p-4">
                <Box className="flex justify-between items-center">
                    <Typography variant="subtitle2" color="text.secondary">Temperatura</Typography>
                    <Thermostat fontSize="small" color="error" />
                </Box>
                <Typography variant="h5" className="font-bold"> {/* Ajustado a h5 para más impacto */}
                    {galpon.temperatura.toFixed(1)}°C
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                    Rango óptimo {/* O podrías añadir lógica para mostrar si está fuera de rango */}
                </Typography>
            </Paper>

            {/* Humedad */}
            <Paper className="p-4">
                <Box className="flex justify-between items-center">
                    <Typography variant="subtitle2" color="text.secondary">Humedad</Typography>
                    <Opacity fontSize="small" color="primary" />
                </Box>
                <Typography variant="h5" className="font-bold">
                    {galpon.humedad.toFixed(1)}%
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                    Rango óptimo
                </Typography>
            </Paper>

            {/* Población */}
            <Paper className="p-4">
                <Box className="flex justify-between items-center">
                    <Typography variant="subtitle2" color="text.secondary">Población</Typography>
                    <PeopleAlt fontSize="small" />
                </Box>
                <Typography variant="h5" className="font-bold">
                    {galpon.pollosVivos.toLocaleString()}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                    Pollos vivos
                </Typography>
            </Paper>

            {/* Mortalidad */}
            <Paper className="p-4">
                <Box className="flex justify-between items-center">
                    <Typography variant="subtitle2" color="text.secondary">Mortalidad</Typography>
                    <DangerousOutlined fontSize="small" color="action" />
                </Box>
                <Typography variant="h5" className="font-bold">
                    {galpon.pollosFallecidos.toLocaleString()}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                    {porcentajeMortalidad}% del total
                </Typography>
            </Paper>
        </div>

        {/* Controles Manuales Compactos */}
        <Card className="shadow-md border border-gray-200 rounded-lg mb-4">
            <CardContent>
                <Typography variant="h6" gutterBottom>Control de Dispositivos</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>Gestión de equipos del galpón</Typography>
                <Grid container spacing={2} justifyContent="space-around" alignItems="center">
                    {/* Ventiladores */}
                    <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Air sx={{ fontSize: 30, color: ventiladorOn ? 'primary.main' : 'text.disabled', mb: 1 }} />
                            <Typography variant="caption" display="block" gutterBottom>Ventiladores</Typography>
                            <Switch checked={ventiladorOn} onChange={(e) => setVentiladorOn(e.target.checked)} size="small" />
                        </Box>
                    </Grid>
                    {/* Aspersores */}
                    <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <WaterDrop sx={{ fontSize: 30, color: aspersorOn ? 'primary.main' : 'text.disabled', mb: 1 }} />
                            <Typography variant="caption" display="block" gutterBottom>Aspersores</Typography>
                            <Switch checked={aspersorOn} onChange={(e) => setAspersorOn(e.target.checked)} size="small" />
                        </Box>
                    </Grid>
                    {/* Cortinas */}
                    <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                         <Box display="flex" flexDirection="column" alignItems="center">
                            <Sensors sx={{ fontSize: 30, color: cortinasOn ? 'secondary.main' : 'text.disabled', mb: 1 }} />
                            <Typography variant="caption" display="block" gutterBottom>Cortinas</Typography>
                            <Switch checked={cortinasOn} onChange={(e) => setCortinasOn(e.target.checked)} size="small" />
                        </Box>
                    </Grid>
                    {/* Luces */}
                    <Grid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                         <Box display="flex" flexDirection="column" alignItems="center">
                            <Lightbulb sx={{ fontSize: 30, color: lucesOn ? 'warning.main' : 'text.disabled', mb: 1 }} />
                            <Typography variant="caption" display="block" gutterBottom>Luces</Typography>
                            <Switch checked={lucesOn} onChange={(e) => setLucesOn(e.target.checked)} size="small" />
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>

        {/* Pestañas y Contenido (Gráfico, Historial, Alertas) */}
        <Paper elevation={2} className="rounded-lg overflow-hidden">
            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth" // Mantenemos fullWidth para las pestañas
                aria-label="Detalles del galpón"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                {/* Cambiamos el orden y el icono de la primera pestaña */}
                <Tab label="Gráficos" icon={<ShowChart />} iconPosition="start" />
                <Tab label="Historial" icon={<History />} iconPosition="start" />
                <Tab label="Alertas Activas" icon={<NotificationsActive />} iconPosition="start" />
            </Tabs>

            {/* Contenido de la Pestaña Gráficos */}
            {tabIndex === 0 && (
                 <Box p={3}>
                    <Typography variant="h6" gutterBottom>Tendencias de Temperatura y Humedad</Typography>
                     <Typography variant="caption" color="text.secondary" display="block" mb={2}>Últimas 12 horas (promedio por hora)</Typography>
                    <Box sx={{ height: 300 }}> {/* Aumentamos un poco la altura del gráfico */}
                        {loadingChart ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}> {/* Ajuste de márgenes */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 10, dx: -5 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: '%', angle: -90, position: 'insideRight', fontSize: 10, dx: 5 }}/>
                                    <Tooltip contentStyle={{ fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: '10px' }} verticalAlign="top" align="center" /> {/* Leyenda arriba */}
                                    <Line yAxisId="left" type="monotone" dataKey="temperatura" stroke="#ef5350" strokeWidth={2} dot={false} name="Temperatura" />
                                    <Line yAxisId="right" type="monotone" dataKey="humedad" stroke="#42a5f5" strokeWidth={2} dot={false} name="Humedad" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">No hay datos históricos disponibles para el gráfico.</Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Contenido de la Pestaña Historial */}
            {tabIndex === 1 && ( // Cambiado a índice 1
                <Box p={3}>
                    <Typography variant="h6" gutterBottom>Historial de Eventos</Typography>
                    {loadingHistorial ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : errorHistorial ? (
                         <Typography color="error">Error al cargar el historial: {errorHistorial}</Typography>
                    ) : historialGalpon.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small" aria-label="historial de eventos">
                                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                                    <TableRow>
                                        <TableCell>Fecha y Hora</TableCell>
                                        <TableCell>Tipo</TableCell>
                                        <TableCell>Evento</TableCell>
                                        <TableCell>Usuario/Sistema</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historialGalpon.map((evento) => (
                                        <TableRow key={evento.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell component="th" scope="row">
                                                <MuiTooltip title={formatDateTime(evento.fechaHora)} placement="top">
                                                    <Typography variant="body2">{formatRelativeTime(evento.fechaHora)}</Typography>
                                                </MuiTooltip>
                                            </TableCell>
                                            <TableCell><Chip label={evento.tipo} size="small" variant="outlined" /></TableCell>
                                            <TableCell>{evento.evento}</TableCell>
                                            <TableCell>{evento.usuarioNombre}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary">No hay eventos registrados para este galpón.</Typography>
                    )}
                </Box>
            )}

            {/* Contenido de la Pestaña Alertas Activas */}
            {tabIndex === 2 && ( // Cambiado a índice 2
                <Box p={3}>
                    <Typography variant="h6" gutterBottom>Alertas Activas</Typography>
                    {alertasActivasOrdenadas.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small" aria-label="alertas activas">
                                <TableHead sx={{ backgroundColor: 'grey.100' }}>
                                    <TableRow>
                                        <TableCell>Fecha y Hora</TableCell>
                                        <TableCell>Severidad</TableCell>
                                        <TableCell>Descripción</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {alertasActivasOrdenadas.map((alerta) => {
                                        const chipProps = getChipProps(alerta.severidad);
                                        return (
                                            <TableRow key={alerta.alertaId} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell component="th" scope="row">
                                                    <MuiTooltip title={formatDateTime(alerta.fechaHora)} placement="top">
                                                        <Typography variant="body2">{formatRelativeTime(alerta.fechaHora)}</Typography>
                                                    </MuiTooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={chipProps.label} color={chipProps.color} size="small" icon={chipProps.icon} />
                                                </TableCell>
                                                <TableCell>{alerta.descripcion}</TableCell>
                                                <TableCell>
                                                    {alerta.resuelta
                                                        ? <Chip label="Resuelta" size="small" color="success" variant="outlined" />
                                                        : <Chip label="Activa" size="small" color="warning" />
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="text.secondary">No hay alertas activas en este momento.</Typography>
                    )}
                </Box>
            )}
        </Paper>
    </Box>
);
};

export default GalponDetalle;