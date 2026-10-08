import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const A4_WIDTH        = 2479;
const A4_HEIGHT       = 3508;
const P4X6_WIDTH      = 1200;
const P4X6_HEIGHT     = 1800;
const CARD_PRINT_W    = 1012;
const CARD_PRINT_H    = 653;
const DEFAULT_FRONT   = { x: 125, y: 71,   w: 1355, h: 875 };
const DEFAULT_BACK    = { x: 125, y: 1070, w: 1355, h: 875 };

// ─── Load PDF.js from CDN once ────────────────────────────────────────────────
function usePdfJs() {
  const [ready, setReady] = useState(!!window.pdfjsLib);

  useEffect(() => {
    if (window.pdfjsLib) { setReady(true); return; }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      setReady(true);
    };
    document.head.appendChild(script);
  }, []);

  return ready;
}

// ─── Box-drag helpers ─────────────────────────────────────────────────────────
function getCanvasXY(e, canvas) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left)  * (canvas.width  / r.width),
    y: (e.clientY - r.top)   * (canvas.height / r.height),
  };
}

function getHandle(px, py, box) {
  const hs = 30, { x, y, w, h } = box;
  if (Math.abs(px - x)     < hs && Math.abs(py - y)     < hs) return 'nw';
  if (Math.abs(px - (x+w)) < hs && Math.abs(py - y)     < hs) return 'ne';
  if (Math.abs(px - x)     < hs && Math.abs(py - (y+h)) < hs) return 'sw';
  if (Math.abs(px - (x+w)) < hs && Math.abs(py - (y+h)) < hs) return 'se';
  if (Math.abs(py - y)     < hs && px >= x && px <= x+w) return 'n';
  if (Math.abs(py - (y+h)) < hs && px >= x && px <= x+w) return 's';
  if (Math.abs(px - x)     < hs && py >= y && py <= y+h) return 'w';
  if (Math.abs(px - (x+w)) < hs && py >= y && py <= y+h) return 'e';
  if (px >= x && px <= x+w && py >= y && py <= y+h) return 'move';
  return null;
}

const CURSOR_MAP = {
  nw: 'nwse-resize', se: 'nwse-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  n:  'ns-resize',   s:  'ns-resize',
  w:  'ew-resize',   e:  'ew-resize',
  move: 'move',
};

