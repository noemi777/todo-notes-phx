import React, { useState } from "react";

const Greeting = ({ greetingText }) => {
  const [counter, setCounter] = useState(15);
  return (
    <div>
      <h1 className="text-3xl font-bold underline text-cyan-500">
        Hello, {greetingText}!
      </h1>
      <p>Counter: {counter}</p>
      <button onClick={() => setCounter((prev) => prev + 1)} type="button">
        Increment
      </button>
    </div>
  );
};
console.log("Greeting");
export default Greeting;