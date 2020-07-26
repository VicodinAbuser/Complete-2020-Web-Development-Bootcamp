import React from "react";

function App() {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString());

  setInterval(currentTime, 1000);

  function currentTime() {
    setTime(new Date().toLocaleTimeString());
  }
  return (
    <div className="container">
      <h1>{time}</h1>
      {/* <button onClick={currentTime}>Get Time</button> */}
    </div>
  );
}

export default App;
