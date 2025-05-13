'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import { AddCircleOutline, DeleteOutline } from '@mui/icons-material';

// Tipos basados en backend_nuevo.json
type Proveedor = {
  proveedorId: number;
  nombre: string;
  email: string; // Aunque no se use en el form, es bueno tenerlo por si acaso
};

// Tipo para los galpones recibidos como prop
type Galpon = {
  galponId: number;
  nombre: string;
  capacidadMax: number; // Es importante que este campo exista y sea numérico
};

// Tipo para el estado local de la distribución
type DistribucionGalpon = {
  id: number; // ID temporal único para manejar el estado de React
  galponId: string; // Usamos string para el estado del Select
  cantidadInicial: string; // Usamos string para el estado del TextField
};

// Tipo para los datos que se enviarán al guardar
type NuevaCamadaData = {
    fechaIngreso: string;
    proveedorId: string; // El ID del proveedor seleccionado
    distribucion: Array<{ galponId: number; cantidadInicial: number }>; // Datos numéricos validados
};

// Definición de las props que el componente espera recibir
interface FormularioCamadaProps {
  onGuardar: (data: NuevaCamadaData) => void; // Función callback para manejar el guardado (viene del padre)
  galponesDisponibles: Galpon[]; // Lista de galpones disponibles con su capacidad (viene del padre)
}