function applyDrag(initial, handle, dx, dy) {
  let { x, y, w, h } = initial;
  const min = 100;
  if (handle === 'move') { x += dx; y += dy; }
  else if (handle === 'nw') { w = Math.max(min, w-dx); h = Math.max(min, h-dy); x += initial.w-w; y += initial.h-h; }
  else if (handle === 'ne') { w = Math.max(min, w+dx); h = Math.max(min, h-dy); y += initial.h-h; }
  else if (handle === 'sw') { w = Math.max(min, w-dx); h = Math.max(min, h+dy); x += initial.w-w; }
  else if (handle === 'se') { w = Math.max(min, w+dx); h = Math.max(min, h+dy); }
  else if (handle === 'n')  { h = Math.max(min, h-dy); y += initial.h-h; }
  else if (handle === 's')  { h = Math.max(min, h+dy); }
  else if (handle === 'w')  { w = Math.max(min, w-dx); x += initial.w-w; }
  else if (handle === 'e')  { w = Math.max(min, w+dx); }
  return { x, y, w, h };
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function drawHandles(ctx, box) {
  const hs = 16, { x, y, w, h } = box;
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  [
    { x, y }, { x: x+w/2, y }, { x: x+w, y },
    { x: x+w, y: y+h/2 }, { x: x+w, y: y+h },
    { x: x+w/2, y: y+h }, { x, y: y+h }, { x, y: y+h/2 },
  ].forEach(p => {
    ctx.fillRect(p.x - hs/2, p.y - hs/2, hs, hs);
    ctx.strokeRect(p.x - hs/2, p.y - hs/2, hs, hs);
  });
}

function drawPrintBorder(ctx, x, y, w, h) {
  ctx.save(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h); ctx.restore();
}

function drawFoldLine(ctx, x1, y1, x2, y2) {
  ctx.save(); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.stroke(); ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdjustMahaID = () => {
  const pdfJsReady = usePdfJs();

  // ── State ──────────────────────────────────────────────────────────────────
  const [layoutMode, setLayoutMode]   = useState('4x6');   // '4x6' | 'a4'
  const [filesData,  setFilesData]    = useState([]);       // processed file objects
  const [editIdx,    setEditIdx]      = useState(0);
  const [activeTab,  setActiveTab]    = useState('front');  // 'front' | 'back'
  const [status,     setStatus]       = useState('कृपया वरील बटणातून तुमची PDF फाईल निवडा.');
  const [showNav,    setShowNav]      = useState(false);
  const [showPwd,    setShowPwd]      = useState(false);
  const [pwdError,   setPwdError]     = useState('');
  const [pwdPrompt,  setPwdPrompt]    = useState('');
  const [canDownload, setCanDownload] = useState(false);
  const [fileNames,  setFileNames]    = useState('');
  const [showFiles,  setShowFiles]    = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [fileInputKey, setFileInputKey]   = useState(0); // to reset <input>

  // ── Queued processing refs ─────────────────────────────────────────────────
  const queueRef   = useRef([]);   // selectedFilesQueue
  const qProcIdx   = useRef(0);    // currentProcessIndex
  const filesRef   = useRef([]);   // mirrors filesData for async callbacks

  // ── Canvas refs ────────────────────────────────────────────────────────────
  const thumbRef   = useRef(null);
  const hiddenRef  = useRef(null);
  const previewRef = useRef(null);
  const pwdRef     = useRef(null);

  // ── Drag state refs ────────────────────────────────────────────────────────
  const dragging   = useRef(false);
  const dragHandle = useRef(null);
  const dragStart  = useRef({ x: 0, y: 0 });
  const dragInit   = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const editIdxRef = useRef(0);
  const activeTabRef = useRef('front');

  // keep refs in sync
  useEffect(() => { filesRef.current  = filesData; },  [filesData]);
  useEffect(() => { editIdxRef.current = editIdx; },   [editIdx]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // ── File-input label ───────────────────────────────────────────────────────
  const fileInputLabel = () => {
    const count = filesData.length;
    if (layoutMode === '4x6') {
      if (count >= 1) return '✅ 4x6 साठी फाईल जोडली आहे.';
      return '📂 महासारथी PDF फाईल निवडा (फक्त १ फाईल)';
    }
    if (count >= 5) return '✅ ५ फाईल्स पूर्ण झाल्या आहेत.';
    if (count > 0)  return `➕ आणखी फाईल्स जोडा (${count}/5 पूर्ण)`;
    return '📂 महासारथी PDF फाईल्स निवडा (१ ते ५ फाईल्स)';
  };

  const isInputDisabled = () => {
    const count = filesData.length;
    return inputDisabled || (layoutMode === '4x6' && count >= 1) || (layoutMode === 'a4' && count >= 5);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetApp = useCallback(() => {
    queueRef.current = []; qProcIdx.current = 0;
    filesRef.current = [];
    setFilesData([]);
    setEditIdx(0);
    setActiveTab('front');
    setStatus('कृपया वरील बटणातून तुमची PDF फाईल निवडा.');
    setShowNav(false);
    setShowPwd(false);
    setPwdError('');
    setCanDownload(false);
    setShowFiles(false);
    setFileNames('');
    setInputDisabled(false);
    setFileInputKey(k => k + 1); // resets the <input>
    if (thumbRef.current)   { thumbRef.current.style.display = 'none'; }
    if (previewRef.current) {
      const ctx = previewRef.current.getContext('2d');
      ctx.clearRect(0, 0, previewRef.current.width, previewRef.current.height);
    }
  }, []);

  // ── Redraw thumbnail ───────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const idx  = editIdxRef.current;
    const tab  = activeTabRef.current;
    const data = filesRef.current[idx];
    const canvas = thumbRef.current;
    if (!data || !canvas) return;

    canvas.width  = data.canvas.width;
    canvas.height = data.canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(data.canvas, 0, 0);

    // Front box
    ctx.save();
    if (tab === 'front') {
      ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.setLineDash([]);
      ctx.strokeRect(data.frontBox.x, data.frontBox.y, data.frontBox.w, data.frontBox.h);
      drawHandles(ctx, data.frontBox);
    } else {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4; ctx.setLineDash([10,10]);
      ctx.strokeRect(data.frontBox.x, data.frontBox.y, data.frontBox.w, data.frontBox.h);
    }
    ctx.fillStyle = tab === 'front' ? '#4f46e5' : '#94a3b8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Front Card', data.frontBox.x + 10, data.frontBox.y + 45);
    ctx.restore();

    // Back box
    ctx.save();
    if (tab === 'back') {
      ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.setLineDash([]);
      ctx.strokeRect(data.backBox.x, data.backBox.y, data.backBox.w, data.backBox.h);
      drawHandles(ctx, data.backBox);
    } else {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4; ctx.setLineDash([10,10]);
      ctx.strokeRect(data.backBox.x, data.backBox.y, data.backBox.w, data.backBox.h);
    }
    ctx.fillStyle = tab === 'back' ? '#059669' : '#94a3b8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('Back Card', data.backBox.x + 10, data.backBox.y + 45);
    ctx.restore();
  }, []);

  // keep redraw in sync when editIdx or activeTab changes
  useEffect(() => { redraw(); }, [editIdx, activeTab, redraw]);

  // ── Canvas mouse / touch events ────────────────────────────────────────────
  useEffect(() => {
    const canvas = thumbRef.current;
    if (!canvas) return;

    const onDown = (e) => {
      const idx  = editIdxRef.current;
      const tab  = activeTabRef.current;
      const data = filesRef.current[idx];
      if (!data) return;
      const box  = tab === 'front' ? data.frontBox : data.backBox;
      const coords = getCanvasXY(e, canvas);
      const h = getHandle(coords.x, coords.y, box);
      if (h) {
        dragging.current  = true;
        dragHandle.current = h;
        dragStart.current  = coords;
        dragInit.current   = { ...box };
      }
    };

    const onMove = (e) => {
      const idx  = editIdxRef.current;
      const tab  = activeTabRef.current;
      const data = filesRef.current[idx];
      if (!data) return;
      const box  = tab === 'front' ? data.frontBox : data.backBox;
      const coords = getCanvasXY(e, canvas);

      if (dragging.current) {
        const dx = coords.x - dragStart.current.x;
        const dy = coords.y - dragStart.current.y;
        const updated = applyDrag(dragInit.current, dragHandle.current, dx, dy);
        Object.assign(box, updated);
        // update filesRef directly (no re-render needed during drag)
        redraw();
        return;
      }
      const h = getHandle(coords.x, coords.y, box);
      canvas.style.cursor = CURSOR_MAP[h] || 'crosshair';
    };

    const onUp = () => {
      if (dragging.current) {
        dragging.current = false;
        dragHandle.current = null;
        // sync state from ref after drag ends
        setFilesData([...filesRef.current]);
      }
    };

    const onTouchStart = (e) => { if (e.touches.length === 1) { const t = e.touches[0]; canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: t.clientX, clientY: t.clientY })); } };
    const onTouchMove  = (e) => { if (e.touches.length === 1) { const t = e.touches[0]; canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: t.clientX, clientY: t.clientY })); e.preventDefault(); } };
    const onTouchEnd   = ()  => canvas.dispatchEvent(new MouseEvent('mouseup'));

    canvas.addEventListener('mousedown',  onDown);
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mouseup',    onUp);
    canvas.addEventListener('mouseleave', onUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown',  onDown);
      canvas.removeEventListener('mousemove',  onMove);
      canvas.removeEventListener('mouseup',    onUp);
      canvas.removeEventListener('mouseleave', onUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove',  onTouchMove);
      canvas.removeEventListener('touchend',   onTouchEnd);
    };
  }, [redraw]);

  // ── Process file queue ─────────────────────────────────────────────────────
  const processQueue = useCallback((password = null) => {
    if (qProcIdx.current >= queueRef.current.length) {
      // Done
      setShowPwd(false);
      const names = filesRef.current.map(d => d.fileName).join(', ');
      setFileNames(names);
      setShowFiles(true);
      setInputDisabled(false);
      setFileInputKey(k => k + 1);
      const newIdx = filesRef.current.length - queueRef.current.length;
      setEditIdx(newIdx);
      editIdxRef.current = newIdx;
      setShowNav(filesRef.current.length > 1);
      if (thumbRef.current) thumbRef.current.style.display = 'block';
      setActiveTab('front');
      activeTabRef.current = 'front';
      redraw();
      setStatus('उत्तम! फाईल्स लोड झाल्या आहेत. हवे असल्यास बॉक्स ऍडजस्ट करा किंवा आणखी फाईल्स जोडा.');
      return;
    }

    const file = queueRef.current[qProcIdx.current];
    setStatus(`फाईल वाचत आहे (${filesRef.current.length + 1} वी फाईल): ${file.name}`);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target.result.slice(0);
      const task = window.pdfjsLib.getDocument({ data: buf, password: password || '' });
      task.promise.then((pdfDoc) => {
        setPwdError('');
        pdfDoc.getPage(1).then((page) => {
          const unscaled = page.getViewport({ scale: 1 });
          const scale    = A4_WIDTH / unscaled.width;
          const vp       = page.getViewport({ scale });
          const off      = document.createElement('canvas');
          off.width      = vp.width;
          off.height     = vp.height;
          page.render({ canvasContext: off.getContext('2d'), viewport: vp }).promise.then(() => {
            filesRef.current = [
              ...filesRef.current,
              {
                fileName: file.name,
                canvas:   off,
                frontBox: { ...DEFAULT_FRONT },
                backBox:  { ...DEFAULT_BACK  },
              },
            ];
            setFilesData([...filesRef.current]);
            qProcIdx.current++;
            processQueue(null);
          });
        });
      }).catch((err) => {
        if (err.name === 'PasswordException') {
          setShowPwd(true);
          setPwdPrompt(`🔒 "${file.name}" ला पासवर्ड आहे. कृपया पासवर्ड टाका:`);
          if (password !== null) setPwdError('चुकीचा पासवर्ड! पुन्हा प्रयत्न करा.');
        } else {
          setStatus(`फाईल वाचताना एरर: ${file.name}`);
          qProcIdx.current++;
          processQueue(null);
        }
      });
    };
    reader.readAsArrayBuffer(file);
  }, [redraw]);

  // ── File input change ──────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.some(f => f.type !== 'application/pdf')) {
      alert('कृपया फक्त PDF फाईल्स निवडा.'); return;
    }
    const limit = layoutMode === '4x6' ? 1 : 5;
    if (filesRef.current.length + files.length > limit) {
      alert(`तुम्ही या लेआउटसाठी जास्तीत जास्त ${limit} फाईल्स निवडू शकता.`); return;
    }
    queueRef.current = files;
    qProcIdx.current = 0;
    setInputDisabled(true);
    processQueue(null);
  };

  // ── Password submit ────────────────────────────────────────────────────────
  const handlePwdSubmit = () => {
    const pwd = pwdRef.current?.value;
    if (!pwd) return;
    processQueue(pwd);
  };

  // ── Reset crop box ─────────────────────────────────────────────────────────
  const handleReset = () => {
    const data = filesRef.current[editIdx];
    if (!data) return;
    data.frontBox = { ...DEFAULT_FRONT };
    data.backBox  = { ...DEFAULT_BACK  };
    setFilesData([...filesRef.current]);
    redraw();
    setStatus('⚡ या फाईलचे क्रॉप रिसेट केले आहे!');
  };

  // ── Generate layout ────────────────────────────────────────────────────────
  const generateLayout = () => {
    const data = filesRef.current;
    if (!data.length) return;
    const hidden = hiddenRef.current;
    const ctx    = hidden.getContext('2d');

    try {
      if (layoutMode === '4x6') {
        hidden.width = P4X6_WIDTH; hidden.height = P4X6_HEIGHT;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, P4X6_WIDTH, P4X6_HEIGHT);
        const d = data[0];
        const destX      = Math.floor((P4X6_WIDTH - CARD_PRINT_W) / 2);
        const frontDestY = 200, gap = 100, backDestY = frontDestY + CARD_PRINT_H + gap;

        ctx.drawImage(d.canvas, d.frontBox.x, d.frontBox.y, d.frontBox.w, d.frontBox.h, destX, frontDestY, CARD_PRINT_W, CARD_PRINT_H);
        drawPrintBorder(ctx, destX, frontDestY, CARD_PRINT_W, CARD_PRINT_H);

        ctx.save();
        ctx.translate(destX + CARD_PRINT_W/2, backDestY + CARD_PRINT_H/2);
        ctx.rotate(Math.PI);
        ctx.drawImage(d.canvas, d.backBox.x, d.backBox.y, d.backBox.w, d.backBox.h, -CARD_PRINT_W/2, -CARD_PRINT_H/2, CARD_PRINT_W, CARD_PRINT_H);
        ctx.restore();
        drawPrintBorder(ctx, destX, backDestY, CARD_PRINT_W, CARD_PRINT_H);
        drawFoldLine(ctx, destX - 50, frontDestY + CARD_PRINT_H + gap/2, destX + CARD_PRINT_W + 50, frontDestY + CARD_PRINT_H + gap/2);

      } else {
        hidden.width = A4_WIDTH; hidden.height = A4_HEIGHT;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT);
        const startY = 100, gapY = 20, gapX = 50;
        const startX = Math.floor((A4_WIDTH - (CARD_PRINT_W * 2 + gapX)) / 2);

        data.forEach((d, i) => {
          const rowY      = startY + i * (CARD_PRINT_H + gapY);
          const frontX    = startX;
          const backX     = startX + CARD_PRINT_W + gapX;
          ctx.drawImage(d.canvas, d.frontBox.x, d.frontBox.y, d.frontBox.w, d.frontBox.h, frontX, rowY, CARD_PRINT_W, CARD_PRINT_H);
          drawPrintBorder(ctx, frontX, rowY, CARD_PRINT_W, CARD_PRINT_H);
          ctx.drawImage(d.canvas, d.backBox.x, d.backBox.y, d.backBox.w, d.backBox.h, backX, rowY, CARD_PRINT_W, CARD_PRINT_H);
          drawPrintBorder(ctx, backX, rowY, CARD_PRINT_W, CARD_PRINT_H);
          drawFoldLine(ctx, frontX + CARD_PRINT_W + gapX/2, rowY - 5, frontX + CARD_PRINT_W + gapX/2, rowY + CARD_PRINT_H + 5);
        });
      }

      // render preview
      const preview = previewRef.current;
      const pCtx    = preview.getContext('2d');
      const ratio   = 440 / hidden.height;
      preview.width  = Math.floor(hidden.width  * ratio);
      preview.height = Math.floor(hidden.height * ratio);
      pCtx.drawImage(hidden, 0, 0, hidden.width, hidden.height, 0, 0, preview.width, preview.height);

      setCanDownload(true);
      setStatus('🎉 प्रिंट-रेडी लेआउट यशस्वीरित्या तयार झाला आहे!');
    } catch (err) {
      console.error(err);
      setStatus('प्रोसेसिंग करताना एरर आला.');
    }
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const hidden = hiddenRef.current;
    if (!hidden?.width) return;
    const a = document.createElement('a');
    a.download = layoutMode === 'a4'
      ? `Mahasarthi_A4_${filesRef.current.length}Files.png`
      : 'Mahasarthi_4x6_Single.png';
    a.href = hidden.toDataURL('image/png', 1.0);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Layout mode change ─────────────────────────────────────────────────────
  const handleLayoutChange = (val) => {
    setLayoutMode(val);
    resetApp();
  };

  const hasFiles      = filesData.length > 0;
  const showControls  = hasFiles;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid mt-4 pb-5">

      {/* Page Header */}
      <div className="lotus-page-header mb-4">
        <div>
          <h4>🖨️ महासारथी / MahaID प्रिंट युटिलिटी</h4>
          <p className="mb-0 text-light opacity-75" style={{ fontSize: '0.9rem' }}>
            १००% सुरक्षित, सोपे आणि अचूक &nbsp;|&nbsp; 4×6 आणि A4 सपोर्ट
          </p>
        </div>
        <Link to="/dashboard" className="btn-switch-module">← Dashboard</Link>
      </div>

      <div className="row g-4">

        {/* ── LEFT PANEL ── */}
        <div className="col-lg-7">
          <div className="bg-white rounded-3 shadow-sm border p-4 d-flex flex-column gap-3">
            <h6 className="fw-semibold text-secondary border-bottom pb-2 mb-0">
              १. फाईल्स निवडा आणि क्रॉप करा
            </h6>

            {/* Layout radios */}
            <div className="d-flex align-items-center gap-4 px-3 py-2 rounded-3 border bg-light">
              <span className="fw-bold small text-dark">पेपर लेआउट:</span>
              {['4x6', 'a4'].map(val => (
                <label key={val} className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="radio" name="layoutType" value={val}
                    checked={layoutMode === val}
                    onChange={() => handleLayoutChange(val)}
                    className="form-check-input mt-0"
                  />
                  {val === '4x6' ? '४×६ (फक्त १ फाईल)' : 'A4 (१ ते ५ फाईल्स)'}
                </label>
              ))}
            </div>

            {/* File input area */}
            <div className={`p-3 rounded-3 border ${isInputDisabled() ? 'opacity-75' : ''}`}
              style={{ background: '#eef2ff' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label htmlFor="pdfFileInput" className="fw-bold small mb-0"
                  style={{ color: '#312e81', cursor: 'pointer' }}>
                  {fileInputLabel()}
                </label>
                {hasFiles && (
                  <button onClick={resetApp}
                    className="btn btn-sm btn-outline-danger py-0 px-2 fw-bold"
                    style={{ fontSize: '0.75rem' }}>
                    🗑️ Clear
                  </button>
                )}
              </div>

              {!pdfJsReady ? (
                <div className="text-center text-muted small py-2">⏳ PDF लायब्ररी लोड होत आहे…</div>
              ) : (
                <input key={fileInputKey} id="pdfFileInput" type="file"
                  accept="application/pdf"
                  multiple={layoutMode === 'a4'}
                  disabled={isInputDisabled()}
                  onChange={handleFileChange}
                  className="form-control form-control-sm"
                />
              )}

              {showFiles && (
                <div className="mt-2 small text-secondary">
                  निवडलेल्या फाईल्स: <span className="fw-bold" style={{ color: '#4338ca' }}>{fileNames}</span>
                </div>
              )}
            </div>

            {/* Password prompt */}
            {showPwd && (
              <div className="p-3 rounded-3 border" style={{ background: '#fffbeb', borderColor: '#fcd34d' }}>
                <p className="small fw-medium mb-2" style={{ color: '#92400e' }}>{pwdPrompt}</p>
                <div className="d-flex gap-2">
                  <input ref={pwdRef} type="password" placeholder="पासवर्ड टाका"
                    className="form-control form-control-sm"
                    onKeyDown={e => e.key === 'Enter' && handlePwdSubmit()}
                  />
                  <button onClick={handlePwdSubmit}
                    className="btn btn-sm btn-warning fw-semibold text-white px-3">
                    अनलॉक
                  </button>
                </div>
                {pwdError && <p className="text-danger small mt-1 mb-0 fw-medium">{pwdError}</p>}
              </div>
            )}

            {/* Status */}
            <div className="text-center small fw-medium py-2 px-3 rounded-3 border"
              style={{ background: '#f8fafc', color: '#475569' }}>
              {status}
            </div>

            {/* Canvas preview */}
            <div className="border-2 border-dashed rounded-3 d-flex align-items-start justify-content-center overflow-auto position-relative"
              style={{ minHeight: 380, maxHeight: 480, background: '#f8fafc', borderStyle: 'dashed', borderColor: '#cbd5e1', padding: '8px' }}>
              <canvas ref={thumbRef} className="shadow-sm mw-100 h-auto d-block"
                style={{ display: 'none', touchAction: 'none' }} />
              {!hasFiles && (
                <div className="position-absolute top-50 start-50 translate-middle text-center text-muted"
                  style={{ pointerEvents: 'none' }}>
                  📄 PDF अपलोड केल्यावर येथे दिसेल.
                </div>
              )}
            </div>

            {/* Controls */}
            {showControls && (
              <div className="p-3 rounded-3 border d-flex flex-column gap-3" style={{ background: '#f8fafc' }}>

                {/* File navigation */}
                {showNav && (
                  <div className="d-flex align-items-center justify-content-between bg-white p-2 rounded-3 border shadow-sm">
                    <button onClick={() => { const i = editIdx - 1; setEditIdx(i); editIdxRef.current = i; }}
                      disabled={editIdx === 0}
                      className="btn btn-sm btn-outline-secondary fw-bold">◀ मागील</button>
                    <span className="small fw-bold text-primary">
                      फाईल {editIdx + 1} / {filesData.length}
                    </span>
                    <button onClick={() => { const i = editIdx + 1; setEditIdx(i); editIdxRef.current = i; }}
                      disabled={editIdx === filesData.length - 1}
                      className="btn btn-sm btn-outline-secondary fw-bold">पुढची ▶</button>
                  </div>
                )}

                {/* Tab buttons */}
                <div className="d-flex gap-2">
                  {['front', 'back'].map(tab => (
                    <button key={tab}
                      onClick={() => { setActiveTab(tab); activeTabRef.current = tab; }}
                      className={`btn flex-fill fw-bold btn-sm py-2 ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}>
                      🔲 {tab === 'front' ? 'वरचे कार्ड (Front)' : 'खालचे कार्ड (Back)'}
                    </button>
                  ))}
                </div>

                <div className="text-center small fw-semibold py-2 px-3 rounded-3"
                  style={{ background: '#eff6ff', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                  💡 टीप: वरील कार्ड्सचे बॉक्स लहान-मोठे करा (कडा किंवा कोपरे ओढा).
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-2">
                  <button onClick={handleReset}
                    className="btn btn-outline-secondary fw-bold px-3">⚡ रिसेट</button>
                  <button onClick={generateLayout}
                    className="btn btn-success flex-fill fw-bold">✨ प्रिंट-रेडी लेआउट बनवा</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="col-lg-5">
          <div className="bg-white rounded-3 shadow-sm border p-4 d-flex flex-column gap-3 h-100">
            <h6 className="fw-semibold text-secondary border-bottom pb-2 mb-0">
              २. प्रिंट-रेडी पूर्वावलोकन
            </h6>

            <div className="d-flex align-items-center justify-content-center rounded-3 border overflow-auto flex-grow-1"
              style={{ background: '#f1f5f9', minHeight: 300, padding: '12px' }}>
              <canvas ref={previewRef}
                className="shadow-sm bg-white rounded"
                style={{ maxHeight: 440, width: 'auto' }}
              />
            </div>

            <button onClick={handleDownload} disabled={!canDownload}
              className="btn btn-primary w-100 fw-bold py-3 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
              ⬇️ डाऊनलोड इमेज (Download)
            </button>
          </div>
        </div>
      </div>

      {/* Hidden full-res canvas */}
      <canvas ref={hiddenRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AdjustMahaID;
