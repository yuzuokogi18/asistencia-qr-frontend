import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Trash2, 
  Users, 
  ArrowRight,
  Sparkles,
  FileCheck
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const ImportarAlumnosModal = ({ 
  isOpen, 
  onClose, 
  grupoId, 
  nombreGrupo, 
  onCrearGrupoPrimero, 
  onCompletado 
}) => {
  const { error, success } = useToast();
  const fileInputRef = useRef(null);

  const [archivo, setArchivo] = useState(null);
  const [alumnosFilas, setAlumnosFilas] = useState([]);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  // Estados de progreso de importación
  const [importando, setImportando] = useState(false);
  const [progresoActual, setProgresoActual] = useState(0);
  const [totalAImportar, setTotalAImportar] = useState(0);
  const [alumnoActualNombre, setAlumnoActualNombre] = useState('');
  
  // Resumen final
  const [resumenFinal, setResumenFinal] = useState(null);

  if (!isOpen) return null;

  // Descargar plantilla de ejemplo
  const handleDescargarPlantilla = () => {
    const csvContent = 
      "matricula,nombre,apellido_paterno,apellido_materno\n" +
      "20262001,Juan Pablo,Ramirez,Solis\n" +
      "20262002,Maria Fernanda,Castillo,Lopez\n" +
      "20262003,Carlos Alberto,Mendoza,Cruz\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_importacion_alumnos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Normalizar encabezados (soporta variaciones con tildes, mayúsculas y espacios)
  const normalizarLlave = (k) => {
    if (!k || typeof k !== 'string') return '';
    let limpia = k.replace(/^\uFEFF/, '').toLowerCase().trim();
    limpia = limpia.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // sin acentos
    limpia = limpia.replace(/[^a-z0-9_\s]/g, ' ').replace(/\s+/g, ' ').trim();

    // 1. Apellidos PRIMERO (crítico para que 'id' dentro de apellido_paterno jamás haga match con 'id')
    if (
      limpia.includes('paterno') || 
      limpia.includes('primer apellido') || 
      limpia.includes('primer_apellido') || 
      limpia === 'ap1' || 
      limpia === 'ap_paterno' || 
      limpia === 'ap paterno' ||
      limpia === 'apellido 1' ||
      limpia === 'apellido1'
    ) {
      return 'apellido_paterno';
    }

    if (
      limpia.includes('materno') || 
      limpia.includes('segundo apellido') || 
      limpia.includes('segundo_apellido') || 
      limpia === 'ap2' || 
      limpia === 'ap_materno' || 
      limpia === 'ap materno' ||
      limpia === 'apellido 2' ||
      limpia === 'apellido2'
    ) {
      return 'apellido_materno';
    }

    if (limpia === 'apellidos' || limpia === 'apellido') {
      return 'apellidos_juntos';
    }

    // 2. Matrícula / Control / ID
    // CRÍTICO: verificar límites de palabra para 'id' (\bid\b) para nunca coincidir con "apellido"
    if (
      limpia.includes('matricula') || 
      limpia.includes('control') || 
      limpia.includes('carnet') || 
      limpia.includes('codigo') || 
      limpia.includes('identificador') || 
      /\bid\b/.test(limpia) || 
      limpia.startsWith('id_') || 
      limpia.endsWith('_id') || 
      limpia === 'id'
    ) {
      return 'matricula';
    }

    // 3. Nombre
    if (
      limpia === 'nombre' || 
      limpia === 'nombres' || 
      limpia.startsWith('nombre ') || 
      limpia.startsWith('nombres ') || 
      limpia.includes('nombre(s)')
    ) {
      return 'nombre';
    }

    if (limpia.includes('completo') || limpia === 'alumno') {
      return 'nombre_completo';
    }

    return limpia;
  };

  const procesarFilasParseadas = (filasCrudas) => {
    const matriculasVistas = new Set();
    const filasValidadas = [];

    for (let i = 0; i < filasCrudas.length; i++) {
      const raw = filasCrudas[i];
      if (!raw) continue;

      const normalizado = {};
      const keys = Object.keys(raw);

      // Mapear llaves normalizadas
      keys.forEach((key) => {
        const standardKey = normalizarLlave(key);
        const val = raw[key] !== undefined && raw[key] !== null ? String(raw[key]).trim() : '';
        if (standardKey) {
          normalizado[standardKey] = val;
        }
      });

      // Si viene una columna 'apellidos_juntos' y faltan paterno/materno
      if (normalizado.apellidos_juntos && !normalizado.apellido_paterno) {
        const partes = normalizado.apellidos_juntos.trim().split(/\s+/);
        normalizado.apellido_paterno = partes[0] || '';
        normalizado.apellido_materno = partes.slice(1).join(' ') || '';
      }

      const valores = keys.map(k => raw[k] !== undefined && raw[k] !== null ? String(raw[k]).trim() : '');
      let matricula = normalizado.matricula || '';
      let nombre = normalizado.nombre || '';
      let apellido_paterno = normalizado.apellido_paterno || '';
      let apellido_materno = normalizado.apellido_materno || '';

      // Fallback posicional si no se reconocieron los nombres de cabecera
      if (!matricula && !nombre && !apellido_paterno && valores.length >= 3) {
        matricula = valores[0] || '';
        nombre = valores[1] || '';
        apellido_paterno = valores[2] || '';
        apellido_materno = valores[3] || '';
      }

      // Omitir filas totalmente vacías
      if (!matricula && !nombre && !apellido_paterno && !apellido_materno) {
        continue;
      }

      // Detección de errores
      const errores = [];
      if (!matricula) {
        errores.push('Matrícula vacía');
      } else if (matriculasVistas.has(matricula.toLowerCase())) {
        errores.push('Matrícula duplicada en el archivo');
      } else {
        matriculasVistas.add(matricula.toLowerCase());
      }

      if (!nombre) errores.push('Nombre faltante');
      if (!apellido_paterno) errores.push('Apellido paterno faltante');

      filasValidadas.push({
        idTemporal: i + 1,
        matricula,
        nombre,
        apellido_paterno,
        apellido_materno,
        esValido: errores.length === 0,
        errores,
      });
    }

    setAlumnosFilas(filasValidadas);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivo(file);
    setCargandoArchivo(true);
    setResumenFinal(null);

    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
        complete: (results) => {
          procesarFilasParseadas(results.data);
          setCargandoArchivo(false);
        },
        error: (err) => {
          error('Error al leer el archivo CSV: ' + err.message);
          setCargandoArchivo(false);
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
          procesarFilasParseadas(data);
        } catch (err) {
          error('Error al procesar el archivo Excel: ' + err.message);
        } finally {
          setCargandoArchivo(false);
        }
      };
      reader.onerror = () => {
        error('No se pudo leer el archivo Excel');
        setCargandoArchivo(false);
      };
      reader.readAsBinaryString(file);
    } else {
      error('Formato no soportado. Por favor suba un archivo CSV o Excel (.xlsx, .xls).');
      setCargandoArchivo(false);
    }
  };

  const handleEliminarFila = (idTemporal) => {
    setAlumnosFilas(prev => prev.filter(f => f.idTemporal !== idTemporal));
  };

  const validos = alumnosFilas.filter(f => f.esValido);
  const conErrores = alumnosFilas.filter(f => !f.esValido);

  const handleConfirmarImportacion = async () => {
    if (validos.length === 0) {
      error('No hay alumnos válidos para importar.');
      return;
    }

    setImportando(true);
    setTotalAImportar(validos.length);
    setProgresoActual(0);

    let targetGrupoId = grupoId;

    // Si el grupo aún no ha sido guardado, ejecutar el callback para guardarlo primero
    if (!targetGrupoId && onCrearGrupoPrimero) {
      try {
        setAlumnoActualNombre('Guardando configuración del nuevo grupo...');
        const nuevoG = await onCrearGrupoPrimero();
        if (!nuevoG || !nuevoG.id) {
          throw new Error('No se pudo registrar el grupo previo a la importación');
        }
        targetGrupoId = nuevoG.id;
      } catch (err) {
        error(err.message || 'Error al crear el grupo para la importación');
        setImportando(false);
        return;
      }
    }

    let exitosos = 0;
    const fallidos = [];

    for (let i = 0; i < validos.length; i++) {
      const a = validos[i];
      setProgresoActual(i + 1);
      setAlumnoActualNombre(`${a.nombre} ${a.apellido_paterno} (${a.matricula})`);

      try {
        await apiClient.crearAlumno({
          matricula: a.matricula,
          nombre: a.nombre,
          apellido_paterno: a.apellido_paterno,
          apellido_materno: a.apellido_materno || '',
          grupo_id: targetGrupoId,
        });
        exitosos++;
      } catch (err) {
        fallidos.push({
          matricula: a.matricula,
          nombreCompleto: `${a.nombre} ${a.apellido_paterno}`,
          razon: err.message || 'Error en servidor',
        });
      }
    }

    setImportando(false);
    setResumenFinal({
      total: validos.length,
      exitosos,
      fallidos,
    });

    if (exitosos > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
      success(`Importación concluida: ${exitosos} alumnos agregados exitosamente.`);
      if (onCompletado) onCompletado(targetGrupoId);
    }
  };

  const handleCerrar = () => {
    setArchivo(null);
    setAlumnosFilas([]);
    setResumenFinal(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Importar Lista de Alumnos
              </h2>
              <p className="text-xs text-slate-500">
                {nombreGrupo ? `Grupo destino: ${nombreGrupo}` : 'Carga masiva desde archivo CSV o Excel'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCerrar}
            disabled={importando}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DEL MODAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* RESUMEN FINAL SI YA TERMINÓ */}
          {resumenFinal ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  ¡Importación Completada!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se procesó la lista de alumnos para el grupo escolar.
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">REGISTRADOS CON ÉXITO</p>
                  <p className="text-2xl font-black text-emerald-900 mt-0.5">{resumenFinal.exitosos}</p>
                  <span className="text-[11px] text-emerald-700 font-medium">Listos con código QR unívoco</span>
                </div>

                <div className={`p-4 rounded-xl border ${
                  resumenFinal.fallidos.length > 0 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider">FALLIDOS U OMITIDOS</p>
                  <p className="text-2xl font-black mt-0.5">{resumenFinal.fallidos.length}</p>
                  <span className="text-[11px] font-medium">
                    {resumenFinal.fallidos.length > 0 ? 'Detalles abajo' : 'Ningún error reportado'}
                  </span>
                </div>
              </div>

              {/* Desglose de errores si los hubo */}
              {resumenFinal.fallidos.length > 0 && (
                <div className="max-w-xl mx-auto text-left p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Detalle de alumnos no registrados:</span>
                  </p>
                  <div className="max-h-36 overflow-y-auto divide-y divide-red-100 text-xs text-red-700">
                    {resumenFinal.fallidos.map((f, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between">
                        <span className="font-semibold">{f.nombreCompleto} ({f.matricula}):</span>
                        <span className="text-red-600 font-mono text-[11px]">{f.razon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleCerrar}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Finalizar y Cerrar
                </button>
              </div>
            </div>
          ) : importando ? (
            /* BARRA DE PROGRESO EN VIVO DURANTE EL ENVÍO */
            <div className="text-center py-12 space-y-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto animate-pulse">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Dando de alta alumnos en el sistema...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Por favor espere mientras se generan las matrículas y códigos QR.
                </p>
              </div>

              {/* Barra de Progreso */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Alumno {progresoActual} de {totalAImportar}</span>
                  <span>{Math.round((progresoActual / totalAImportar) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-200"
                    style={{ width: `${(progresoActual / totalAImportar) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 truncate pt-1 font-mono">
                  {alumnoActualNombre}
                </p>
              </div>
            </div>
          ) : !archivo ? (
            /* ZONA DE CARGA DE ARCHIVO */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 text-xs text-blue-900">
                  <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    El archivo debe incluir las columnas: <strong>matricula</strong>, <strong>nombre</strong>, <strong>apellido_paterno</strong>, <strong>apellido_materno</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDescargarPlantilla}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Plantilla</span>
                </button>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-slate-200 text-blue-600 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Haga clic para seleccionar o arrastre su archivo aquí
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Archivos compatibles: <strong>CSV</strong> (.csv) o <strong>Excel</strong> (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* VISTA PREVIA EN TABLA ANTES DE CONFIRMAR */
            <div className="space-y-4">
              {/* Barra de Estado del Archivo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    XLS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{archivo.name}</p>
                    <p className="text-[10px] text-slate-400">{(archivo.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                    ✓ {validos.length} válidos
                  </span>
                  {conErrores.length > 0 && (
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold">
                      ⚠️ {conErrores.length} con error
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setArchivo(null);
                      setAlumnosFilas([]);
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 ml-2 font-medium"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>

              {/* Alerta si hay filas con error */}
              {conErrores.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Hay {conErrores.length} fila(s) con matrículas vacías, repetidas o nombres faltantes (marcadas en rojo). Solo se darán de alta las filas válidas.
                  </span>
                </div>
              )}

              {/* TABLA DE VISTA PREVIA */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Matrícula</th>
                      <th className="py-2.5 px-3">Nombre</th>
                      <th className="py-2.5 px-3">Apellido Paterno</th>
                      <th className="py-2.5 px-3">Apellido Materno</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Descartar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alumnosFilas.map((fila, idx) => (
                      <tr 
                        key={fila.idTemporal} 
                        className={`transition-colors ${
                          !fila.esValido 
                            ? 'bg-red-50/70 text-red-900 font-medium' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2 px-3 text-center text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold">
                          {fila.matricula || <span className="text-red-500 italic">[Vacía]</span>}
                        </td>
                        <td className="py-2 px-3">{fila.nombre || <span className="text-red-500 italic">[Faltante]</span>}</td>
                        <td className="py-2 px-3">{fila.apellido_paterno || <span className="text-red-500 italic">[Faltante]</span>}</td>
                        <td className="py-2 px-3 text-slate-500">{fila.apellido_materno || '-'}</td>
                        <td className="py-2 px-3">
                          {fila.esValido ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                              ✓ Válido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                              ✕ {fila.errores.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleEliminarFila(fila.idTemporal)}
                            title="Eliminar de la lista"
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACCIONES */}
        {!resumenFinal && !importando && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCerrar}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors"
            >
              Cancelar
            </button>

            {archivo && (
              <button
                type="button"
                disabled={validos.length === 0}
                onClick={handleConfirmarImportacion}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                <span>Confirmar e Importar {validos.length} Alumnos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
