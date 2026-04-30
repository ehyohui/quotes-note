import React, { useState, useMemo, useEffect, useRef } from "react";

const SOURCES = ["전체", "롱블랙", "민음사 세계문학일력", "밀리의 서재", "퍼블리"];
const FIXED_TAGS = ["AI", "조직", "성장", "브랜딩", "마음"];
const SOURCE_COLORS = {
  롱블랙: "#c8a96e",
  "민음사 세계문학일력": "#a78bca",
  "밀리의 서재": "#6aaa74",
  퍼블리: "#6b9fc9",
};
const C = {
  cream: "#F5F0E8", white: "#FFFFFF", terracotta: "#C4522A",
  terracottaHover: "#A8421F", border: "#DDD3C0", text: "#2C1A0E",
  muted: "#9A7E6A", hover: "#F7F2EA", pill: "#E8DFCC", pillText: "#7A5C3E",
};
const INITIAL_QUOTES = [
  { id: 1, text: "성과가 어땠냐고? 온라인 영업 조직이 만든 변화가 인상적이야. 수백 개의 댓글을 AI가 수집하고 분류해, FAQ 생성까지 하게 했지.", source: "롱블랙", book: "바이브의 시대", author: "롱블랙 에디터", date: "2025-04-29", tags: ["AI", "조직"] },
  { id: 2, text: "김 교수가 가장 위험하다고 본 건 AI가 내놓은 결과에 사람이 취해버리는 순간이야. 사람은 AI에 끌려가기 시작한다는 거지.", source: "롱블랙", book: "바이브의 시대", author: "롱블랙 에디터", date: "2025-04-29", tags: ["AI"] },
  { id: 3, text: "각 사람은 자신의 개성을 발전시킨 정도에 비례해서 그만큼 더 자기 자신에게 가치를 지니게 되고, 그 결과 다른 사람들에게도 더 가치 있게 된다.", source: "밀리의 서재", book: "자유론", author: "존스튜어트밀", date: "2025-04-29", tags: ["성장", "마음"] },
  { id: 4, text: "다루는 주제가 심오할수록 그 표현은 소박하다. 모든 숭고한 것들은 언제나 실망스러울 정도로 평이한 말들로 설법되는 법이다.", source: "민음사 세계문학일력", book: "장 그르니에 선집", author: "장 그르니에", date: "2026-04-29", tags: ["마음"] },
];

