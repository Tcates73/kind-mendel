import { Gallery3D } from './components/Gallery3D';
import galleryData from './data/galleryData.json';
import { ImageData } from './types';
import './App.css';

function App() {
  const data = galleryData as ImageData;

  return <Gallery3D images={data.images} />;
}

export default App;
