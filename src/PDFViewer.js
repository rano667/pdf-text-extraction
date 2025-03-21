import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css"; // Import styles for text selection
import samplePDF from "./invoice.pdf"; // Replace with your actual PDF

// PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

const PDFViewer = ({ onTextSelect }) => {
  const [numPages, setNumPages] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const textLayerRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Function to handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection.toString().trim() !== "") {
      setSelectedText(selection.toString());
      onTextSelect(selection.toString()); // Send selected text to parent
    }
  };

  return (
    <div style={{ width: "50%", position: "relative" }} onMouseUp={handleMouseUp}>
      <Document file={samplePDF} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <div key={index} style={{ position: "relative" }}>
            <Page pageNumber={index + 1} renderTextLayer />
          </div>
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
