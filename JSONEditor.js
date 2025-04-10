import React, { useState, useEffect } from "react";

const JSONEditor = ({
  selectedField,
  setSelectedField,
  selectedText,
  updateJsonData,
  jsonData,
  setJsonData,
  fieldColors,
  hoveredField,
  setHoveredField,
}) => {
  useEffect(() => {
    if (selectedField && selectedText) {
      updateJsonData(selectedField, selectedText);
    }
  }, [selectedText]);

  const handleFieldClick = (key) => {
    setSelectedField(key);
  };

  const handleReset = () => {
    setJsonData({
      "Invoice Date": "08-16-2022",
      "Creditor Name": "SFL PVT LTD",
      "Invoice Total": "8978.72",
      "Invoice Number": "77106787",
      "Shipment Number": "12150980",
      "Invoice Currency": "$",
    });
    localStorage.removeItem("jsonData");
  };

  return (
    <div style={{ width: "20%", padding: "20px", backgroundColor: "#f9f9f9" }}>
      <h3>Extracted Data</h3>
      {Object.entries(jsonData).map(([key, value]) => (
        <div
          key={key}
          onClick={() => handleFieldClick(key)}
          onMouseEnter={() => setHoveredField(key)}
          onMouseLeave={() => setHoveredField(null)}
          style={{
            marginBottom: 8,
            padding: 6,
            borderRadius: 4,
            backgroundColor:
              selectedField === key
                ? "#e0f7fa"
                : hoveredField === key
                ? "#f1f1f1"
                : "transparent",
            borderLeft: `6px solid ${fieldColors[key] || "#ccc"}`,
            cursor: "pointer",
          }}
        >
          <strong>{key}: </strong>
          <input
            type="text"
            value={value}
            onChange={(e) => updateJsonData(key, e.target.value)}
            style={{
              width: "90%",
              border: "none",
              background: "transparent",
              fontSize: "14px",
            }}
          />
        </div>
      ))}

      <button
        style={{
          marginTop: "10px",
          padding: "8px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() =>
          localStorage.setItem("jsonData", JSON.stringify(jsonData))
        }
      >
        Save Data
      </button>

      <button
        style={{
          marginTop: "10px",
          marginLeft: "10px",
          padding: "8px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={handleReset}
      >
        Reset Data
      </button>
    </div>
  );
};

export default JSONEditor;
