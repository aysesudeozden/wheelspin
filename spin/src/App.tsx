import { useState } from 'react'
import './App.css'

function App() {
  const [prizes, setPrizes] = useState([
    { id: 1, name: 'Prize 1' },
    { id: 2, name: 'Prize 2' },
    { id: 3, name: 'Prize 3' },
    { id: 4, name: 'Prize 4' },
    { id: 5, name: 'Prize 5' },
    { id: 6, name: 'Prize 6' },
    { id: 7, name: 'Prize 7' },
    { id: 8, name: 'Prize 8' },
  ])
  const [result, setResult] = useState('')
  const spin = () => {
    const randomIndex = Math.floor(Math.random() * prizes.length)
    setResult(prizes[randomIndex].name)
    prizes.splice(randomIndex, 1)
    setPrizes([...prizes])
  }
  return (
    <>
      <h1>Wheelspin</h1>
      <div className="wheel">
        {prizes.map((prize) => (
          <div key={prize.id} className="prize">
            {prize.name}
          </div>
        ))}
      </div>
      <button onClick={() => spin()}>Spin</button>
      <div className="result">
        {result}
      </div>

    </>
  )
}

export default App
