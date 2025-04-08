import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import samplePDF from "./invoice.pdf";
import { v4 as uuidv4 } from "uuid";

// PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// Highlight color palette
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

// Initial JSON data to auto-highlight
const initialData = {
  "Invoice Date": "08-16-2022",
  "Creditor Name": "SFL PVT LTD",
  "Invoice Total": "$8978.72",
  "Invoice Number": "77106787",
  "Shipment Number": "12150980",
  "Invoice Currency": "$",
};

const getHighlightStyle = (color) => {
  const borderColor = color.replace(/66$/, "CC");
  return {
    backgroundColor: color,
    border: `1px solid ${borderColor}`,
    borderRadius: 2,
    padding: "2px",
    pointerEvents: "none",
    boxSizing: "border-box",
  };
};

const PDFViewer = ({ onTextSelect }) => {
  const [numPages, setNumPages] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [selectedColor, setSelectedColor] = useState(highlightColors[0]);
  const [autoColor, setAutoColor] = useState(true);
  const [colorIndex, setColorIndex] = useState(0);
  const [scale, setScale] = useState(1.5);
  const viewerRef = useRef();


  // it sets the number of pages in the document
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // it gets the selected text and its bounding rectangle, and creates a highlight object 
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = viewerRef.current.getBoundingClientRect();

    const top = rect.top - containerRect.top + viewerRef.current.scrollTop;
    const left = rect.left - containerRect.left + viewerRef.current.scrollLeft;

    const color = autoColor
      ? highlightColors[colorIndex % highlightColors.length]
      : selectedColor;

    if (autoColor) setColorIndex((i) => (i + 1) % highlightColors.length);

    const newHighlight = {
      id: uuidv4(),
      top,
      left,
      width: rect.width,
      height: rect.height,
      text: selectedText,
      color,
      auto: false,
    };

    setHighlights((prev) => [...prev, newHighlight]);
    onTextSelect(selectedText);
    selection.removeAllRanges();
  };

  // it removes the last highlight from the highlights array
  const undoLastHighlight = () => {
    setHighlights((prev) => prev.slice(0, -1));
  };

  // it clears all highlights from the highlights array
  const clearAllHighlights = () => {
    setHighlights([]);
  };

  // it runs the auto highlight function on the spans of the PDF document
  const runAutoHighlight = (spans) => {
    const newHighlights = [];
    let autoColorIndex = 0;

    const spanList = Array.from(spans);
    const textChunks = spanList.map((span) => span.textContent.trim());

    console.log("textChunks:", textChunks);

    Object.values(initialData).forEach((rawValue) => {
      const cleanValue = rawValue.toString().trim();
      const words = cleanValue.split(/\s+/);
      const matchLength = words.length;

      for (let i = 0; i <= textChunks.length - matchLength; i++) {
        const chunk = textChunks.slice(i, i + matchLength).join(" ");
        if (chunk === cleanValue) {
          const matchedSpans = spanList.slice(i, i + matchLength);

          const rects = matchedSpans.map((s) => s.getBoundingClientRect());
          const containerRect = viewerRef.current.getBoundingClientRect();

          const top =
            Math.min(...rects.map((r) => r.top)) -
            containerRect.top +
            viewerRef.current.scrollTop;
          const left =
            Math.min(...rects.map((r) => r.left)) -
            containerRect.left +
            viewerRef.current.scrollLeft;
          const right =
            Math.max(...rects.map((r) => r.right)) -
            containerRect.left +
            viewerRef.current.scrollLeft;
          const bottom =
            Math.max(...rects.map((r) => r.bottom)) -
            containerRect.top +
            viewerRef.current.scrollTop;

          const width = right - left;
          const height = bottom - top;

          const color =
            highlightColors[autoColorIndex % highlightColors.length];
          autoColorIndex++;

          newHighlights.push({
            id: uuidv4(),
            top,
            left,
            width,
            height,
            text: cleanValue,
            color,
            auto: true,
          });
          break;
        }
      }
    });

    if (newHighlights.length > 0) {
      setHighlights((prev) => [...prev, ...newHighlights]);
    }
  };

  // it sets up a MutationObserver to watch for changes in the PDF document and run the auto highlight function when the span count stabilizes
  useEffect(() => {
    if (!numPages) return;

    let prevSpanCount = 0;
    let stableTimer = null;
    let observer = null;

    const startObserving = () => {
      observer = new MutationObserver(() => {
        const allSpans = viewerRef.current.querySelectorAll(
          ".react-pdf__Page__textContent span"
        );
        const filteredSpans = Array.from(allSpans).filter(
          (s) => s.textContent.trim() !== ""
        );

        console.log("Filtered span count:", filteredSpans.length);

        // Check if span count has stabilized
        if (filteredSpans.length === prevSpanCount) {
          clearTimeout(stableTimer);
          stableTimer = setTimeout(() => {
            observer.disconnect();
            // filteredSpansRef.current = filteredSpans;
            runAutoHighlight(filteredSpans);
          }, 500);
        } else {
          prevSpanCount = filteredSpans.length;
        }
      });

      observer.observe(viewerRef.current, { childList: true, subtree: true });
    };

    startObserving();

    return () => {
      if (observer) observer.disconnect();
      if (stableTimer) clearTimeout(stableTimer);
    };
  }, [numPages]);

  // it sets up event listeners for keyboard shortcuts and mouse wheel events to control zooming
  useEffect(() => {
    const isMac = /Mac/i.test(navigator.platform);

    const handleKeyDown = (e) => {
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key === "=") {
        e.preventDefault();
        setScale((prev) => Math.min(prev + 0.1, 3));
      } else if (ctrlOrCmd && e.key === "-") {
        e.preventDefault();
        setScale((prev) => Math.max(prev - 0.1, 0.5));
      } else if (ctrlOrCmd && e.key === "0") {
        e.preventDefault();
        setScale(1.5);
      }
    };

    const handleWheel = (e) => {
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd) {
        e.preventDefault();
        if (e.deltaY < 0) {
          // scroll up → zoom in
          setScale((prev) => Math.min(prev + 0.1, 3));
        } else {
          // scroll down → zoom out
          setScale((prev) => Math.max(prev - 0.1, 0.5));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // it handles right-click events on highlights to remove them *not working
  const handleRightClick = (e, id) => {
    e.preventDefault(); // prevent browser context menu
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  // it clears previous highlights and runs the auto highlight function when the scale changes
  useEffect(() => {
    if (!numPages) return;

    clearAllHighlights(); // Clear previous highlights

    const timeout = setTimeout(() => {
      const spans = viewerRef.current?.querySelectorAll(
        ".react-pdf__Page__textContent span"
      );
      const filteredSpans = Array.from(spans || []).filter(
        (s) => s.textContent.trim() !== ""
      );

      // Clear previous highlights
      runAutoHighlight(filteredSpans);
    }, 500); // debounce delay after scale change

    return () => clearTimeout(timeout);
  }, [scale, numPages]);

  return (
    <div style={{ width: "80%", position: "relative" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "10px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <label>
          <strong>Highlight Color:</strong>
        </label>
        {highlightColors.map((color, i) => (
          <div
            key={i}
            onClick={() => {
              setSelectedColor(color);
              setAutoColor(false);
            }}
            style={{
              backgroundColor: color,
              border:
                selectedColor === color && !autoColor
                  ? "2px solid black"
                  : "1px solid gray",
              width: 20,
              height: 20,
              cursor: "pointer",
              borderRadius: 4,
            }}
          />
        ))}
        <button
          onClick={() => setAutoColor(!autoColor)}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            backgroundColor: autoColor ? "#4CAF50" : "#9E9E9E",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Auto Color: {autoColor ? "On" : "Off"}
        </button>
        <button
          onClick={undoLastHighlight}
          disabled={highlights.length === 0}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            cursor: highlights.length ? "pointer" : "not-allowed",
          }}
        >
          Undo Last
        </button>
        <button
          onClick={clearAllHighlights}
          disabled={highlights.length === 0}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            backgroundColor: "#607D8B",
            color: "#fff",
            border: "none",
            cursor: highlights.length ? "pointer" : "not-allowed",
          }}
        >
          Clear All
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              backgroundColor: "#2196F3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            − Zoom Out
          </button>
          <span style={{ minWidth: 50, textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              backgroundColor: "#2196F3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            ＋ Zoom In
          </button>
          <button
            onClick={() => setScale(1.5)}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              backgroundColor: "#FFC107",
              color: "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Reset Zoom
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        ref={viewerRef}
        onMouseUp={handleMouseUp}
        style={{
          position: "relative",
          height: "calc(100vh - 60px)",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Document file={samplePDF} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              renderTextLayer
              scale={scale}
            />
          ))}
        </Document>

        {/* Highlight Render */}
        {highlights.map((h) => (
          <div
            key={h.id}
            title={h.text}
            onContextMenu={(e) => handleRightClick(e, h.id)}
            style={{
              position: "absolute",
              top: h.top,
              left: h.left,
              width: h.width,
              height: h.height,
              ...getHighlightStyle(h.color),
            }}
          />
          // <div
          //   key={h.id}
          //   className="h"
          //   style={{
          //     position: "absolute",
          //     top: h.top * scale,
          //     left: h.left * scale,
          //     width: h.width * scale,
          //     height: h.height * scale,
          //     backgroundColor: h.color,
          //     opacity: 0.4,
          //     border: `1px solid ${darkenColor(h.color)}`,
          //     borderRadius: 4,
          //     padding: 2,
          //     boxSizing: "border-box",
          //     transformOrigin: "top left",
          //   }}
          // />
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
