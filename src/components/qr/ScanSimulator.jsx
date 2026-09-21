import React, { useState } from 'react';
import { Play, Sparkles, ChevronUp, ChevronDown, Check, X, AlertTriangle } from 'lucide-react';

export const ScanSimulator = ({ onSimulateScan, isProcessing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customCode, setCustomCode] = useState('');

  const demoScenarios = [
    {
      label: 'Alejandro Hdez (1° A)',
      matricula: '20261001',
      desc: '1er escaneo: Entrada / 2do: Salida'
    },
    {
      label: 'Sofía García (1° A)',
      matricula: '20261002',
      desc: 'Tiene entrada con retardo'
    },
    {
      label: 'Renata Torres (3° A)',
      matricula: '20261008',
      desc: 'Ya completó su día'
    },
    {
      label: 'Mateo Martínez (1° A)',
      matricula: '20261003',
      desc: 'Sin asistencia registrada hoy'
    },
    {
      label: 'QR Desconocido (Error)',
      matricula: '99999999',
      desc: 'Simula matrícula inexistente'
    }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customCode.trim() && !isProcessing) {
      onSimulateScan(customCode.trim());
      setCustomCode('');
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-40 max-w-md w-full no-print">
      <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
        {/* Barra superior de palanca */}
        <button
          type="button"
          data-interactive="true"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
            <span>Simulador de Lector USB (Modo de Pruebas)</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Panel desplegable con botones de prueba */}
        {isOpen && (
          <div className="p-4 border-t border-slate-800 space-y-3">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Haz clic en cualquier alumno para simular el escaneo automático del código QR como si fuera la pistola lectora física:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {demoScenarios.map((demo) => (
                <button
                  key={demo.matricula}
                  type="button"
                  data-interactive="true"
                  disabled={isProcessing}
                  onClick={() => onSimulateScan(demo.matricula)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-brand-600/90 text-left border border-slate-700/60 hover:border-brand-500 transition-all duration-150 group disabled:opacity-50"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-white">
                      {demo.label}
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-brand-100 font-mono">
                      {demo.matricula} • {demo.desc}
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-brand-400 group-hover:text-white flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Input manual libre */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                data-interactive="true"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Ingresar matrícula manual..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono"
              />
              <button
                type="submit"
                data-interactive="true"
                disabled={!customCode.trim() || isProcessing}
                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                Probar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
