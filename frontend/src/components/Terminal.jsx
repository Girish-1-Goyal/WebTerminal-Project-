import React, { useState, useRef, useEffect } from 'react';
import '../styles/Terminal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Terminal = () => {
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const contentRef = useRef(null);

  const executeCommand = async (command) => {
    try {
      const response = await fetch(`${API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      
      if (data.result === 'CLEAR_TERMINAL') {
        setHistory([]);
      } else {
        setHistory(prev => {
          const newHistory = [...prev, {
            command,
            output: data.result,
            directory: data.currentDirectory
          }];
          // Keep only the last 50 commands to prevent memory issues
          return newHistory.slice(-50);
        });
      }

      setCurrentDirectory(data.currentDirectory);
    } catch (error) {
      setHistory(prev => [...prev, {
        command,
        output: `Error: ${error.message}`,
        directory: currentDirectory
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-button close"></span>
          <span className="terminal-button minimize"></span>
          <span className="terminal-button maximize"></span>
        </div>
        <div className="terminal-title">Terminal</div>
      </div>
      <div className="terminal-body">
        <div className="terminal-indicators">
          <div className="radar"></div>
          <div className="cpu-pulse">
            <div className="pulse-line"></div>
            <div className="pulse-indicator"></div>
          </div>
        </div>
        <div className="terminal-content" ref={contentRef}>
          <div className="terminal-lines">
            {history.map((entry, index) => (
              <div key={index} className="terminal-line">
                <div className="prompt">
                  <span className="user">user@machine</span>
                  <span className="separator">:</span>
                  <span className="directory">{entry.directory}</span>
                  <span className="symbol">$</span>
                </div>
                <div className="command">{entry.command}</div>
                <div className="output">{
                  typeof entry.output === 'object' 
                    ? JSON.stringify(entry.output, null, 2) 
                    : entry.output
                }</div>
              </div>
            ))}
          </div>
          <div className="terminal-input">
            <div className="prompt">
              <span className="user">user@machine</span>
              <span className="separator">:</span>
              <span className="directory">{currentDirectory}</span>
              <span className="symbol">$</span>
            </div>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;