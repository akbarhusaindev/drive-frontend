import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, CheckCircle, AlertCircle, Loader2, File } from 'lucide-react';
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

        updatedFiles[i].progress = 85;
        setFiles([...updatedFiles]);

        // Step 3: Complete upload
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
      toast.success(`${doneCount} file${doneCount > 1 ? 's' : ''} uploaded`);
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
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Upload Files</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-border-strong hover:bg-surface-2'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-6 w-6 text-text-muted" />
          <div>
            <p className="text-xs font-medium text-text-primary">
              {isDragActive ? 'Drop files here' : 'Click to select or drag and drop'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">Documents, photos, videos, and archives</p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mb-4 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-xs"
              >
                <File className="h-4 w-4 shrink-0 text-text-muted" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-text-primary">{item.file.name}</p>
                  <p className="text-[10px] text-text-muted">{formatSize(item.file.size)}</p>
                  {item.status === 'uploading' && (
                    <div className="mt-1 h-1 w-full rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => removeFile(item.id)}
                      className="text-text-muted hover:text-red-500 transition-colors p-1 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {item.status === 'uploading' && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                  {item.status === 'done' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                  {item.status === 'error' && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="btn-secondary rounded-lg px-3.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={uploadAll}
            disabled={files.length === 0 || uploading}
            className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" /> Upload {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}