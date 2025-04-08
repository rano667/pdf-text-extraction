import React, { useState, useEffect } from "react";

const JSONEditor = ({ selectedField, setSelectedField, selectedText, updateJsonData, jsonData, setJsonData }) => {
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
      {Object.keys(jsonData).map((key) => (
        <p
          key={key}
          onClick={() => handleFieldClick(key)}
          style={{
            cursor: "pointer",
            color: selectedField === key ? "blue" : "black",
            backgroundColor: selectedField === key ? "#e0f7fa" : "transparent",
            padding: "5px",
            borderRadius: "4px",
          }}
        >
          <strong>{key}:</strong> {jsonData[key]}
        </p>
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
        onClick={() => localStorage.setItem("jsonData", JSON.stringify(jsonData))}
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
