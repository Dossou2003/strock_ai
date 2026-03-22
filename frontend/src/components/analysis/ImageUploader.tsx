/**
 * Composant pour l'upload d'images CT.
 * Gère le drag & drop et la sélection de fichiers.
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  accept?: string[];
}

export default function ImageUploader({ 
  onUpload, 
  isLoading = false,
  accept = ['image/jpeg', 'image/png', 'image/jpg']
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': accept.map(t => t.replace('image/', '.'))
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleSubmit = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">🧠</div>
          {isDragActive ? (
            <p className="text-xl text-blue-600 font-medium">
              Déposez l'image ici...
            </p>
          ) : (
            <>
              <p className="text-xl text-gray-700 font-medium mb-2">
                Glissez-déposez votre scan CT ici
              </p>
              <p className="text-gray-500">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Formats acceptés: JPG, PNG, JPEG
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black">
            <img
              src={preview}
              alt="Aperçu du scan CT"
              className="w-full h-auto max-h-96 object-contain mx-auto"
            />
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{selectedFile?.name}</p>
              <p className="text-sm text-gray-500">
                {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-red-600 hover:text-red-700 font-medium"
              disabled={isLoading}
            >
              Supprimer
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
              w-full py-4 px-6 rounded-lg text-white font-semibold text-lg
              transition-all duration-200
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyse en cours...
              </span>
            ) : (
              '🔬 Lancer l\'analyse'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
