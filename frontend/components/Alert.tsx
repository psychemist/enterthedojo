'use client';

import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  type,
  title,
  message,
  onClose,
  className = '',
}: AlertProps) {
  const styles = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: XCircle,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      icon: Info,
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      icon: AlertTriangle,
    },
  };

  const { bg, border, text, icon: Icon } = styles[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${text} mb-1`}>{title}</h4>
          )}
          <div className="text-gray-300 text-sm">{message}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Toast notification (can be used with a toast library)
export function SuccessToast({ message }: { message: string }) {
  return (
    <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <CheckCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}

export function ErrorToast({ message }: { message: string }) {
  return (
    <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <XCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}
