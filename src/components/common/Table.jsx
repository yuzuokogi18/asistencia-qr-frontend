import React from 'react';
import { Inbox } from 'lucide-react';

export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No se encontraron registros',
  emptySubMessage = 'Intenta cambiar los filtros de búsqueda o agrega un nuevo elemento.'
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-800">{emptyMessage}</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">{emptySubMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/60 transition-colors duration-150 group"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-5 py-3.5 text-slate-700 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
