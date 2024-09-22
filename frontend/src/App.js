import React, { useState, useEffect } from 'react';
import './App.css';

const ROLL_NUMBER = 'YOUR_ROLL_NUMBER'; // Replace with your actual roll number

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    document.title = ROLL_NUMBER;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);

    try {
      const parsedInput = JSON.parse(input);
      const res = await fetch('/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedInput.data }), // Ensure the request body is in correct format
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.is_success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setResponse(data);
      setSelectedOptions(['numbers', 'alphabets', 'highest_lowercase_alphabet']); // Automatically select initial options
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    }
  };

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const filteredResponse = () => {
    if (!response) return null;
    return Object.fromEntries(
      Object.entries(response).filter(([key]) => selectedOptions.includes(key))
    );
  };

  return (
    <div className="App">
      <h1>{ROLL_NUMBER}</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter JSON (e.g., { "data": ["A","C","z"] })'
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}
      {response && (
        <div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                value="numbers"
                checked={selectedOptions.includes('numbers')}
                onChange={handleOptionChange}
              />
              Numbers
            </label>
            <label>
              <input
                type="checkbox"
                value="alphabets"
                checked={selectedOptions.includes('alphabets')}
                onChange={handleOptionChange}
              />
              Alphabets
            </label>
            <label>
              <input
                type="checkbox"
                value="highest_lowercase_alphabet"
                checked={selectedOptions.includes('highest_lowercase_alphabet')}
                onChange={handleOptionChange}
              />
              Highest lowercase alphabet
            </label>
          </div>
          <pre className="response">
            {JSON.stringify(filteredResponse(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;