function today() { return new Date().toISOString().split("T")[0]; }
function SourceDot({ source, size = 8 }) {
  return <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%", background:SOURCE_COLORS[source]??C.muted, flexShrink:0 }} />;
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="12" y2="4"/><line x1="2" y1="7" x2="12" y2="7"/><line x1="2" y1="10" x2="12" y2="10"/>
      <circle cx="9" cy="4" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="5" cy="7" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

// ── AddModal ──────────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd, onEdit, existingQuotes, initialData }) {
  const isEdit = !!initialData;
  const [texts, setTexts]   = useState(isEdit ? [initialData.text] : [""]);
  const [source, setSource] = useState(initialData?.source || "롱블랙");
  const [book, setBook]     = useState(initialData?.book !== "제목 없음" ? (initialData?.book||"") : "");
  const [author, setAuthor] = useState(initialData?.author !== "미상" ? (initialData?.author||"") : "");
  const [tags, setTags]     = useState(initialData?.tags||[]);
  const [showSuggest, setShowSuggest] = useState(false);

  const bookMap = useMemo(() => {
    const map = {};
    existingQuotes.forEach(q => { if (q.book && q.book!=="제목 없음") map[q.book]={author:q.author,source:q.source}; });
    return map;
  }, [existingQuotes]);

  const suggestions = useMemo(() => {
    if (!book.trim()) return [];
    return Object.keys(bookMap).filter(b => b.toLowerCase().includes(book.toLowerCase()));
  }, [book, bookMap]);

  const toggleTag = t => setTags(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]);
  const selectBook = b => { setBook(b); setAuthor(bookMap[b]?.author||""); setShowSuggest(false); };
  const handleSourceChange = val => {
    setSource(val);
    if (val==="롱블랙") setAuthor("롱블랙 에디터");
    else if (author==="롱블랙 에디터") setAuthor("");
  };
  const updateText = (i,val) => setTexts(p => p.map((t,idx)=>idx===i?val:t));
  const handleSave = () => {
    const fa = source==="롱블랙" ? "롱블랙 에디터" : (author||"미상");
    const fb = book||"제목 없음";
    if (isEdit) {
      if (!texts[0].trim()) return;
      onEdit({...initialData, text:texts[0].trim(), source, book:fb, author:fa, tags});
    } else {
      const valid = texts.filter(t=>t.trim());
      if (!valid.length) return;
      onAdd(valid.map(t=>({ id:Date.now()+Math.random(), text:t.trim(), source, book:fb, author:fa, date:today(), tags })));
    }
    onClose();
  };
  const hasContent = texts.some(t=>t.trim());
  const inp = { width:"100%", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"10px 13px", color:C.text, fontSize:"14px", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(44,26,14,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:C.cream, borderRadius:"20px 20px 0 0", padding:"24px 20px", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(44,26,14,0.2)" }}>
        {/* 핸들 */}
        <div style={{ width:40, height:4, background:C.border, borderRadius:2, margin:"0 auto 20px" }} />
        <h2 style={{ fontSize:"17px", fontWeight:"700", color:C.terracotta, marginBottom:"20px", fontFamily:"'Nanum Myeongjo',serif" }}>
          {isEdit?"문구 편집":"문구 추가"}
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
              <label style={{ fontSize:"12px", color:C.muted }}>문구 *</label>
              {!isEdit && <button onClick={()=>setTexts(p=>[...p,""])} style={{ fontSize:"12px", color:C.terracotta, background:"none", border:"none", cursor:"pointer", fontWeight:"600" }}>+ 문구 추가</button>}
            </div>
            {texts.map((t,i) => (
              <div key={i} style={{ display:"flex", gap:"8px", alignItems:"flex-start", marginBottom:i<texts.length-1?"8px":0 }}>
                {!isEdit && texts.length>1 && <span style={{ fontSize:"11px", color:C.muted, paddingTop:12, minWidth:16 }}>{i+1}</span>}
                <textarea rows={3} placeholder="문구 입력..." value={t} onChange={e=>updateText(i,e.target.value)}
                  style={{ ...inp, resize:"none", lineHeight:"1.8", flex:1 }}
                  onFocus={e=>(e.target.style.borderColor=C.terracotta)}
                  onBlur={e=>(e.target.style.borderColor=C.border)} />
                {!isEdit && texts.length>1 && <button onClick={()=>setTexts(p=>p.filter((_,idx)=>idx!==i))} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:"18px", paddingTop:8 }}>×</button>}
              </div>
            ))}
          </div>
          <div>
            <label style={{ display:"block", fontSize:"12px", color:C.muted, marginBottom:"5px" }}>출처</label>
            <select value={source} onChange={e=>handleSourceChange(e.target.value)} style={{ ...inp, appearance:"none" }}>
              {SOURCES.slice(1).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ position:"relative" }}>
            <label style={{ display:"block", fontSize:"12px", color:C.muted, marginBottom:"5px" }}>
              책 / 아티클 제목
              {Object.keys(bookMap).length>0 && <span style={{ marginLeft:6, color:C.terracotta, fontSize:"11px" }}>저장된 책 {Object.keys(bookMap).length}권</span>}
            </label>
            <input placeholder="제목 입력..." value={book}
              onChange={e=>{setBook(e.target.value);setShowSuggest(true);}}
              onFocus={()=>setShowSuggest(true)}
              onBlur={()=>setTimeout(()=>setShowSuggest(false),300)}
              style={inp} onFocusCap={e=>(e.target.style.borderColor=C.terracotta)} />
            {showSuggest && suggestions.length>0 && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:10, background:C.cream, border:`1px solid ${C.border}`, borderRadius:"8px", marginTop:4, boxShadow:"0 4px 20px rgba(44,26,14,0.12)", overflow:"hidden" }}>
                {suggestions.map(b=>(
                  <div key={b} onMouseDown={()=>selectBook(b)}
                    style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.border}` }}
                    onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <div style={{ fontSize:"13px", color:C.text, fontWeight:"600" }}>{b}</div>
                    <div style={{ fontSize:"12px", color:C.muted, marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
                      <SourceDot source={bookMap[b]?.source} size={6} /> <span style={{ marginLeft:4 }}>{bookMap[b]?.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={{ display:"block", fontSize:"12px", color:C.muted, marginBottom:"5px" }}>저자</label>
            <input placeholder="저자명" value={source==="롱블랙"?"롱블랙 에디터":author}
              onChange={e=>setAuthor(e.target.value)} disabled={source==="롱블랙"}
              style={{ ...inp, background:source==="롱블랙"?C.pill:C.white, color:source==="롱블랙"?C.muted:C.text, cursor:source==="롱블랙"?"not-allowed":"text" }} />
            {source==="롱블랙" && <p style={{ fontSize:"11px", color:C.muted, marginTop:4 }}>✓ 롱블랙은 저자가 자동 설정돼요</p>}
          </div>
          <div>
            <label style={{ display:"block", fontSize:"12px", color:C.muted, marginBottom:"8px" }}>태그</label>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {FIXED_TAGS.map(t=>{
                const on=tags.includes(t);
                return <button key={t} onClick={()=>toggleTag(t)} style={{ padding:"6px 14px", borderRadius:"20px", cursor:"pointer", fontSize:"13px", border:on?`1px solid ${C.terracotta}`:`1px solid ${C.border}`, background:on?C.terracotta:C.pill, color:on?"#fff":C.pillText, fontWeight:on?"600":"400" }}>#{t}</button>;
              })}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <button onClick={onClose} style={{ flex:1, padding:"13px", background:C.pill, border:"none", borderRadius:"10px", color:C.pillText, cursor:"pointer", fontSize:"15px" }}>취소</button>
          <button onClick={handleSave} style={{ flex:2, padding:"13px", border:"none", borderRadius:"10px", background:hasContent?C.terracotta:C.border, color:"#fff", cursor:hasContent?"pointer":"default", fontSize:"15px", fontWeight:"600" }}>
            {isEdit?"수정 완료":`저장${texts.filter(t=>t.trim()).length>1?` (${texts.filter(t=>t.trim()).length}개)`:""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QuoteRow ──────────────────────────────────────────────────────────────────
function QuoteRow({ quote, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const accent = SOURCE_COLORS[quote.source]??C.muted;
  return (
    <div style={{ borderBottom:`1px solid ${C.border}` }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ display:"flex", gap:"12px", padding:"14px 16px", cursor:"pointer" }}
        onMouseEnter={e=>(e.currentTarget.style.background=C.hover)}
        onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
        <div style={{ width:3, borderRadius:2, background:accent, alignSelf:"stretch", flexShrink:0, minHeight:40 }} />
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Nanum Myeongjo',Georgia,serif", fontSize:"15px", lineHeight:"1.75", color:C.text, margin:"0 0 7px",
            display:open?"block":"-webkit-box", WebkitLineClamp:open?"unset":2, WebkitBoxOrient:"vertical", overflow:open?"visible":"hidden" }}>
            {quote.text}
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:"6px", flexWrap:"wrap" }}>
            <SourceDot source={quote.source} />
            <span style={{ fontSize:"12px", color:C.muted }}>{quote.source}</span>
            <span style={{ fontSize:"12px", color:C.border }}>·</span>
            <span style={{ fontSize:"12px", color:C.muted, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", maxWidth:160 }}>《{quote.book}》</span>
            {quote.tags.map(t=>(
              <span key={t} style={{ fontSize:"11px", color:C.pillText, background:C.pill, padding:"1px 7px", borderRadius:"20px" }}>#{t}</span>
            ))}
          </div>
          {open && <p style={{ fontSize:"12px", color:C.muted, marginTop:6 }}>— {quote.author} · {quote.date}</p>}
        </div>
        <div style={{ display:"flex", gap:"2px", flexShrink:0 }}>
          <button onClick={e=>{e.stopPropagation();onEdit(quote);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, padding:"4px 6px", borderRadius:"4px", display:"flex", alignItems:"center" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.terracotta;e.currentTarget.style.background=C.hover;}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.muted;e.currentTarget.style.background="none";}}>
            <EditIcon/>
          </button>
          <button onClick={e=>{e.stopPropagation();onDelete(quote.id);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:"18px", lineHeight:1, padding:"2px 6px", borderRadius:"4px" }}
            onMouseEnter={e=>(e.currentTarget.style.color=C.terracotta)}
            onMouseLeave={e=>(e.currentTarget.style.color=C.muted)}>×</button>
        </div>
      </div>
    </div>
  );
}

