// Application entrypoint.

// Render the top-level React component
import React from 'react'
import ReactDOM from 'react-dom'
import App from './react/App'
import jQueryApp from './jQueryApp'

ReactDOM.render(<App />, document.getElementById("react-root"))
jQueryApp()