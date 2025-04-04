import React, { useState, useEffect } from "react";

const initialData = {
  "Invoice Date": "08-16-2022",
  "Creditor Name": "SFL PVT LTD",
  "Invoice Total": "8978.72",
  "Invoice Number": "77106787",
  "Shipment Number": "12150980",
  "Invoice Currency": "$",
};

const JSONEditor = ({ onSelectField, selectedText }) => {
  const [data, setData] = useState(initialData);
  const [selectedField, setSelectedField] = useState(null);

  // When user selects text from the PDF, update the JSON field
  useEffect(() => {
    if (selectedField && selectedText) {
      setData((prevData) => ({
        ...prevData,
        [selectedField]: selectedText,
      }));
    }
  }, [selectedText]);

  const handleFieldClick = (key) => {
    setSelectedField(key);
    onSelectField(key);
  };

  return (
    <div style={{ width: "50%", padding: "20px" }}>
      <h3>Extracted Data</h3>
      {Object.keys(data).map((key) => (
        <p
          key={key}
          onClick={() => handleFieldClick(key)}
          style={{
            cursor: "pointer",
            color: selectedField === key ? "blue" : "black",
          }}
        >
          <strong>{key}:</strong> {data[key]}
        </p>
      ))}
    </div>
  );
};

export default JSONEditor;
