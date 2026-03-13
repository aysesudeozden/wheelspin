import { useState, useEffect } from 'react'
import './App.css'

interface Prize {
  id: string;
  name: string;
  color: string;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6'
];

function App() {
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '', color: COLORS[0] },
    { id: '2', name: '', color: COLORS[1] },
  ]);
  const [newPrizeName, setNewPrizeName] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [isPopout, setIsPopout] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'wheel') {
      setIsPopout(true);
    }

    // Sync state from opener if in popout
    if (params.get('mode') === 'wheel' && window.opener) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SYNC_prizes') {
          setPrizes(event.data.prizes);
        }
        if (event.data.type === 'START_SPIN') {
          spin(event.data.prizes);
        }
      };
      window.addEventListener('message', handleMessage);
      window.opener.postMessage({ type: 'POPUP_READY' }, '*');
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  const addPrize = () => {
    if (!newPrizeName) return;
    const newPrize = {
      id: Date.now().toString(),
      name: newPrizeName,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    const updated = [...prizes, newPrize];
    setPrizes(updated);
    setNewPrizeName('');
  };

  const removePrize = (id: string) => {
    if (prizes.length <= 2) return;
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const spin = (currentPrizes = prizes) => {
    if (isSpinning || currentPrizes.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const extraRounds = 5 + Math.floor(Math.random() * 5);
    const randomDegree = Math.floor(Math.random() * 360);
    const newRotation = rotation + (extraRounds * 360) + randomDegree;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualDegree = newRotation % 360;
      const segmentSize = 360 / currentPrizes.length;
      // The pointer is at the top (270 degrees in SVG coordinate space if 0 is right)
      // But we rotate the ENTIRE wheel. 
      // 0 rotation means the first segment starts from 0 (right) or wherever we draw it.
      // Let's adjust logic based on SVG drawing.
      const index = Math.floor(((360 - actualDegree + 270) % 360) / segmentSize);
      setWinner(currentPrizes[index]);
    }, 5000);
  };

  const renderWheel = () => {
    const segmentSize = 360 / prizes.length;
    return (
      <svg viewBox="0 0 100 100" className="wheel-svg" style={{ width: '100%', height: '100%' }}>
        {prizes.map((prize, i) => {
          const startAngle = i * segmentSize;
          const endAngle = (i + 1) * segmentSize;
          const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
          const largeArcFlag = segmentSize > 180 ? 1 : 0;

          return (
            <g key={prize.id}>
              <path
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={prize.color}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="0.5"
              />
              <text
                x="75"
                y="50"
                fill="white"
                fontSize="4"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(${startAngle + segmentSize / 2}, 50, 50)`}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {prize.name.length > 12 ? prize.name.substring(0, 10) + '...' : prize.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  if (isPopout) {
    return (
      <div className="container" style={{ padding: '1rem', minHeight: 'auto' }}>
        <div className="wheel-section">
          <div className="wheel-pointer"></div>
          <div className="wheel-wrapper">
            <div
              className="wheel-inner"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {renderWheel()}
            </div>
            <div className="wheel-center">
              <span style={{ fontSize: '20px' }}>🎯</span>
            </div>
          </div>
          {winner && (
            <div className="result-overlay">
              <h2>Winner!</h2>
              <span>{winner.name}</span>
            </div>
          )}
          {!isSpinning && (
            <button className="btn btn-primary spin-btn" onClick={() => spin()}>
              SPIN!
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Wheel of Your Fortune</h1>
        <p style={{ opacity: 0.6 }}>Choose your options and let the wheel decide!</p>
      </header>

      <div className="main-layout">
        <div className="wheel-section">
          <div className="wheel-pointer"></div>
          <div className="wheel-wrapper">
            <div
              className="wheel-inner"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {renderWheel()}
            </div>
            <div className="wheel-center" style={{ cursor: 'pointer' }} onClick={() => !isSpinning && spin()}>
              <span style={{ fontSize: '24px' }}>{isSpinning ? '⏳' : '🎡'}</span>
            </div>
          </div>

          {winner && (
            <div className="result-overlay">
              <h2>Winner!</h2>
              <span>{winner.name}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary spin-btn"
              onClick={() => spin()}
              disabled={isSpinning || prizes.length === 0}
            >
              SPIN!
            </button>
          </div>
        </div>

        <div className="sidebar">
          <div className="prize-list">
            {prizes.map((prize) => (
              <div key={prize.id} className="prize-item">
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: prize.color
                  }}
                />
                <span>
                  <div className="input-2">
                    {prize.name}
                  </div>
                </span>
                <button
                  className="btn btn-danger"
                  onClick={() => removePrize(prize.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="New option..."
              className="input"
              value={newPrizeName}
              onChange={(e) => setNewPrizeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPrize()}
            />
          </div>

          <div className="prize-input-group">
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={addPrize}>
              Add
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>
            At least 2 options required.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
