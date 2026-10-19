import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AppWindow, Building2, Check, ChevronDown, CircleAlert, DoorOpen,
  LoaderCircle, LogIn, LogOut, RefreshCw, ShieldCheck, Clock3, UserRound
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const ZONES = [
  { id: "1m-gym", floor: "1M", area: "健身房", count: 6, groups: [{ title: "左至右", wall: "整排", labels: ["A","B","C","D","E","F"] }] },
  { id: "2f-lobby", floor: "2F", area: "大廳", count: 5, groups: [{ title: "左側牆壁", wall: "左側牆壁", labels: ["A","B","C"] }, { title: "右側牆壁", wall: "右側牆壁", labels: ["D","E"] }] },
  { id: "2f-factory", floor: "2F", area: "廠房", count: 12, groups: [{ title: "左側牆壁", wall: "左側牆壁", labels: ["A","B","C","D","E","F"] }, { title: "右側牆壁", wall: "右側牆壁", labels: ["G","H","I","J","K","L"] }] },
  { id: "3f-lobby", floor: "3F", area: "大廳", count: 5, groups: [{ title: "左側牆壁", wall: "左側牆壁", labels: ["A","B","C"] }, { title: "右側牆壁", wall: "右側牆壁", labels: ["D","E"] }] },
  { id: "4f-general", floor: "4F", area: "一般區域", count: 5, groups: [{ title: "左側牆壁", wall: "左側牆壁", labels: ["A","B","C"] }, { title: "右側牆壁", wall: "右側牆壁", labels: ["D","E"] }] },
  { id: "4f-meeting", floor: "4F", area: "會議廳", count: 12, groups: [{ title: "左側牆壁", wall: "左側牆壁", labels: ["A","B","C","D","E","F"] }, { title: "右側牆壁", wall: "右側牆壁", labels: ["G","H","I","J","K","L"] }] },
];

function keyFor(zoneId, label) { return `${zoneId}-${label}`; }
function formatDate(value) {
  if (!value) return "尚未更新";
  return new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function Login({ onLogin, busy, error }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="brand-mark"><AppWindow size={27} /></div>
        <p className="eyebrow">FACILITY MANAGEMENT</p>
        <h1>公司窗戶狀態</h1>
        <p className="muted">登入後查看及更新各樓層窗戶狀態。</p>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email.trim(), password); }} className="login-form">
          <label>公司帳號（Email）<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" /></label>
          <label>密碼<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="輸入密碼" /></label>
          {error && <div className="error-note"><CircleAlert size={16}/>{error}</div>}
          <button className="primary-button" disabled={busy} type="submit">
            {busy ? <LoaderCircle className="spin" size={18}/> : <LogIn size={18}/>}
            登入管理網站
          </button>
        </form>
        <div className="security-note"><ShieldCheck size={17}/><span>只有已建立的公司帳號可以查看及修改狀態。</span></div>
      </div>
    </main>
  );
}

function WindowTile({ record, onToggle, saving }) {
  const open = Boolean(record?.is_open);
  return (
    <button className={`window-tile ${open ? "is-open" : "is-closed"}`} onClick={() => onToggle(record)} disabled={saving} aria-label={`${record?.label ?? "窗戶"} ${open ? "已開啟" : "已關閉"}，點擊切換`}>
      <span className="window-icon"><AppWindow size={25} strokeWidth={1.8}/></span>
      <strong>{record?.label}</strong>
      <span className="tile-status">{open ? "OPEN · 已開啟" : "CLOSED · 已關閉"}</span>
      <span className="tile-action">{saving ? <LoaderCircle size={13} className="spin"/> : "點擊切換"}</span>
    </button>
  );
}