const FormularioCamada: React.FC<FormularioCamadaProps> = ({ onGuardar, galponesDisponibles }) => {
  // Estados del formulario
  const [fechaIngreso, setFechaIngreso] = useState<string>(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
  const [proveedorId, setProveedorId] = useState<string>(''); // ID del proveedor seleccionado
  const [distribucion, setDistribucion] = useState<DistribucionGalpon[]>([{ id: Date.now(), galponId: '', cantidadInicial: '' }]); // Estado para la distribución dinámica
  const [proveedores, setProveedores] = useState<Proveedor[]>([]); // Estado para la lista de proveedores

  // Estados de UI y errores
  const [loadingProveedores, setLoadingProveedores] = useState<boolean>(true); // Estado de carga solo para proveedores
  const [errorCarga, setErrorCarga] = useState<string | null>(null); // Error al cargar proveedores
  const [formError, setFormError] = useState<string | null>(null); // Error de validación del formulario

  // Cargar solo los proveedores al montar el componente
  useEffect(() => {
    const fetchProveedores = async () => {
      setLoadingProveedores(true);
      setErrorCarga(null);
      try {
        const res = await fetch('/backend_nuevo.json'); // Asume que está en la carpeta public
        if (!res.ok) throw new Error('No se pudo cargar la lista de proveedores.');
        const data = await res.json();
        setProveedores(data.proveedor || []); // Asegurarse de manejar si 'proveedor' no existe
      } catch (err) {
        setErrorCarga(err instanceof Error ? err.message : 'Error desconocido al cargar proveedores');
        console.error("Error fetching proveedores:", err);
      } finally {
        setLoadingProveedores(false);
      }
    };
    fetchProveedores();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // --- Manejadores de eventos ---

  // Añadir una nueva fila para asignar galpón/cantidad
  const handleAddGalpon = () => {
    // Validar antes de añadir: no permitir más filas que galpones disponibles
    if (distribucion.length >= galponesDisponibles.length) {
        setFormError(`No puede asignar la camada a más de ${galponesDisponibles.length} galpones.`);
        return;
    }
    // Añadir nueva fila con un ID único basado en timestamp
    setDistribucion([...distribucion, { id: Date.now(), galponId: '', cantidadInicial: '' }]);
    setFormError(null); // Limpiar error si se añade correctamente
  };

  // Eliminar una fila de distribución por su ID temporal
  const handleRemoveGalpon = (idToRemove: number) => {
    setDistribucion(distribucion.filter(item => item.id !== idToRemove));
  };

  // Actualizar el valor de un campo (galponId o cantidadInicial) en una fila específica
  const handleDistribucionChange = (idToUpdate: number, field: keyof Omit<DistribucionGalpon, 'id'>, value: string) => {
    setDistribucion(distribucion.map(item =>
      item.id === idToUpdate ? { ...item, [field]: value } : item
    ));
  };

  // Actualizar el proveedor seleccionado
  const handleProveedorChange = (event: SelectChangeEvent<string>) => {
    setProveedorId(event.target.value);
  };

  // --- Lógica de Envío y Validación ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenir recarga de página
    setFormError(null); // Resetear mensaje de error previo

    // 1. Validaciones básicas de campos requeridos
    if (!fechaIngreso || !proveedorId) {
      setFormError('La fecha de ingreso y el proveedor son obligatorios.');
      return;
    }
    if (distribucion.length === 0) {
        setFormError('Debe asignar la camada al menos a un galpón.');
        return;
    }
    if (distribucion.some(d => !d.galponId || !d.cantidadInicial)) {
      setFormError('Debe seleccionar un galpón y especificar la cantidad inicial para cada fila asignada.');
      return;
    }

    // 2. Validar número máximo de galpones asignados (doble chequeo)
    if (distribucion.length > galponesDisponibles.length) {
        setFormError(`Error: No puede asignar la camada a más de ${galponesDisponibles.length} galpones.`);
        return;
    }

    // 3. Convertir y validar datos numéricos de la distribución
    let distribucionNumerica: Array<{ galponId: number; cantidadInicial: number }>;
    try {
        distribucionNumerica = distribucion.map(d => {
            const galponIdNum = parseInt(d.galponId, 10);
            const cantidadNum = parseInt(d.cantidadInicial, 10);

            if (isNaN(galponIdNum) || isNaN(cantidadNum)) {
                throw new Error('Valores inválidos en la distribución.');
            }
            if (cantidadNum <= 0) {
                throw new Error('La cantidad inicial debe ser un número positivo.');
            }
            return { galponId: galponIdNum, cantidadInicial: cantidadNum };
        });
    } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Error en los datos de distribución.');
        return;
    }


    // 4. Validar que no se repitan galpones
    const galponIdsAsignados = distribucionNumerica.map(d => d.galponId);
    if (new Set(galponIdsAsignados).size !== galponIdsAsignados.length) {
        setFormError('No puede asignar la misma camada a un galpón más de una vez.');
        return;
    }

    // 5. Validar capacidad máxima por galpón asignado
    for (const asignacion of distribucionNumerica) {
        const galponInfo = galponesDisponibles.find(g => g.galponId === asignacion.galponId);
        if (!galponInfo) {
            // Esto es una salvaguarda, no debería ocurrir si el Select se llena correctamente
            setFormError(`Error interno: No se encontró información para el galpón ID ${asignacion.galponId}.`);
            return;
        }
        // Asegurarse que capacidadMax es un número antes de comparar
        if (typeof galponInfo.capacidadMax !== 'number') {
             setFormError(`Error interno: Falta la capacidad máxima para el galpón ${galponInfo.nombre}.`);
             return;
        }
        if (asignacion.cantidadInicial > galponInfo.capacidadMax) {
            setFormError(`Error: La cantidad (${asignacion.cantidadInicial}) para ${galponInfo.nombre} supera su capacidad máxima (${galponInfo.capacidadMax}).`);
            return; // Detener el guardado
        }
    }

    // Si todas las validaciones pasan:
    // Crear el objeto de datos a enviar
    const nuevaCamadaData: NuevaCamadaData = {
      fechaIngreso,
      proveedorId, // Ya es string
      distribucion: distribucionNumerica // Datos numéricos validados
    };

    // Llamar a la función onGuardar pasada por props desde el componente padre
    onGuardar(nuevaCamadaData);
  };

  // --- Renderizado del Componente ---

  // Mostrar indicador de carga mientras se obtienen los proveedores
  if (loadingProveedores) return <CircularProgress />;
  // Mostrar error si la carga de proveedores falló
  if (errorCarga) return <Alert severity="error">Error cargando datos necesarios: {errorCarga}</Alert>;

  // Renderizar el formulario
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {/* Stack principal para todo el formulario, los elementos principales en fila y luego el resto en columna */}
      <Stack spacing={3}>
        {/* Stack para Fecha de Ingreso y Proveedor en la misma fila */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          {/* Campo Fecha de Ingreso */}
          <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fechaIngreso"
              label="Fecha de Ingreso"
              name="fechaIngreso"
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          {/* Campo Selector de Proveedor */}
          <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="proveedor-label">Proveedor</InputLabel>
              <Select
                labelId="proveedor-label"
                id="proveedorId"
                value={proveedorId}
                label="Proveedor"
                onChange={handleProveedorChange}
              >
                <MenuItem value="">
                  <em>Seleccione un proveedor</em>
                </MenuItem>
                {proveedores.map((p) => (
                  <MenuItem key={p.proveedorId} value={p.proveedorId.toString()}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

        {/* Sección de Distribución por Galpón */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Distribución por Galpón ({distribucion.length}/{galponesDisponibles.length})
          </Typography>
          {distribucion.map((item, index) => (
            // Stack para cada fila de distribución
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              key={item.id}
              alignItems="center"
              sx={{ mb: 2 }} // Aumentamos un poco el margen inferior para separar las filas
              flexWrap="wrap"
              useFlexGap
            >
              {/* Selector de Galpón */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px - 32px)', md: 'calc(40% - 8px - 32px)'} }}> {/* Ajustar para botón y espaciado */}
                <FormControl fullWidth size="small" required>
                  <InputLabel id={`galpon-label-${item.id}`}>Galpón</InputLabel>
                  <Select
                    labelId={`galpon-label-${item.id}`}
                    value={item.galponId}
                    label="Galpón"
                    onChange={(e) => handleDistribucionChange(item.id, 'galponId', e.target.value)}
                    required
                  >
                    <MenuItem value=""><em>Seleccione</em></MenuItem>
                    {galponesDisponibles.map((g) => (
                      <MenuItem
                        key={g.galponId}
                        value={g.galponId.toString()}
                        disabled={distribucion.some(d => d.galponId === g.galponId.toString() && d.id !== item.id)}
                      >
                        {g.nombre} (Max: {g.capacidadMax ?? 'N/A'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {/* Campo Cantidad Inicial */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(40% - 8px)'} }}> {/* Ajustar para botón y espaciado */}
                <TextField
                  fullWidth
                  size="small"
                  label="Cantidad Inicial"
                  type="number"
                  required
                  value={item.cantidadInicial}
                  onChange={(e) => handleDistribucionChange(item.id, 'cantidadInicial', e.target.value)}
                  inputProps={{ min: "1" }}
                />
              </Box>
              {/* Botón Eliminar Fila */}
              <Box sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', justifyContent: {xs: 'flex-end', sm: 'center'} }}>
                <IconButton
                  onClick={() => handleRemoveGalpon(item.id)}
                  color="error"
                  disabled={distribucion.length <= 1}
                  title="Eliminar asignación"
                >
                  <DeleteOutline />
                </IconButton>
              </Box>
            </Stack>
          ))}
          {/* Botón Añadir Fila */}
          <Button
            startIcon={<AddCircleOutline />}
            onClick={handleAddGalpon}
            sx={{ mt: 1 }}
            disabled={distribucion.length >= galponesDisponibles.length}
          >
            Añadir Galpón
          </Button>
        </Box>

        {/* Mostrar Error del Formulario */}
        {formError && (
            <Box sx={{ width: '100%' }}>
                <Alert severity="error">{formError}</Alert>
            </Box>
        )}

        {/* Botón de Envío */}
        <Box sx={{ width: '100%' }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Registrar Camada
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default FormularioCamada;