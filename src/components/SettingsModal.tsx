import { X } from 'lucide-react';
import ModelDashboard from './ModelDashboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-black text-bumble-dark">Model Dashboard</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <ModelDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
