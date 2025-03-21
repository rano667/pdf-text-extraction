import React, { useState } from "react";
import PDFViewer from "./PDFViewer";
import JSONEditor from "./JSONEditor";

const App = () => {
  const [selectedField, setSelectedField] = useState(null);
  const [selectedText, setSelectedText] = useState("");

  const handleTextSelect = (text) => {
    setSelectedText(text); // Send selected text to JSONEditor
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <PDFViewer onTextSelect={handleTextSelect} />
      <JSONEditor
        onSelectField={setSelectedField}
        selectedText={selectedText}
      />
    </div>
  );
};

export default App;