function FloorDiagram({ zone, records, onToggle, savingId }) {
  const recordMap = new Map(records.map(r => [r.id, r]));
  return (
    <section className="diagram-card">
      <div className="diagram-header">
        <div>
          <p className="eyebrow">EDITABLE SCHEMATIC · 示意圖</p>
          <h2>{zone.floor} <span>/</span> {zone.area}</h2>
          <p className="muted small">依目前提供的窗戶編號排列；此圖不代表現場實際尺寸或位置。</p>
        </div>
        <div className="count-chip">{zone.count} 扇窗</div>
      </div>
      <div className={`floorplan ${zone.groups.length === 1 ? "single-row" : ""}`}>
        {zone.groups.map((group, groupIndex) => (
          <div className="wall-group" key={group.wall}>
            <div className="wall-title"><span>{group.title}</span><span className="wall-line"/></div>
            <div className={`window-row ${group.labels.length > 5 ? "six-windows" : ""}`}>
              {group.labels.map(label => {
                const id = keyFor(zone.id, label);
                const record = recordMap.get(id) ?? { id, label, is_open: false, updated_at: null, updated_by: "尚未載入" };
                return <WindowTile key={id} record={record} onToggle={onToggle} saving={savingId === id}/>;
              })}
            </div>
            {zone.groups.length > 1 && <div className="wall-base" />}
          </div>
        ))}
      </div>
      <div className="diagram-footer">
        <span><i className="legend-dot open-dot"/> 綠色：已開啟</span>
        <span><i className="legend-dot closed-dot"/> 灰色：已關閉</span>
        <span><AppWindow size={14}/> 點擊窗戶切換狀態</span>
      </div>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeZone, setActiveZone] = useState(ZONES[0].id);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadRecords = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true); setPageError("");
    const { data, error } = await supabase.from("window_status").select("*").order("floor").order("area").order("label");
    if (error) setPageError(`讀取失敗：${error.message}`);
    else setRecords(data ?? []);
    setLoading(false);
  }, [session]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  useEffect(() => {
    if (!supabase || !session) return;
    const channel = supabase.channel("window-status-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "window_status" }, payload => {
        if (payload.eventType === "DELETE") {
          setRecords(prev => prev.filter(r => r.id !== payload.old.id));
        } else if (payload.new?.id) {
          setRecords(prev => {
            const exists = prev.some(r => r.id === payload.new.id);
            return exists ? prev.map(r => r.id === payload.new.id ? payload.new : r) : [...prev, payload.new];
          });
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  const doLogin = async (email, password) => {
    if (!supabase) return;
    setLoginBusy(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("登入失敗，請確認帳號、密碼，或請管理員在 Supabase 建立帳號。");
    setLoginBusy(false);
  };

  const doLogout = async () => { if (supabase) await supabase.auth.signOut(); };

  const toggleWindow = async (record) => {
    if (!supabase || !session || savingId) return;
    const id = record.id;
    const previous = record;
    const next = !record.is_open;
    setSavingId(id); setPageError(""); setNotice("");
    setRecords(prev => prev.map(r => r.id === id ? { ...r, is_open: next, updated_by: session.user.email || "已登入同事" } : r));
    const { data, error } = await supabase.from("window_status").update({
      is_open: next,
      updated_by: session.user.email || "已登入同事",
      updated_at: new Date().toISOString()
    }).eq("id", id).select().single();
    if (error) {
      setRecords(prev => prev.map(r => r.id === id ? previous : r));
      setPageError(`儲存失敗：${error.message}`);
    } else {
      setRecords(prev => prev.map(r => r.id === id ? data : r));
      setNotice(`${record.floor} ${record.area} · Window ${record.label} 已${next ? "開啟" : "關閉"}並保存。`);
    }
    setSavingId("");
  };

  const active = ZONES.find(z => z.id === activeZone) ?? ZONES[0];
  const activeRecords = useMemo(() => records.filter(r => r.zone_id === activeZone), [records, activeZone]);
  const openCount = records.filter(r => r.is_open).length;
  const totalCount = 45;
  const zoneCounts = useMemo(() => {
    const map = {};
    for (const z of ZONES) {
      const list = records.filter(r => r.zone_id === z.id);
      map[z.id] = { open: list.filter(r => r.is_open).length, total: z.count };
    }
    return map;
  }, [records]);

  if (!authReady) return <div className="loading-screen"><LoaderCircle className="spin" size={24}/> 載入中…</div>;
  if (!supabase) return (
    <main className="login-shell"><div className="login-card setup-card">
      <div className="brand-mark"><Building2 size={27}/></div><p className="eyebrow">SETUP REQUIRED</p><h1>完成雲端設定</h1>
      <p>網站尚未取得 Supabase 連線設定。請在 Netlify 的環境變數加入：</p>
      <pre>VITE_SUPABASE_URL{"\n"}VITE_SUPABASE_PUBLISHABLE_KEY</pre>
      <p className="muted small">設定後請重新部署網站。詳細步驟請看專案中的 README.md。</p>
    </div></main>
  );
  if (!session) return <Login onLogin={doLogin} busy={loginBusy} error={loginError}/>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark small-mark"><AppWindow size={21}/></div><div><strong>Window Status</strong><span>公司窗戶管理</span></div></div>
        <div className="top-actions"><span className="signed-in"><UserRound size={15}/>{session.user.email}</span><button className="quiet-button" onClick={doLogout}><LogOut size={16}/><span>登出</span></button></div>
      </header>
      <main className="main-content">
        <section className="page-heading">
          <div><p className="eyebrow">FACILITY OPERATIONS</p><h1>窗戶開關狀態</h1><p className="muted">選擇區域，再點擊平面圖上的窗戶更新狀態。</p></div>
          <button className="refresh-button" onClick={loadRecords} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""}/>重新整理</button>
        </section>
        <section className="summary-grid">
          <div className="summary-card"><span>窗戶總數</span><strong>{totalCount}</strong><small>6 個管理區域</small></div>
          <div className="summary-card"><span>已開啟</span><strong className="green-text">{openCount}</strong><small>OPEN</small></div>
          <div className="summary-card"><span>已關閉</span><strong>{Math.max(0, totalCount - openCount)}</strong><small>CLOSED</small></div>
        </section>
        <section className="zone-section">
          <div className="section-title"><h2>選擇樓層／區域</h2><span>共 45 扇窗</span></div>
          <div className="zone-grid">
            {ZONES.map(zone => {
              const counts = zoneCounts[zone.id] ?? { open: 0, total: zone.count };
              return <button key={zone.id} className={`zone-card ${activeZone === zone.id ? "selected" : ""}`} onClick={() => setActiveZone(zone.id)}>
                <div className="zone-card-top"><span className="floor-pill">{zone.floor}</span><span className="zone-count">{counts.open}/{zone.count} 開啟</span></div>
                <strong>{zone.area}</strong><span className="zone-subtitle">{zone.count} 扇窗</span>
                <div className="mini-progress"><i style={{ width: `${counts.open / zone.count * 100}%` }}/></div>
              </button>;
            })}
          </div>
        </section>
        {pageError && <div className="error-banner"><CircleAlert size={17}/><span>{pageError}</span></div>}
        {notice && <div className="success-banner"><Check size={17}/><span>{notice}</span></div>}
        {loading && <div className="loading-inline"><LoaderCircle className="spin" size={18}/>同步資料中…</div>}
        <FloorDiagram zone={active} records={activeRecords} onToggle={toggleWindow} savingId={savingId}/>
        <section className="activity-card">
          <div className="section-title"><h2><Clock3 size={18}/> 最近更新</h2><span>依資料庫紀錄</span></div>
          {records.length === 0 ? <p className="muted small">尚未讀取到窗戶資料，請確認已執行 Supabase SQL。</p> :
            <div className="activity-list">
              {[...records].filter(r => r.updated_at).sort((a,b) => new Date(b.updated_at)-new Date(a.updated_at)).slice(0,5).map(r =>
                <div className="activity-row" key={r.id}><span className={`activity-dot ${r.is_open ? "open-dot" : "closed-dot"}`}/><div className="activity-main"><strong>{r.floor} · {r.area} · Window {r.label}</strong><span>{r.is_open ? "OPEN · 已開啟" : "CLOSED · 已關閉"}</span></div><div className="activity-meta"><span>{r.updated_by || "System"}</span><time>{formatDate(r.updated_at)}</time></div></div>
              )}
            </div>}
        </section>
        <footer className="footer-note"><ShieldCheck size={15}/> 示意平面圖不代表現場實際尺寸或方位。請依現場確認窗戶位置。<span>即時同步由 Supabase 提供</span></footer>
      </main>
    </div>
  );
}