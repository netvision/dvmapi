<template>
  <div class="rich-editor-wrapper">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50 rounded-t-lg">

      <button type="button" @click="editor?.chain().focus().toggleBold().run()"
        :class="editor?.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn font-bold" title="Bold">B</button>

      <button type="button" @click="editor?.chain().focus().toggleItalic().run()"
        :class="editor?.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn italic" title="Italic">I</button>

      <button type="button" @click="editor?.chain().focus().toggleStrike().run()"
        :class="editor?.isActive('strike') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn line-through" title="Strikethrough">S</button>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="editor?.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn text-xs font-semibold" title="Heading 2">H2</button>

      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="editor?.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn text-xs font-semibold" title="Heading 3">H3</button>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <button type="button" @click="editor?.chain().focus().toggleBulletList().run()"
        :class="editor?.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn" title="Bullet list">
        <List class="w-3.5 h-3.5" />
      </button>

      <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="editor?.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn" title="Numbered list">
        <ListOrdered class="w-3.5 h-3.5" />
      </button>

      <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="editor?.isActive('blockquote') ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200'"
        class="toolbar-btn" title="Blockquote">
        <Quote class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-5 bg-slate-300 mx-1" />

      <button type="button" @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        class="toolbar-btn text-slate-600 hover:bg-slate-200 disabled:opacity-30" title="Undo">
        <Undo2 class="w-3.5 h-3.5" />
      </button>

      <button type="button" @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        class="toolbar-btn text-slate-600 hover:bg-slate-200 disabled:opacity-30" title="Redo">
        <Redo2 class="w-3.5 h-3.5" />
      </button>

    </div>

    <!-- Editor content area -->
    <EditorContent :editor="editor" class="rich-editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { List, ListOrdered, Quote, Undo2, Redo2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  minHeight?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder || 'Start writing…',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[160px] p-3',
    },
  },
  onUpdate({ editor }) {
    const html = editor.getHTML()
    // Treat empty editor as empty string
    emit('update:modelValue', html === '<p></p>' ? '' : html)
  },
})

// Sync inbound changes (e.g. when loading saved lesson plan)
watch(() => props.modelValue, (newVal) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  const incoming = newVal || ''
  if (current !== incoming) {
    editor.value.commands.setContent(incoming)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rich-editor-wrapper {
  @apply border border-slate-200 rounded-lg overflow-hidden bg-white;
}

.toolbar-btn {
  @apply w-7 h-7 flex items-center justify-center rounded text-sm transition-colors cursor-pointer select-none;
}

/* Prose styles (scoped won't reach inside EditorContent, use :deep) */
:deep(.rich-editor-content) {
  > div {
    min-height: v-bind('props.minHeight || "160px"');
  }

  .ProseMirror {
    @apply p-3 text-sm text-slate-800 leading-relaxed focus:outline-none min-h-[160px];
  }

  .ProseMirror p {
    @apply mb-2;
  }

  .ProseMirror h2 {
    @apply text-base font-semibold text-slate-900 mt-3 mb-1;
  }

  .ProseMirror h3 {
    @apply text-sm font-semibold text-slate-800 mt-2 mb-1;
  }

  .ProseMirror ul {
    @apply list-disc pl-5 mb-2;
  }

  .ProseMirror ol {
    @apply list-decimal pl-5 mb-2;
  }

  .ProseMirror blockquote {
    @apply border-l-4 border-slate-300 pl-3 italic text-slate-500 my-2;
  }

  .ProseMirror strong {
    @apply font-semibold;
  }

  .ProseMirror em {
    @apply italic;
  }

  .ProseMirror s {
    @apply line-through;
  }

  /* Placeholder */
  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    @apply text-slate-400 float-left h-0 pointer-events-none;
  }
}
</style>
