// Application entrypoint.

// Render the top-level React component
import React from 'react'
import ReactDOM from 'react-dom'
import App from './react/App.jsx'
import jQueryApp from './jQueryApp.js'

ReactDOM.render(<App/>, document.getElementById("react-root"))
jQueryApp()