// ── 내보내기/가져오기 모달 ────────────────────────────────────────────────────
function ExportModal({ quotes, onClose }) {
  const json = JSON.stringify(quotes, null, 2);
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(44,26,14,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:C.cream, borderRadius:"20px 20px 0 0", padding:"24px 20px", width:"100%", maxWidth:"560px", boxShadow:"0 -8px 40px rgba(44,26,14,0.2)" }}>
        <div style={{ width:40, height:4, background:C.border, borderRadius:2, margin:"0 auto 20px" }} />
        <h2 style={{ fontSize:"17px", fontWeight:"700", color:C.terracotta, marginBottom:"6px", fontFamily:"'Nanum Myeongjo',serif" }}>내보내기</h2>
        <p style={{ fontSize:"12px", color:C.muted, marginBottom:"12px" }}>아래 텍스트를 클릭하면 전체 선택돼요. Ctrl+C(Mac: Cmd+C)로 복사 후 메모장에 저장하세요.</p>
        <textarea readOnly value={json} onClick={e=>e.target.select()}
          style={{ width:"100%", height:"200px", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"12px", fontSize:"11px", fontFamily:"monospace", color:C.text, outline:"none", resize:"none", boxSizing:"border-box" }} />
        <button onClick={onClose} style={{ width:"100%", padding:"13px", background:C.pill, border:"none", borderRadius:"10px", color:C.pillText, cursor:"pointer", fontSize:"15px", marginTop:"12px" }}>닫기</button>
      </div>
    </div>
  );
}

