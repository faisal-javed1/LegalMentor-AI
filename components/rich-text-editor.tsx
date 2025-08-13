"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link,
  ImageIcon,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onSave?: (content: string) => void
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  onSave,
}: RichTextEditorProps) {
  const [content, setContent] = useState(value)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setContent(value)
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange(newContent)
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      execCommand("insertHTML", linkHtml)
      setLinkUrl("")
      setLinkText("")
      setShowLinkDialog(false)
    }
  }

  const insertTable = () => {
    const tableHtml = `
      <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 1</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 2</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 3</td>
          <td style="padding: 8px; border: 1px solid #ddd;">Cell 4</td>
        </tr>
      </table>
    `
    execCommand("insertHTML", tableHtml)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(content)
    }
  }

  const toolbarButtons = [
    { icon: Bold, command: "bold", tooltip: "Bold" },
    { icon: Italic, command: "italic", tooltip: "Italic" },
    { icon: Underline, command: "underline", tooltip: "Underline" },
    { icon: Strikethrough, command: "strikeThrough", tooltip: "Strikethrough" },
  ]

  const listButtons = [
    { icon: List, command: "insertUnorderedList", tooltip: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", tooltip: "Numbered List" },
  ]

  const alignButtons = [
    { icon: AlignLeft, command: "justifyLeft", tooltip: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", tooltip: "Align Center" },
    { icon: AlignRight, command: "justifyRight", tooltip: "Align Right" },
  ]

  return (
    <div className={`border border-slate-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-300 p-2 flex items-center gap-1 flex-wrap">
        {/* Undo/Redo */}
        <Button variant="ghost" size="sm" onClick={() => execCommand("undo")} title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand("redo")} title="Redo">
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        {toolbarButtons.map((button) => (
          <Button
            key={button.command}
            variant="ghost"
            size="sm"
            onClick={() => execCommand(button.command)}
            title={button.tooltip}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        {listButtons.map((button) => (
          <Button
            key={button.command}
            variant="ghost"
            size="sm"
            onClick={() => execCommand(button.command)}
            title={button.tooltip}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        {alignButtons.map((button) => (
          <Button
            key={button.command}
            variant="ghost"
            size="sm"
            onClick={() => execCommand(button.command)}
            title={button.tooltip}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Quote */}
        <Button variant="ghost" size="sm" onClick={() => execCommand("formatBlock", "blockquote")} title="Quote">
          <Quote className="h-4 w-4" />
        </Button>

        {/* Link */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Insert Link">
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
              <DialogDescription>Add a link to your document</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={insertLink}>Insert Link</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <Button variant="ghost" size="sm" onClick={insertTable} title="Insert Table">
          <Table className="h-4 w-4" />
        </Button>

        {/* Image */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter image URL:")
            if (url) {
              execCommand("insertImage", url)
            }
          }}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {onSave && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button variant="ghost" size="sm" onClick={handleSave} title="Save">
              <Save className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none"
        style={{ wordWrap: "break-word" }}
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={updateContent}
        onBlur={updateContent}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 16px 0;
          padding-left: 16px;
          color: #6b7280;
          font-style: italic;
        }
        
        [contenteditable] table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }
        
        [contenteditable] table td {
          border: 1px solid #e5e7eb;
          padding: 8px;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          margin: 16px 0;
        }
      `}</style>
    </div>
  )
}
