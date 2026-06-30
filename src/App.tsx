import { Gallery3D } from './components/Gallery3D';
import { PsychologistAI } from './components/PsychologistAI';
import galleryData from './data/galleryData.json';
import { MemoryData } from './types';
import './App.css';

function App() {
  const data = galleryData as unknown as MemoryData;

  return (
    <div className="app-container">
      <Gallery3D nodes={data.nodes} />

      <div className="hud-container">
        <div className="hud-row top">
          <div className="hud-element top-left">
            SYSTEM: ACTIVE<br/>
            MEMORY_COUNT: {data.nodes.length}<br/>
            NEURAL_LINKS: ACTIVE
          </div>

          <PsychologistAI />
        </div>

        <div className="hud-row bottom">
          <div className="hud-element bottom-left" style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
            [ ADD MEMORY ]
          </div>

          <div className="hud-element bottom-right">
            DATE: {new Date().toLocaleDateString()}<br/>
            TIME: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
