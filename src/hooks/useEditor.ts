import demoProductUrl from '../tote.svg';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, FabricObject, Textbox } from 'fabric';
export type Layer = { id: string; name: string; object: FabricObject; visible: boolean };
export function useEditor() {
  const canvasElement = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<FabricObject | null>(null);
  const [revision, setRevision] = useState(0);
  const [backgroundName, setBackgroundName] = useState('Ecobag natural');
  const [error, setError] = useState('');
  const history = useRef<string[]>([]);
  const future = useRef<string[]>([]);
  const restoring = useRef(false);
  const sync = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    setLayers(canvas.getObjects().map((object, index) => ({ id: String(index), name: object instanceof Textbox ? object.text : `Arte ${index + 1}`, object, visible: object.visible })).reverse());
    setSelected(canvas.getActiveObject() ?? null); setRevision(value => value + 1);
  }, []);
  const save = useCallback(() => {
    if (restoring.current || !canvasRef.current) return;
    const state = JSON.stringify(canvasRef.current.toJSON());
    if (history.current.at(-1) !== state) { history.current.push(state); history.current = history.current.slice(-30); future.current = []; }
    sync();
  }, [sync]);
  useEffect(() => {
    if (!canvasElement.current) return;
    const canvas = new Canvas(canvasElement.current, { width: 1000, height: 1000, backgroundColor: '#e9e3d8', preserveObjectStacking: true });
    canvasRef.current = canvas;
    FabricObject.ownDefaults.cornerColor = '#fff'; FabricObject.ownDefaults.cornerStrokeColor = '#778257'; FabricObject.ownDefaults.borderColor = '#778257'; FabricObject.ownDefaults.transparentCorners = false; FabricObject.ownDefaults.cornerSize = 10;
    canvas.on('selection:created', sync); canvas.on('selection:updated', sync); canvas.on('selection:cleared', sync); canvas.on('object:modified', save); canvas.on('text:changed', save);
    let disposed = false;
    void FabricImage.fromURL(demoProductUrl).then(image => {
      if (disposed) return; image.set({ selectable: false, evented: false }); canvas.backgroundImage = image;
      const text = new Textbox('grow\nslow.', { left: 370, top: 492, width: 270, fontSize: 84, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#536143', textAlign: 'center', lineHeight: .87, angle: -3, globalCompositeOperation: 'multiply' });
      canvas.add(text); canvas.requestRenderAll(); save();
    });
    return () => { disposed = true; void canvas.dispose(); canvasRef.current = null; };
  }, [save, sync]);
  async function upload(file: File, type: 'background' | 'art') {
    if (!file.type.startsWith('image/')) { setError('Escolha um arquivo de imagem válido.'); return; }
    if (file.size > 25 * 1024 * 1024) { setError('A imagem deve ter até 25 MB.'); return; }
    const url = URL.createObjectURL(file);
    try {
      const image = await FabricImage.fromURL(url); const canvas = canvasRef.current; if (!canvas) return;
      if (type === 'background') {
        const scale = Math.min(1000 / image.width, 1000 / image.height);
        image.set({ scaleX: scale, scaleY: scale, left: (1000-image.width*scale)/2, top: (1000-image.height*scale)/2, selectable: false, evented: false });
        canvas.backgroundImage = image; setBackgroundName(file.name);
      } else { image.scaleToWidth(350); image.set({ left: 325, top: 350 }); canvas.add(image); canvas.setActiveObject(image); }
      canvas.requestRenderAll(); setError(''); save();
    } catch { setError('Não foi possível abrir esta imagem. Tente PNG, JPG ou WebP.'); } finally { URL.revokeObjectURL(url); }
  }
  function update(properties: Record<string, unknown>) { if (!selected) return; selected.set(properties); canvasRef.current?.requestRenderAll(); save(); }
  function addText() { const text = new Textbox('Seu texto aqui', { left: 320, top: 470, width: 380, fontSize: 52, fontFamily: 'Arial', fill: '#39432e', textAlign: 'center' }); canvasRef.current?.add(text); canvasRef.current?.setActiveObject(text); save(); }
  function remove() { if (selected) { canvasRef.current?.remove(selected); canvasRef.current?.discardActiveObject(); save(); } }
  async function duplicate() { if (!selected) return; const clone = await selected.clone(); clone.set({ left: selected.left + 25, top: selected.top + 25 }); canvasRef.current?.add(clone); canvasRef.current?.setActiveObject(clone); save(); }
  async function travel(direction: 'undo' | 'redo') { const canvas = canvasRef.current; if (!canvas) return; let state: string | undefined; if (direction === 'undo' && history.current.length > 1) { future.current.push(history.current.pop()!); state = history.current.at(-1); } else if (direction === 'redo' && future.current.length) { state = future.current.pop(); history.current.push(state!); } if (state) { restoring.current = true; await canvas.loadFromJSON(state); canvas.requestRenderAll(); restoring.current = false; sync(); } }
  function exportPng(multiplier: number) { const canvas = canvasRef.current; if (!canvas) return; canvas.discardActiveObject(); canvas.requestRenderAll(); const anchor = document.createElement('a'); anchor.download = 'forma-mockup.png'; anchor.href = canvas.toDataURL({ format: 'png', multiplier }); anchor.click(); sync(); }
  function select(object: FabricObject) { canvasRef.current?.setActiveObject(object); canvasRef.current?.requestRenderAll(); sync(); }
  function toggleVisibility(object: FabricObject) { object.visible = !object.visible; canvasRef.current?.requestRenderAll(); save(); }
  function reorder(direction: 'up' | 'down') { if (!selected || !canvasRef.current) return; if (direction === 'up') canvasRef.current.bringObjectForward(selected); else canvasRef.current.sendObjectBackwards(selected); save(); }
  return { canvasElement, canvasRef, layers, selected, revision, backgroundName, error, upload, update, addText, remove, duplicate, travel, exportPng, select, toggleVisibility, reorder, save };
}
export type Editor = ReturnType<typeof useEditor>;
