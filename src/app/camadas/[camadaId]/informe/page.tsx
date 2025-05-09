// src/app/camadas/[camadaId]/informe/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import SummaryCards from "./SummaryCards";
import GalponReportTable from "./GalponReportTable";

interface Summary {
  camadaId: number;
  fechaIngreso: string;
  fechaSalida: string | null;
  pollosRecibidos: number;
  pollosActuales: number;
  alimentoConsumido: number;
  ultimoPesoPromedio: number;
  tasaEngorde: number;
  tempPromedio: number;
  humedadPromedio: number;
  visitasVet: number;
  incidencias: number;
  tasaCrecimiento: number;
}

export default function InformeCamadaPage() {
  const { camadaId } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [galpones, setGalpones] = useState<any[]>([]);
  const [detallePorGalpon, setDetallePorGalpon] = useState<
    Record<number, any[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInforme() {
      try {
        setLoading(true);
        const res = await fetch("/backend_nuevo.json");
        const db = await res.json();

        const id = Number(camadaId);
        const camada = db.camada.find((c: any) => c.camadaId === id);
        if (!camada) throw new Error("Camada no encontrada");

        // 1. Camada-Galpón
        const cgAll = db.camadaGalpon.filter((cg: any) => cg.camadaId === id);
        const pollosRecibidos = cgAll.reduce(
          (sum: number, cg: any) => sum + cg.cantidadInicial,
          0
        );

        // 2. Mortalidad
        const mortAll = db.mortalidad.filter((m: any) =>
          cgAll.some((cg: any) => cg.camadaGalponId === m.camadaGalponId)
        );
        const totalMuertes = mortAll.reduce(
          (sum: number, m: any) => sum + m.cantidad,
          0
        );
        const pollosActuales = pollosRecibidos - totalMuertes;

        // 3. Alimento consumido
        const galponIds = cgAll.map((cg: any) => cg.galponId);
        const alimAll = db.reposicionAlimento.filter((r: any) =>
          galponIds.includes(r.galponId)
        );
        const alimentoConsumido = alimAll.reduce(
          (sum: number, r: any) => sum + r.cantidadKg,
          0
        );

        // 4. Peso promedio
        const pesoAll = db.registroPeso
          .filter((r: any) =>
            cgAll.some((cg: any) => cg.camadaGalponId === r.camadaGalponId)
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          );
        const primerPeso = pesoAll.length ? pesoAll[0].pesoPromedio : 0;
        const ultimoPeso = pesoAll.length
          ? pesoAll[pesoAll.length - 1].pesoPromedio
          : 0;

        // 5. Días de vida
        const fechaIngreso = new Date(camada.fechaIngreso);
        const fechaFin = camada.fechaSalida
          ? new Date(camada.fechaSalida)
          : new Date();
        const diasVida = Math.max(
          1,
          Math.ceil((fechaFin.getTime() - fechaIngreso.getTime()) / 86400000)
        );

        // 6. Tasa de crecimiento y engorde
        const tasaCrecimiento = (ultimoPeso - primerPeso) / diasVida;
        const tasaEngorde =
          ultimoPeso - primerPeso > 0
            ? alimentoConsumido / (ultimoPeso - primerPeso)
            : 0;

        // 7. Sensores: temp y humedad promedio
        const seccionIds = db.seccion
          .filter((s: any) => galponIds.includes(s.galponId))
          .map((s: any) => s.seccionId);
        const sensorMap = new Map(db.sensor.map((s: any) => [s.sensorId, s]));
        const lecturas = db.lecturaSensor.filter((l: any) =>
          seccionIds.includes(l.seccionId)
        );
        const temps = lecturas
          .filter((l: any) => sensorMap.get(l.sensorId)?.tipo === "temperatura")
          .map((l: any) => l.valor);
        const hums = lecturas
          .filter((l: any) => sensorMap.get(l.sensorId)?.tipo === "humedad")
          .map((l: any) => l.valor);
        const tempPromedio = temps.length
          ? temps.reduce((a, v) => a + v, 0) / temps.length
          : 0;
        const humedadPromedio = hums.length
          ? hums.reduce((a, v) => a + v, 0) / hums.length
          : 0;

        // 8. Visitas y incidencias
        const visitasVet = db.visitaVeterinaria.filter(
          (v: any) => v.camadaId === id
        ).length;
        const incidencias = db.incidencia.filter(
          (i: any) => i.camadaId === id
        ).length;

        setSummary({
          camadaId: id,
          fechaIngreso: camada.fechaIngreso,
          fechaSalida: camada.fechaSalida,
          pollosRecibidos,
          pollosActuales,
          alimentoConsumido,
          ultimoPesoPromedio: ultimoPeso,
          tasaEngorde,
          tempPromedio,
          humedadPromedio,
          visitasVet,
          incidencias,
          tasaCrecimiento,
        });

        // 9. Galpones asociados
        const galponInfo = db.galpon.filter((g: any) =>
          galponIds.includes(g.galponId)
        );
        setGalpones(galponInfo);

        // 10. Detalle por galpón
        const detalleMap: Record<number, any[]> = {};
        for (const cg of cgAll) {
          const gid = cg.galponId;

          // reunir fechas únicas
          const fechas = new Set<string>();
          mortAll
            .filter((m: any) => m.camadaGalponId === cg.camadaGalponId)
            .forEach((m: any) => fechas.add(m.fecha));
          pesoAll
            .filter((r: any) => r.camadaGalponId === cg.camadaGalponId)
            .forEach((r: any) => fechas.add(r.fecha));
          alimAll
            .filter((r: any) => r.galponId === gid)
            .forEach((r: any) => fechas.add(r.fecha));
          lecturas
            .filter((l: any) => seccionIds.includes(l.seccionId))
            .forEach((l: any) => fechas.add(l.fechaHora.split("T")[0]));

          const allFechas = Array.from(fechas).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          let acumuladoMuertes = 0;
          let prevPeso = primerPeso;

          detalleMap[gid] = allFechas.map((fecha) => {
            const muertesHoy = mortAll
              .filter((m: any) => {
                // busca el cg correspondiente y comprueba que pertenezca a este galpón
                const cg = cgAll.find(
                  (cg) => cg.camadaGalponId === m.camadaGalponId
                );
                return m.fecha === fecha && cg?.galponId === gid;
              })
              .reduce((sum: number, m: any) => sum + m.cantidad, 0);
            acumuladoMuertes += muertesHoy;
            const avesVivas = cg.cantidadInicial - acumuladoMuertes;

            const alimentoHoy = alimAll
              .filter((r: any) => r.fecha === fecha && r.galponId === gid)
              .reduce((sum: number, r: any) => sum + r.cantidadKg, 0);

            const registroHoy = db.registroPeso.find(
              (r: any) =>
                r.fecha === fecha && r.camadaGalponId === cg.camadaGalponId
            );
            const pesoProm = registroHoy?.pesoPromedio ?? prevPeso;
            const tasaCrec = pesoProm - prevPeso;
            prevPeso = pesoProm;
            const tasaEng = tasaCrec > 0 ? alimentoHoy / tasaCrec : 0;

            const lectHoy = lecturas.filter((l) =>
              l.fechaHora.startsWith(fecha)
            );
            const tempsHoy = lectHoy
              .filter((l) => sensorMap.get(l.sensorId)?.tipo === "temperatura")
              .map((l) => l.valor);
            const humHoy = lectHoy
              .filter((l) => sensorMap.get(l.sensorId)?.tipo === "humedad")
              .map((l) => l.valor);
            const tempHoy = tempsHoy.length
              ? tempsHoy.reduce((a, v) => a + v, 0) / tempsHoy.length
              : 0;
            const humHoyAvg = humHoy.length
              ? humHoy.reduce((a, v) => a + v, 0) / humHoy.length
              : 0;

            return {
              id: `${gid}-${fecha}`,
              fecha,
              avesVivas,
              avesFallecidas: muertesHoy,
              alimento: alimentoHoy,
              pesoProm,
              tasaCrec,
              tasaEngorde: tasaEng,
              temp: tempHoy,
              humedad: humHoyAvg,
            };
          });
        }
        setDetallePorGalpon(detalleMap);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    loadInforme();
  }, [camadaId]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !summary) {
    return <Alert severity="error">{error || "Informe no disponible"}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom >
        Informe de camada
      </Typography>
    <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Grid item>
        <Button onClick={() => router.back()}>← Volver</Button>
      </Grid>
    </Grid>

    <SummaryCards data={summary} />

    {galpones.map((gp) => (
      <Box key={gp.galponId} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {gp.nombre}
        </Typography>
        <GalponReportTable
          galpon={gp}
          registros={detallePorGalpon[gp.galponId] || []}
        />
      </Box>
    ))}

    <Grid container justifyContent="flex-end" alignItems="center" sx={{ mt: 4 }}>
      <Button sx={{ mr: 1 }} variant="outlined">
        Exportar CSV
      </Button>
      <Button variant="contained" color="primary">
        Enviar al proveedor
      </Button>
    </Grid>
  </Box>
);
}