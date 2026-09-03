import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, CheckCircle2, AlertCircle, Loader2, CloudUpload, File, Trash2 } from 'lucide-react';
import { fileService } from '../services/fileService';
import { formatSize, getFileIconInfo } from '../utils/formatters';
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

        // Update progress
        updatedFiles[i].progress = 85;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fadeInUp">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface/95 p-7 shadow-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 shadow-xs">
              <CloudUpload className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-text-primary">Upload Files</h2>
              <p className="text-xs text-text-muted">Direct high-speed upload to your cloud storage</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`mb-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-5 text-center transition-all duration-300 ${
            isDragActive
              ? 'drop-zone-active'
              : 'border-border/80 bg-surface-2/40 hover:border-indigo-500/50 hover:bg-surface-2/70'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-500 shadow-xs">
            <CloudUpload className={`h-7 w-7 ${isDragActive ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              {isDragActive ? 'Release to upload files instantly...' : 'Drag & drop files here, or click to browse'}
            </p>
            <p className="text-xs text-text-muted mt-1">Supports any file format: Documents, Media, Archives, Code</p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mb-6 space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {files.map((item) => {
              const { Icon, color, bg } = getFileIconInfo({
                originalName: item.file.name,
                mimeType: item.file.type,
                type: 'file',
              });

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface-2/60 px-4 py-3 transition-all"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: bg }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-bold text-text-primary">{item.file.name}</p>
                    <p className="text-[10px] text-text-muted">{formatSize(item.file.size)}</p>
                    {item.status === 'uploading' && (
                      <div className="mt-2 h-1.5 w-full rounded-full bg-surface-3 overflow-hidden">
                        <div
                          className="progress-shimmer h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => removeFile(item.id)}
                        className="text-text-muted hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-surface-3 cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {item.status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {item.status === 'error' && <AlertCircle className="h-4 w-4 text-rose-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 btn-secondary rounded-2xl py-3 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={uploadAll}
            disabled={files.length === 0 || uploading}
            className="flex-1 btn-primary rounded-2xl py-3 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Upload {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}