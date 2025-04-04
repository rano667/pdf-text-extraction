import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css"; // Required for text selection styling
import samplePDF from "./invoice.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

const highlightColors = [
  "#FFEB3B66", // Yellow
  "#81C78466", // Green
  "#64B5F666", // Blue
  "#E5737366", // Red
  "#FF980066", // Orange
  "#BA68C866", // Purple
  "#F0629266", // Pink
  "#4DB6AC66", // Teal
];

// Example JSON Data
const jsonData = {
  "Invoice Date": "08-16-2022",
  "Creditor Name": "SFL PVT LTD",
  "Invoice Total": "8978.72",
  "Invoice Number": "77106787",
  "Shipment Number": "12150980",
  "Invoice Currency": "$",
};

const PDFViewer = ({ onTextSelect }) => {
  const [numPages, setNumPages] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const textLayerRef = useRef(null);

  useEffect(() => {
    if (textLayerRef.current) {
      setTimeout(() => autoHighlightText(), 1000); // Delay to ensure text is rendered
    }
  }, [numPages]); // Run once when PDF loads

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const autoHighlightText = () => {
    if (!textLayerRef.current) return;

    const textElements = textLayerRef.current.querySelectorAll("span");

    Object.entries(jsonData).forEach(([key, value], index) => {
      textElements.forEach((span) => {
        if (span.innerText.trim() === value.trim()) {
          const rect = span.getBoundingClientRect();
          setHighlights((prev) => [
            ...prev,
            {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              color: highlightColors[index % highlightColors.length], // Rotate colors
            },
          ]);
        }
      });
    });
  };

  return (
    <div style={{ width: "50%", position: "relative" }}>
      <Document file={samplePDF} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from(new Array(numPages), (el, index) => (
          <div key={index} style={{ position: "relative" }} ref={index === 0 ? textLayerRef : null}>
            <Page pageNumber={index + 1} renderTextLayer />
          </div>
        ))}
      </Document>

      {highlights.map((rect, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            backgroundColor: rect.color,
            border: "1px solid rgba(0, 0, 0, 0.3)",
            borderRadius: "3px",
            boxShadow: "0px 0px 3px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease-in-out",
          }}
        />
      ))}
    </div>
  );
};

export default PDFViewer;