function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState("");
  const confirm = () => {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length>0) { onImport(data); onClose(); }
      else alert("올바른 형식이 아니에요");
    } catch { alert("JSON 형식이 맞지 않아요"); }
  };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(44,26,14,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:C.cream, borderRadius:"20px 20px 0 0", padding:"24px 20px", width:"100%", maxWidth:"560px", boxShadow:"0 -8px 40px rgba(44,26,14,0.2)" }}>
        <div style={{ width:40, height:4, background:C.border, borderRadius:2, margin:"0 auto 20px" }} />
        <h2 style={{ fontSize:"17px", fontWeight:"700", color:C.terracotta, marginBottom:"6px", fontFamily:"'Nanum Myeongjo',serif" }}>가져오기</h2>
        <p style={{ fontSize:"12px", color:C.muted, marginBottom:"12px" }}>내보내기로 복사해둔 텍스트를 붙여넣으세요.</p>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="여기에 붙여넣기..."
          style={{ width:"100%", height:"200px", background:C.white, border:`1px solid ${C.border}`, borderRadius:"8px", padding:"12px", fontSize:"11px", fontFamily:"monospace", color:C.text, outline:"none", resize:"none", boxSizing:"border-box" }} />
        <div style={{ display:"flex", gap:"10px", marginTop:"12px" }}>
          <button onClick={confirm} style={{ flex:2, padding:"13px", background:text.trim()?C.terracotta:C.border, border:"none", borderRadius:"10px", color:"#fff", cursor:text.trim()?"pointer":"default", fontSize:"15px", fontWeight:"600" }}>가져오기</button>
          <button onClick={onClose} style={{ flex:1, padding:"13px", background:C.pill, border:"none", borderRadius:"10px", color:C.pillText, cursor:"pointer", fontSize:"15px" }}>취소</button>
        </div>
      </div>
    </div>
  );
}

