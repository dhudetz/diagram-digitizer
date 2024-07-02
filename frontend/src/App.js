import React, { useState } from 'react';
import './App.css';
import OpenAI from "openai";

const prompt = "Analyze this diagram and provide a text version of it that is digitized like this \n\n\'Puppy\' > \'Dog\'\n\'Dog\' > \'Lifelong Friend.\'\n\n It is very important that you write it in this way, with no extra text around it. All relationships are simply expressed and seperated by each new line, with only two members of each relationship per line: \n\n \'C\'<\'A!\'\n\'A\'>\'1. something\'\n\'1. something great!\'<>\'C\'\n\n If all relationships point in one direction that would be an ideal way of writing it \'A\'>\'B\'\n\'A\'<>\'C\'\nFollow the examples precisely, as it is important for the parsing step that will follow this action. Pay close attention to the direction of connections, ignore vertical and horizontal hierarchies entirely, only pay attention to the relationships between nodes, pay attention to connections as some may even be BIDIRECTIONAL or SINGLE DIRECTIONAL, which you would have to describe as \'<>\' or \'>\'. You are the enforcer of this standard! If an idea is crossed out, ignore it. If an idea is circled, treat it as one."

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true  });

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (file) {
      await handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setIsLoading(true);
    setGeneratedText('');
    try {
      const base64Image = await convertToBase64(file);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  "url": base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });



      const generatedTextContent = response.choices[0].message.content;
      setGeneratedText(generatedTextContent);
      //saveToCSV(generatedTextContent);
      //const pngDataUrl = createRelationshipDiagram(generatedTextContent);
      //console.log(pngDataUrl);
      //setGeneratedImage(pngDataUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing the image.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleRetry = async () => {
    setIsLoading(true);
    try {
      // Assuming you have the last used file still available
      if (selectedFile) {
        await handleUpload(selectedFile);
      } else {
        // If no file is available, you might want to show an error message
        alert('No image available for retry. Please upload an image first.');
      }
    } catch (error) {
      console.error('Error during retry:', error);
      alert('An error occurred while retrying. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };


  return (
    <div className="App">
    <header className="App-header">
    <h1>Diagram to Text Converter</h1>
    <div className="upload-section">
    <input
    type="file"
    accept=".png,.jpg,.jpeg"
    onChange={handleFileChange}
    id="file-upload"
    className="file-input"
    />
    <label htmlFor="file-upload" className="file-label">
    Choose File
    </label>
    </div>
    {selectedFile && (
      <div className="preview-section">
      <img src={previewUrl} alt="Preview" className="image-preview" />
      {isLoading && <div className="loading-wheel"></div>}
      </div>
    )}
    {selectedFile && !isLoading && (
      <p className="file-name">Selected file: {selectedFile.name}</p>
    )}
    {generatedText && (
      <div className="generated-text-section">
      <h2>Generated Text:</h2>
      <textarea
      value={generatedText}
      readOnly
      className="generated-text"
      />
      <button
      className="retry-button"
      onClick={handleRetry}
      >
      RETRY
      </button>
      </div>
    )}
    {generatedImage && (
      <div className="generated-image-section">
      <h2>Generated Diagram:</h2>
      <img src={generatedImage} alt="Generated Diagram" className="generated-image" />
      </div>
    )}
    </header>
    </div>
  );
}

export default App;


// // Parse string and generate a png diagram from parsed graph
// function createRelationshipDiagram(input) {
//   // Parse input string
//   const relationships = input.split('\n').filter(line => line.trim() !== '');
//
//   // Create graph
//   const g = new dagre.graphlib.Graph();
//   g.setGraph({});
//   g.setDefaultEdgeLabel(() => ({}));
//
//   // Add nodes and edges
//   relationships.forEach(rel => {
//     const parts = rel.split(/[<>-]+/).map(p => p.trim().replace(/['"]/g, ''));
//     parts.forEach(node => {
//       if (!g.hasNode(node)) {
//         g.setNode(node, { label: node });
//       }
//     });
//     if (rel.includes('<>')) {
//       g.setEdge(parts[0], parts[1]);
//       g.setEdge(parts[1], parts[0]);
//     } else if (rel.includes('>')) {
//       g.setEdge(parts[0], parts[1]);
//     } else if (rel.includes('<')) {
//       g.setEdge(parts[1], parts[0]);
//     }
//   });
//
//   // Generate mermaid diagram
//   let mermaidDef = 'graph TD;\n';
//   g.edges().forEach(e => {
//     mermaidDef += `${e.v}-->${e.w};\n`;
//   });
//
//   // Render diagram to PNG
//   mermaid.mermaidAPI.initialize({ startOnLoad: false });
//   return mermaid.mermaidAPI.render('diagram', mermaidDef);
// }
