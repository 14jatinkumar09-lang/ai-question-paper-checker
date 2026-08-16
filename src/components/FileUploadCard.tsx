import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle, X, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { UploadedDoc, DocumentType } from '../types';

interface FileUploadCardProps {
  id: string;
  type: DocumentType;
  title: string;
  badgeLabel: string;
  description: string;
  document: UploadedDoc | null;
  onFileSelect: (type: DocumentType, file: File) => void;
  onFileRemove: (type: DocumentType) => void;
  colorScheme: 'indigo' | 'blue' | 'purple';
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  id,
  type,
  title,
  badgeLabel,
  description,
  document,
  onFileSelect,
  onFileRemove,
  colorScheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validExtensions.includes(ext)) {
      setErrorMsg('Unsupported format. Please upload PDF, JPG, JPEG, or PNG.');
      return;
    }

    if (file.size > 40 * 1024 * 1024) {
      setErrorMsg('File exceeds 40MB limit. Please upload a smaller file.');
      return;
    }

    onFileSelect(type, file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const openPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const getBorderColor = () => {
    if (errorMsg) return 'border-red-400 bg-red-50/20';
    if (document) return 'border-emerald-500/60 bg-emerald-50/20 ring-1 ring-emerald-400/30';
    if (isDragging) return 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-400/40';
    return 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50';
  };

  return (
    <div
      id={id}
      className={`relative flex flex-col justify-between p-6 rounded-2xl border-2 transition-all duration-200 shadow-xs bg-white ${getBorderColor()}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Card Top / Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 tracking-wide">
            {badgeLabel}
          </span>
          {document ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Uploaded
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-500">Required</span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>
      </div>

      {/* Upload Area or File Info Card */}
      {!document ? (
        <div
          onClick={openPicker}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-colors text-center group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 mb-3 transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 mb-1">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-slate-500">
            PDF, JPG, JPEG, or PNG (up to 40MB)
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                {document.type.includes('pdf') ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate" title={document.name}>
                  {document.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(document.size)} • {document.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                </p>
              </div>
            </div>

            {/* Actions: Replace / Remove */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={openPicker}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="Replace file"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onFileRemove(type)}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {document.previewUrl && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> Preview ready
              </span>
              <span className="text-emerald-700 font-medium">Ready for AI</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
