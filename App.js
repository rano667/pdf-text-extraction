import React, { useState, useEffect } from "react";
import PDFViewer from "./PDFViewer";
import JSONEditor from "./JSONEditor";

const fieldColors = {
  "Invoice Date": "#FFEB3B66",
  "Creditor Name": "#81C78466",
  "Invoice Total": "#64B5F666",
  "Invoice Number": "#E5737366",
  "Shipment Number": "#FF980066",
  "Invoice Currency": "#BA68C866",
};

const App = () => {
  const [selectedField, setSelectedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [jsonData, setJsonData] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("jsonData")) || {
        "Invoice Date": "08-16-2022",
        "Creditor Name": "SFL PVT LTD",
        "Invoice Total": "8978.72",
        "Invoice Number": "77106787",
        "Shipment Number": "12150980",
        "Invoice Currency": "$",
      }
    );
  });

  useEffect(() => {
    localStorage.setItem("jsonData", JSON.stringify(jsonData));
  }, [jsonData]);

  const handleTextSelect = (text) => {
    setSelectedText(text);
  };

  const updateJsonData = (field, text) => {
    if (field) {
      setJsonData((prev) => ({ ...prev, [field]: text }));
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <PDFViewer
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        onTextSelect={handleTextSelect}
        fieldColors={fieldColors}
        initialData={jsonData}
        hoveredField={hoveredField}
        setHoveredField={setHoveredField}
      />
      <JSONEditor
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        selectedText={selectedText}
        updateJsonData={updateJsonData}
        jsonData={jsonData}
        setJsonData={setJsonData}
        fieldColors={fieldColors}
        hoveredField={hoveredField}
        setHoveredField={setHoveredField}
      />
    </div>
  );
};

export default App;
