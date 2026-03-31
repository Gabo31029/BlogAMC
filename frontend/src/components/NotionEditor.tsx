import { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

import { uploadImageToSupabase } from '../lib/posts'

type Props = {
  placeholder?: string
  valueJson: Record<string, unknown> | null
  onChange: (next: { json: Record<string, unknown>; html: string }) => void
  onUploadingChange?: (uploading: boolean) => void
}

function pickImagesFromPasteEvent(event: ClipboardEvent): File[] {
  const dt = event.clipboardData
  if (!dt) return []
  const items = Array.from(dt.items ?? [])
  const images = items
    .filter((i) => i.type.startsWith('image/'))
    .map((i) => i.getAsFile())
    .filter((f): f is File => !!f)
  return images
}

export default function NotionEditor({
  placeholder = 'Empieza a escribir...',
  valueJson,
  onChange,
  onUploadingChange,
}: Props) {
  const onChangeRef = useRef(onChange)
  const onUploadingRef = useRef(onUploadingChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onUploadingRef.current = onUploadingChange
  }, [onUploadingChange])

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Image.configure({
          inline: false,
          allowBase64: false,
        }),
        Placeholder.configure({
          placeholder,
        }),
        Underline,
        Link.configure({
          openOnClick: false,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        TaskList,
        TaskItem,
      ],
      content: valueJson ?? undefined,
      editorProps: {
        handlePaste: (view, event) => {
          // Nota: si el contenido del clipboard incluye imágenes, interceptamos y subimos.
          const images = pickImagesFromPasteEvent(event as ClipboardEvent)
          if (!images.length) return false

          event.preventDefault()

          ;(async () => {
            try {
              onUploadingRef.current?.(true)

              const state = view.state
              let insertPos = state.selection.from

              for (const file of images) {
                const uploaded = await uploadImageToSupabase(file)
                editor?.chain().focus().insertContentAt(insertPos, {
                  type: 'image',
                  attrs: { src: uploaded.url, alt: file.name },
                })

                // Aproximación: avanzar posición para permitir múltiples imágenes.
                insertPos += 1
              }
            } finally {
              onUploadingRef.current?.(false)
            }
          })()

          return true
        },
      },
      onUpdate: ({ editor }) => {
        const json = editor.getJSON() as Record<string, unknown>
        const html = editor.getHTML()
        onChangeRef.current({ json, html })
      },
    },
    [placeholder],
  )

  useEffect(() => {
    if (!editor) return
    if (!valueJson) return
    // Solo sincronizamos cuando hay contenido.
    editor.commands.setContent(valueJson)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueJson])

  return (
    <div className="notion-editor">
      <EditorContent editor={editor} className="min-h-[320px]" />
      <style>{`
        .notion-editor .ProseMirror {
          outline: none;
          padding: 8px 2px;
          min-height: 320px;
        }
        .notion-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: #737373;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .notion-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1.25rem 0;
          border-radius: 0.5rem;
          box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }
        .notion-editor .is-editor-empty::before {
          content: attr(data-placeholder);
        }
      `}</style>
    </div>
  )
}

