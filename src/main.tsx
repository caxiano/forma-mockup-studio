import { createRoot } from 'react-dom/client';
import { useEditor } from './hooks/useEditor';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { PropertiesPanel } from './components/PropertiesPanel';
import './styles.css';
function App(){const editor=useEditor();return <div className="app-shell"><Topbar editor={editor}/><div className="editor-layout"><Sidebar editor={editor}/><CanvasWorkspace editor={editor}/><PropertiesPanel editor={editor}/></div></div>}
createRoot(document.getElementById('root')!).render(<App/>);
