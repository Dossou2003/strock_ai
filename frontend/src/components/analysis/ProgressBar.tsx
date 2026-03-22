/**
 * Barre de progression pour l'analyse.
 */

interface ProgressBarProps {
  progress: number;
  status?: string;
}

export default function ProgressBar({ progress, status = 'En cours...' }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{status}</span>
        <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
