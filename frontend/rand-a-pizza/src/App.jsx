import { useState } from 'react'
import NavBar from './components/NavBar'
import Ingredients from './components/Ingredients'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="landing-header">
        {/* The Pizza Image (Absolute positioned background layer) */}
        <div className="pizza-header" />
        
        {/* Navigation */}
        <NavBar />
        
        {/* Text Content (Left Side) */}
        <div className="landing-content">
           <h1>Find your new favorite Pizza!</h1>
           <button className='landing-button'>Get started now!</button>
        </div>
      </div>

      <div className="discover-section">
        <h2>Discover new recipes INSTANTLY!</h2>
        <p className="discover-subtext">Get unique combos based on flavor profiles and your preference using AI</p>
      </div>
      <Ingredients />
    </>
  )
}

export default App