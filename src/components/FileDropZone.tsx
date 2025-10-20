'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

export function FileDropZone({
  engagementId, sectionKey, environment, extraFields, onUploaded
}: {
  engagementId: string; sectionKey: string; environment?: string;
  extraFields?: Record<string,string>;
  onUploaded?: ()=>void
}) {
  const [status, setStatus] = useState<string>('Drop or click to upload')
  const onDrop = useCallback(async (accepted: File[]) => {
    for (const file of accepted) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('engagementId', engagementId)
      fd.append('sectionKey', sectionKey)
      if (environment) fd.append('environment', environment)
      if (extraFields) {
        for (const [k,v] of Object.entries(extraFields)) fd.append(k, v)
      }
      const res = await fetch('/api/evidence/upload', { method: 'POST', body: fd })
      setStatus(res.ok ? 'Uploaded ✓' : 'Upload failed')
      if (res.ok) onUploaded?.()
    }
  }, [engagementId, sectionKey, environment, extraFields, onUploaded])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded p-6 text-center ${isDragActive?'bg-blue-50':'bg-white'}`}>
      <input {...getInputProps()} />
      <p className="text-sm">{status}</p>
    </div>
  )
}
