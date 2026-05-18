import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, 
  Heading1, Heading2, List, ListOrdered, Quote, 
  Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Space, MoveVertical
} from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spacing: {
      setMarginTop: (value: string) => ReturnType;
      setMarginBottom: (value: string) => ReturnType;
    }
  }
}

const SpacingExtension = Extension.create({
  name: 'spacing',
  
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          marginTop: {
            default: null,
            parseHTML: element => element.style.marginTop || null,
            renderHTML: attributes => {
              if (!attributes.marginTop) return {};
              return { style: `margin-top: ${attributes.marginTop}` };
            },
          },
          marginBottom: {
            default: null,
            parseHTML: element => element.style.marginBottom || null,
            renderHTML: attributes => {
              if (!attributes.marginBottom) return {};
              return { style: `margin-bottom: ${attributes.marginBottom}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setMarginTop: (value: string) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { marginTop: value }) || 
               commands.updateAttributes('heading', { marginTop: value });
      },
      setMarginBottom: (value: string) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { marginBottom: value }) ||
               commands.updateAttributes('heading', { marginBottom: value });
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded ${editor.isActive('strike') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1.5 rounded ${editor.isActive('highlight') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Highlight"
      >
        <Highlighter size={16} />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1.5 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1.5 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1.5 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-1.5 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Align Justify"
      >
        <AlignJustify size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded ${editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>

      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded ${editor.isActive('link') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
        title="Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-1.5 rounded text-gray-600 hover:bg-gray-200"
        title="Image"
      >
        <ImageIcon size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>
      
      <div className="flex items-center gap-1 p-1.5 rounded hover:bg-gray-200" title="Text Color">
        <input
          type="color"
          onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
        />
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>
      
      <button
        type="button"
        onClick={() => {
          const currentMarginTop = editor.getAttributes('paragraph').marginTop || editor.getAttributes('heading').marginTop || '0px';
          const val = window.prompt('Margin Top (e.g. 10px, 1em):', currentMarginTop);
          if (val !== null) editor.chain().focus().setMarginTop(val).run();
        }}
        className="p-1.5 rounded text-gray-600 hover:bg-gray-200"
        title="Margin Top"
      >
        <MoveVertical size={16} className="rotate-180" />
      </button>

      <button
        type="button"
        onClick={() => {
          const currentMarginBottom = editor.getAttributes('paragraph').marginBottom || editor.getAttributes('heading').marginBottom || '0px';
          const val = window.prompt('Margin Bottom (e.g. 10px, 1em):', currentMarginBottom);
          if (val !== null) editor.chain().focus().setMarginBottom(val).run();
        }}
        className="p-1.5 rounded text-gray-600 hover:bg-gray-200"
        title="Margin Bottom"
      >
        <MoveVertical size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 my-0.5"></div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg mx-auto',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      SpacingExtension,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-accent/30 rounded inline-block',
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] p-4 max-w-none',
      },
    },
  });

  // Update editor content if standard content changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:ring-1 focus-within:ring-accent focus-within:border-accent">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
