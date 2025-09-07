import { useState } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [colour, setColour] = useState<string>(''); // Initialize useState with an empty string

  const onclick = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      args: [colour], // Pass the selected color as an argument
      func: (selectedColour) => {
        // This function runs in the context of the target tab
        document.body.style.backgroundColor = selectedColour;
      },
    });
  };

  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card"> */}
        <input
          className='palette'
          type="color"
          onChange={(e) => setColour(e.currentTarget.value)} // Update the color state
        />
        <button onClick={() => onclick()}>click me!</button>

        {/* <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
    </>
  );
}

export default App;