import React from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from 'quill-image-resize-module-react';
import 'react-quill/dist/quill.snow.css'; 
import '../styles/styles.css'

const PostContent = ({ value, onChange }) => {
  return (
    <ReactQuill
      placeholder="Ingresa el contenido de tu publicación..."
      modules={PostContent.modules}
      formats={PostContent.formats}
      onChange={onChange}
      value={value}
      className="quill-editor"
    />
  );
};

Quill.register('modules/imageResize', ImageResize);

PostContent.modules = {
  toolbar: [
    [{ header: [] }, { font: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["code-block"],
    ["clean"],
  ],
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize', 'Toolbar']
  }
};

PostContent.formats = [
  "header",
  "font",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "align",
  "list",
  "bullet",
  "link",
  "image",
  "code-block",
  "clean"
];

export default PostContent;
