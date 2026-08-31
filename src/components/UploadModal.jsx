import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, CheckCircle, AlertCircle, Loader2, CloudUpload } from 'lucide-react';
import { fileService } from '../services/fileService';
import { formatSize } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function UploadModal({ isOpen, onClose, onUploadComplete, currentFolderId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted) => {
    const newFiles = accepted.map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      progress: 0,
      status: 'pending', // pending | uploading | done | error
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const uploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'done') continue;

      updatedFiles[i].status = 'uploading';
      setFiles([...updatedFiles]);

      try {
        const f = updatedFiles[i].file;

        // Step 1: Get presigned URL
        const { data: initData } = await fileService.initUpload(f.name, f.type || 'application/octet-stream');
        const { uploadUrl, storageKey } = initData;

        // Step 2: Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          body: f,
          headers: { 'Content-Type': f.type || 'application/octet-stream' },
        });

        // Simulate progress
        updatedFiles[i].progress = 80;
        setFiles([...updatedFiles]);

        // Step 3: Notify backend
        await fileService.completeUpload(f.name, storageKey, f.size, f.type || 'application/octet-stream', currentFolderId);

        updatedFiles[i].status = 'done';
        updatedFiles[i].progress = 100;
        setFiles([...updatedFiles]);
      } catch (err) {
        console.error(err);
        updatedFiles[i].status = 'error';
        setFiles([...updatedFiles]);
      }
    }

    setUploading(false);
    const doneCount = updatedFiles.filter((f) => f.status === 'done').length;
    if (doneCount > 0) {
      toast.success(`${doneCount} file${doneCount > 1 ? 's' : ''} uploaded!`);
      onUploadComplete && onUploadComplete();
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 modal-backdrop">
      <div className="glass w-full max-w-lg rounded-2xl p-6 animate-fadeInUp border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
              <CloudUpload className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Upload Files</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 py-10 text-center transition-all ${
            isDragActive ? 'drop-zone-active' : 'hover:border-indigo-500/50 hover:bg-white/[0.02]'
          }`}
        >
          <input {...getInputProps()} />
          <CloudUpload className={`h-10 w-10 ${isDragActive ? 'text-indigo-400' : 'text-slate-600'}`} />
          <div>
            <p className="text-sm font-medium text-slate-300">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-slate-600 mt-1">or click to browse</p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mb-4 space-y-2 max-h-48 overflow-y-auto pr-1">
            {files.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-slate-200">{item.file.name}</p>
                  <p className="text-xs text-slate-600">{formatSize(item.file.size)}</p>
                  {item.status === 'uploading' && (
                    <div className="mt-1.5 h-1 w-full rounded-full bg-white/10">
                      <div className="progress-shimmer h-full rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === 'pending' && (
                    <button onClick={() => removeFile(item.id)} className="text-slate-600 hover:text-slate-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
                  {item.status === 'done' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                  {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={uploadAll}
            disabled={files.length === 0 || uploading}
            className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-4 w-4" /> Upload {files.length > 0 ? `(${files.length})` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}