// ── 사이드바 드로어 (모바일) ──────────────────────────────────────────────────
function Drawer({ open, onClose, activeSource, setActiveSource, counts }) {
  if (!open) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(44,26,14,0.4)", zIndex:200 }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:220, background:C.cream, padding:"48px 14px 28px", overflowY:"auto" }}>
        <div style={{ fontFamily:"'Dancing Script',cursive", fontSize:"22px", color:C.terracotta, marginBottom:4 }}>my archive</div>
        <div style={{ fontSize:"12px", color:C.muted, marginBottom:20 }}>출처 필터</div>
        {SOURCES.map(s=>(
          <button key={s} onClick={()=>{setActiveSource(s);onClose();}}
            style={{ display:"flex", alignItems:"center", width:"100%", padding:"8px 10px", borderRadius:"8px", border:"none", background:activeSource===s?C.terracotta:"transparent", cursor:"pointer", fontSize:"14px", color:activeSource===s?"#fff":C.muted, fontWeight:activeSource===s?"600":"400", marginBottom:2, textAlign:"left", gap:8 }}>
            {s!=="전체"?<SourceDot source={s}/>:<span style={{width:8}}/>}
            <span style={{flex:1}}>{s}</span>
            <span style={{fontSize:"12px",opacity:0.7}}>{counts[s]??0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [quotes, setQuotes]             = useState([]);
  const [search, setSearch]             = useState("");
  const [activeSource, setActiveSource] = useState("전체");
  const [activeTag, setActiveTag]       = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [showExport, setShowExport]     = useState(false);
  const [showImport, setShowImport]     = useState(false);
  const [showDrawer, setShowDrawer]     = useState(false);
  const [loaded, setLoaded]             = useState(false);
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("quotes-data");
        if (result?.value) {
          const saved = JSON.parse(result.value);
          if (Array.isArray(saved) && saved.length > 0) { setQuotes(saved); setLoaded(true); return; }
        }
      } catch {}
      setQuotes(INITIAL_QUOTES);
      setLoaded(true);
    })();
  }, []);

  const saveQuotes = async (q) => {
    setQuotes(q);
    try { await window.storage.set("quotes-data", JSON.stringify(q)); } catch {}
  };

  const filtered = useMemo(() => quotes.filter(q => {
    const src = activeSource==="전체" || q.source===activeSource;
    const tag = !activeTag || q.tags.includes(activeTag);
    const kw  = !search || [q.text,q.book,q.author].some(s=>s.toLowerCase().includes(search.toLowerCase()));
    return src && tag && kw;
  }), [quotes, search, activeSource, activeTag]);

  const counts = useMemo(() => {
    const c = {전체:quotes.length};
    SOURCES.slice(1).forEach(s=>{c[s]=quotes.filter(q=>q.source===s).length;});
    return c;
  }, [quotes]);

  const tagCounts = useMemo(() => {
    const c={};
    FIXED_TAGS.forEach(t=>{c[t]=quotes.filter(q=>q.tags.includes(t)).length;});
    return c;
  }, [quotes]);

  if (!loaded) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:C.cream, color:C.muted, fontSize:"14px" }}>
      불러오는 중...
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif", background:C.white, color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&family=Dancing+Script:wght@600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input,textarea,select { font-family:inherit; }
        ::placeholder { color:${C.muted}; opacity:0.7; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
      `}</style>

      {/* 데스크탑 사이드바 */}
      {!isMobile && (
        <aside style={{ width:210, flexShrink:0, background:C.cream, borderRight:`1px solid ${C.border}`, padding:"28px 14px", position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>
          <div style={{ fontFamily:"'Dancing Script',cursive", fontSize:"22px", color:C.terracotta, marginBottom:4 }}>my archive</div>
          <div style={{ fontSize:"12px", color:C.muted, marginBottom:22 }}>{quotes.length}개의 문구</div>
          <div style={{ fontSize:"10px", color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>출처</div>
          {SOURCES.map(s=>(
            <button key={s} onClick={()=>setActiveSource(s)}
              onMouseEnter={e=>{if(activeSource!==s)e.currentTarget.style.background=C.hover;}}
              onMouseLeave={e=>{if(activeSource!==s)e.currentTarget.style.background="transparent";}}
              style={{ display:"flex", alignItems:"center", width:"100%", padding:"6px 8px", borderRadius:"6px", border:"none", background:activeSource===s?C.terracotta:"transparent", cursor:"pointer", fontSize:"13px", color:activeSource===s?"#fff":C.muted, fontWeight:activeSource===s?"600":"400", marginBottom:2, textAlign:"left", gap:6, transition:"all 0.15s" }}>
              {s!=="전체"?<SourceDot source={s}/>:<span style={{width:8}}/>}
              <span style={{flex:1}}>{s}</span>
              <span style={{fontSize:"11px",opacity:0.7}}>{counts[s]??0}</span>
            </button>
          ))}
        </aside>
      )}

      {/* 모바일 드로어 */}
      <Drawer open={showDrawer} onClose={()=>setShowDrawer(false)} activeSource={activeSource} setActiveSource={setActiveSource} counts={counts} />

      {/* Main */}
      <main style={{ flex:1, padding:isMobile?"16px 16px 100px":"32px 40px", maxWidth:860, overflowX:"hidden" }}>

        {/* 헤더 */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {isMobile && (
              <button onClick={()=>setShowDrawer(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:20, padding:"2px 4px" }}>☰</button>
            )}
            <div>
              <h1 style={{ fontFamily:"'Nanum Myeongjo',serif", fontSize:isMobile?"22px":"26px", fontWeight:700, color:C.terracotta }}>문구 노트</h1>
              <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:"14px", color:C.muted, marginTop:2 }}>words that stayed with me</p>
            </div>
          </div>
          {!isMobile && (
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={()=>setShowImport(true)} style={{ padding:"8px 13px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:"8px", color:C.muted, fontSize:"13px", cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.hover;e.currentTarget.style.color=C.text;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.muted;}}>↑ 가져오기</button>
              <button onClick={()=>setShowExport(true)} style={{ padding:"8px 13px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:"8px", color:C.muted, fontSize:"13px", cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.background=C.hover;e.currentTarget.style.color=C.text;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.muted;}}>↓ 내보내기</button>
              <button onClick={()=>setShowModal(true)} style={{ padding:"10px 18px", background:C.terracotta, border:"none", borderRadius:"8px", color:"#fff", fontSize:"13px", fontWeight:"600", cursor:"pointer", boxShadow:"0 2px 8px rgba(196,82,42,0.25)" }}
                onMouseEnter={e=>(e.currentTarget.style.background=C.terracottaHover)}
                onMouseLeave={e=>(e.currentTarget.style.background=C.terracotta)}>+ 문구 추가</button>
            </div>
          )}
        </div>

        <p style={{ fontSize:"13px", color:C.muted, marginBottom:16 }}>
          {activeSource!=="전체"?activeSource:"전체"}{activeTag?` · #${activeTag}`:""} · {filtered.length}개
        </p>

        {/* 검색 */}
        <div style={{ position:"relative", marginBottom:10 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:C.muted }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="문구, 책 제목, 저자 검색"
            style={{ width:"100%", padding:"10px 14px 10px 36px", border:`1px solid ${C.border}`, borderRadius:"8px", fontSize:"14px", color:C.text, background:C.white, outline:"none" }}
            onFocus={e=>(e.target.style.borderColor=C.terracotta)}
            onBlur={e=>(e.target.style.borderColor=C.border)} />
        </div>

        {/* 태그 필터 */}
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:14 }}>
          {FIXED_TAGS.map(t=>{
            const on=activeTag===t;
            return (
              <button key={t} onClick={()=>setActiveTag(on?"":t)}
                style={{ padding:"5px 12px", borderRadius:"20px", cursor:"pointer", fontSize:"12px", border:on?`1px solid ${C.terracotta}`:`1px solid ${C.border}`, background:on?C.terracotta:"transparent", color:on?"#fff":C.muted, fontWeight:on?"600":"400", transition:"all 0.15s" }}>
                #{t} <span style={{opacity:0.6}}>{tagCounts[t]??0}</span>
              </button>
            );
          })}
        </div>

        <div style={{ borderBottom:`1px solid ${C.border}` }} />

        {filtered.length===0
          ? <div style={{ padding:"60px 0", textAlign:"center", color:C.muted, fontSize:"14px" }}>저장된 문구가 없어요</div>
          : filtered.map(q=>(
            <QuoteRow key={q.id} quote={q}
              onDelete={id=>saveQuotes(quotes.filter(q=>q.id!==id))}
              onEdit={q=>setEditTarget(q)} />
          ))
        }
      </main>

      {/* 모바일 하단 고정 버튼 */}
      {isMobile && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:C.cream, borderTop:`1px solid ${C.border}`, padding:"10px 16px", display:"flex", gap:8, zIndex:100 }}>
          <button onClick={()=>setShowImport(true)} style={{ flex:1, padding:"11px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:"10px", color:C.muted, fontSize:"13px", cursor:"pointer" }}>↑ 가져오기</button>
          <button onClick={()=>setShowExport(true)} style={{ flex:1, padding:"11px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:"10px", color:C.muted, fontSize:"13px", cursor:"pointer" }}>↓ 내보내기</button>
          <button onClick={()=>setShowModal(true)} style={{ flex:2, padding:"11px", background:C.terracotta, border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>+ 문구 추가</button>
        </div>
      )}

      {showExport && <ExportModal quotes={quotes} onClose={()=>setShowExport(false)} />}
      {showImport && <ImportModal onImport={q=>saveQuotes(q)} onClose={()=>setShowImport(false)} />}
      {showModal && <AddModal onClose={()=>setShowModal(false)} onAdd={q=>saveQuotes([...q,...quotes])} onEdit={()=>{}} existingQuotes={quotes} />}
      {editTarget && <AddModal onClose={()=>setEditTarget(null)} onAdd={()=>{}} onEdit={u=>{saveQuotes(quotes.map(q=>q.id===u.id?u:q));setEditTarget(null);}} existingQuotes={quotes} initialData={editTarget} />}
    </div>
  );
}
