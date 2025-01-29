import React, { useState, useRef, useEffect } from 'react';
import '../styles/Terminal.css';

const Terminal = () => {
  const [history, setHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const terminalRef = useRef(null);

  const executeCommand = async (command) => {
    try {
      const response = await fetch('http://localhost:5000/execute', {
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
        setHistory(prev => [...prev, {
          command,
          output: data.result,
          directory: data.currentDirectory
        }]);
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
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
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
      <div className="terminal-body" ref={terminalRef}>
        <div className="terminal-indicators">
          <div className="radar"></div>
          <div className="cpu-pulse">
            <div className="pulse-line"></div>
            <div className="pulse-indicator"></div>
          </div>
        </div>
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
  );
};

export default Terminal;