// Application entrypoint.

// Render the top-level React component
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.jsx'

console.log(document.getElementById("react-root"))
ReactDOM.render(<App />, document.getElementById("react-root"))
