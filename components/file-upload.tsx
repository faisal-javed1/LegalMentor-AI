"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X, FileText, ImageIcon, File, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  multiple?: boolean
  className?: string
}

interface UploadFile {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10,
  acceptedTypes = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"],
  multiple = true,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`
    }

    return null
  }

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)

      if (!multiple && fileArray.length > 1) {
        return
      }

      if (files.length + fileArray.length > maxFiles) {
        return
      }

      const validFiles: UploadFile[] = []

      fileArray.forEach((file) => {
        const error = validateFile(file)
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: error ? "error" : "pending",
          error,
        })
      })

      setFiles((prev) => [...prev, ...validFiles])

      // Simulate upload for valid files
      validFiles.forEach((uploadFile) => {
        if (uploadFile.status === "pending") {
          simulateUpload(uploadFile.id)
        }
      })

      // Call parent callback with valid files
      const validFileObjects = validFiles.filter((f) => f.status !== "error").map((f) => f.file)

      if (validFileObjects.length > 0) {
        onFilesSelected(validFileObjects)
      }
    },
    [files, maxFiles, multiple, onFilesSelected],
  )

  const simulateUpload = (fileId: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" as const } : f)))

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30

      if (progress >= 100) {
        clearInterval(interval)
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "success" as const } : f)))
      } else {
        setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress } : f)))
      }
    }, 200)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (["pdf", "doc", "docx", "txt"].includes(extension || "")) {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "uploading":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      default:
        return null
    }
  }

  return (
    <div className={className}>
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-slate-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">{multiple ? "Upload Files" : "Upload File"}</h3>
            <p className="text-slate-500 mb-4">Drag and drop your files here, or click to browse</p>

            <input
              type="file"
              multiple={multiple}
              accept={acceptedTypes.join(",")}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />

            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose {multiple ? "Files" : "File"}
              </label>
            </Button>

            <div className="mt-4 text-sm text-slate-500">
              <p>Supported formats: {acceptedTypes.join(", ")}</p>
              <p>Maximum file size: {maxSize}MB</p>
              {multiple && <p>Maximum files: {maxFiles}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((uploadFile) => (
            <Card key={uploadFile.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getFileIcon(uploadFile.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{uploadFile.file.name}</p>
                    <p className="text-xs text-slate-500">{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusIcon(uploadFile.status)}
                  <Button variant="ghost" size="sm" onClick={() => removeFile(uploadFile.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploadFile.status === "uploading" && (
                <div className="mt-2">
                  <Progress value={uploadFile.progress} className="h-2" />
                </div>
              )}

              {uploadFile.status === "error" && uploadFile.error && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    {uploadFile.error}
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
