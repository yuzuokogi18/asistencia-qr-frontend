import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-sm">
        <QrCode className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-1">Página no encontrada</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2">
        La ruta solicitada no existe o ha sido movida. Utiliza los botones inferiores para regresar al sistema.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="secondary"
          size="md"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Regresar
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={Home}
          onClick={() => navigate('/dashboard')}
        >
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
};
