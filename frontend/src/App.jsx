import { useState, useEffect, useRef } from "react";
import heroBg from './assets/hero_bg.png';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";/* ─── PALETTE ──────────────────────────────────────────────── */
const N1 = "#4F46E5", N2 = "#0F172A", N3 = "#1E293B", N4 = "#334155";
const GOLD = "#10B981", GOLD_L = "#D1FAE5", GOLD_D = "#059669";
const WHITE = "#ffffff", OFF = "#F8FAFC", BORDER = "#E2E8F0";
const SLATE = "#64748B", SLATE2 = "#94A3B8";
const GREEN = "#10B981", RED_D = "#EF4444", AMB = "#F59E0B";
const SC = { Open: { bg: "#FEF2F2", text: "#DC2626", bd: "#FECACA" }, "In Progress": { bg: "#FFFBEB", text: "#D97706", bd: "#FDE68A" }, Resolved: { bg: "#ECFDF5", text: "#059669", bd: "#A7F3D0" } };

/* ─── MOCK DATA ────────────────────────────────────────────── */
const COMPLAINTS = [
  { id: 1, title: "Pothole on MG Road", cat: "Infrastructure", status: "Open", upvotes: 34, priority: 87, dept: "", lat: 12.970, lng: 77.590, reporter: "Arjun M.", date: "2026-04-01", desc: "Large pothole near signal causing accidents and vehicle damage." },
  { id: 2, title: "Overflowing garbage bin", cat: "Sanitation", status: "In Progress", upvotes: 21, priority: 62, dept: "Waste Mgmt.", lat: 12.960, lng: 77.600, reporter: "Priya S.", date: "2026-04-02", desc: "Garbage bin outside market overflowing for 3 consecutive days." },
  { id: 3, title: "Street light outage", cat: "Utilities", status: "Open", upvotes: 17, priority: 55, dept: "", lat: 12.980, lng: 77.580, reporter: "Rahul K.", date: "2026-04-02", desc: "Three street lights out on Nehru Street, safety hazard at night." },
  { id: 4, title: "Waterlogging near school", cat: "Infrastructure", status: "Resolved", upvotes: 45, priority: 95, dept: "PWD", lat: 12.950, lng: 77.610, reporter: "Sneha R.", date: "2026-03-29", desc: "Severe waterlogging blocking the school entrance during rains." },
  { id: 5, title: "Stray dog menace", cat: "Public Safety", status: "In Progress", upvotes: 28, priority: 71, dept: "Animal Control", lat: 12.970, lng: 77.620, reporter: "Vikram D.", date: "2026-04-03", desc: "Pack of aggressive strays near residential colony." },
  { id: 6, title: "Water pipe burst", cat: "Utilities", status: "Open", upvotes: 39, priority: 90, dept: "", lat: 12.960, lng: 77.570, reporter: "Meena J.", date: "2026-04-04", desc: "Major pipe burst flooding the road since early morning." },
  { id: 7, title: "Broken footpath tiles", cat: "Infrastructure", status: "Open", upvotes: 12, priority: 45, dept: "", lat: 12.975, lng: 77.595, reporter: "Suresh L.", date: "2026-04-05", desc: "Broken tiles creating trip hazard for pedestrians near bus stop." },
  { id: 8, title: "Illegal dumping of waste", cat: "Sanitation", status: "Open", upvotes: 19, priority: 58, dept: "", lat: 12.965, lng: 77.585, reporter: "Anjali P.", date: "2026-04-04", desc: "Construction debris dumped illegally near park entrance." },
  { id: 9, title: "Traffic signal malfunction", cat: "Transport", status: "In Progress", upvotes: 31, priority: 78, dept: "Traffic Police", lat: 12.972, lng: 77.605, reporter: "Ravi K.", date: "2026-04-03", desc: "Signal stuck on red at major junction causing gridlock." },
  { id: 10, title: "Sewage overflow", cat: "Utilities", status: "Open", upvotes: 26, priority: 83, dept: "", lat: 12.958, lng: 77.578, reporter: "Lakshmi T.", date: "2026-04-05", desc: "Sewer overflow on residential street creating health hazard." },
];

const BUSES_INIT = [
  { id: "B101", route: "Route 12 – Central–Airport", lat: 12.970, lng: 77.580, speed: 40, next: "7 min", seats: 12 },
  { id: "B202", route: "Route 7 – Market–Station", lat: 12.960, lng: 77.600, speed: 35, next: "3 min", seats: 4 },
  { id: "B303", route: "Route 24 – Hospital–Mall", lat: 12.980, lng: 77.590, speed: 45, next: "11 min", seats: 23 },
  { id: "B404", route: "Route 5 – University–CBD", lat: 12.955, lng: 77.575, speed: 30, next: "6 min", seats: 8 },
  { id: "B505", route: "Route 18 – Ring Road Express", lat: 12.975, lng: 77.615, speed: 50, next: "2 min", seats: 0 },
];

const BUS_STOPS = [
  { id: "S1", name: "Central Bus Stand", lat: 12.968, lng: 77.585 }, { id: "S2", name: "Market Stop", lat: 12.962, lng: 77.598 },
  { id: "S3", name: "Hospital Gate", lat: 12.978, lng: 77.588 }, { id: "S4", name: "University", lat: 12.953, lng: 77.577 },
  { id: "S5", name: "Airport Road", lat: 12.974, lng: 77.612 }, { id: "S6", name: "MG Road", lat: 12.967, lng: 77.602 },
];

const ELEC_ZONES = [
  { id: "W1", name: "Ward A – Central", status: "online", balance: null, consumers: 1240 },
  { id: "W2", name: "Ward B – North", status: "maintenance", schedTime: "2026-04-06 22:00", reason: "Cable upgrade", consumers: 890 },
  { id: "W3", name: "Ward C – South", status: "online", balance: null, consumers: 1105 },
  { id: "W4", name: "Ward D – East", status: "outage", schedTime: "Unscheduled", reason: "Transformer fault", consumers: 670 },
];

const RECHARGE_HIST = [
  { id: 1, date: "2026-03-28", amount: 500, type: "Online", ref: "TXN8821" },
  { id: 2, date: "2026-03-15", amount: 300, type: "UPI", ref: "TXN7704" },
  { id: 3, date: "2026-02-28", amount: 1000, type: "Counter", ref: "TXN6612" },
  { id: 4, date: "2026-02-10", amount: 500, type: "Online", ref: "TXN5501" },
];

const DEPT_MAP = { Infrastructure: "PWD", Sanitation: "Waste Mgmt.", Utilities: "Water Board", Electrical: "Electricity Board", "Public Safety": "Traffic Police", Transport: "Transport Dept.", Environment: "BBMP Green Cell" };
const CAT_ICONS = { Infrastructure: "🏗️", Sanitation: "♻️", Utilities: "💧", Electrical: "⚡", "Public Safety": "🚔", Transport: "🚌", Environment: "🌳" };
const CATS = ["Infrastructure", "Sanitation", "Utilities", "Electrical", "Public Safety", "Transport", "Environment"];

/* ─── ROOT APP ─────────────────────────────────────────────── */
const getUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    sector: params.get("sector") || "home",
    gPage: params.get("gPage") || "citizen",
    gTab: params.get("gTab") || "map",
    tPage: params.get("tPage") || "map",
    ePage: params.get("ePage") || "dashboard",
  };
};

export default function App() {
  const [auth, setAuth] = useState(() => { const s = localStorage.getItem("auth"); return s ? JSON.parse(s) : { loggedIn: false, role: "citizen", name: "", dept: "", id: null }; });
  useEffect(() => { localStorage.setItem("auth", JSON.stringify(auth)); }, [auth]);
  const [showAuth, setShowAuth] = useState(false);
  const [authRole, setAuthRole] = useState("citizen");
  const [sector, setSector] = useState(() => getUrlState().sector);
  const [gPage, setGPage] = useState(() => getUrlState().gPage);
  const [gTab, setGTab] = useState(() => getUrlState().gTab);
  const [tPage, setTPage] = useState(() => getUrlState().tPage);
  const [ePage, setEPage] = useState(() => getUrlState().ePage);
  const [complaints, setComplaints] = useState(() => { const s = localStorage.getItem("complaints"); return s ? JSON.parse(s) : COMPLAINTS; });
  useEffect(() => { localStorage.setItem("complaints", JSON.stringify(complaints)); }, [complaints]);
  const [buses, setBuses] = useState(BUSES_INIT.map(b => ({ ...b })));
  const [selBus, setSelBus] = useState(null);
  const [selStop, setSelStop] = useState(null);
  const [balance, setBalance] = useState(1248.50);
  const [rechargeAmt, setRechargeAmt] = useState("");
  const [recharges, setRecharges] = useState(RECHARGE_HIST);
  const [zones] = useState(ELEC_ZONES);
  const [filterCat, setFilterCat] = useState("All");
  const [adminFilter, setAdminFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({ title: "", cat: "Infrastructure", desc: "", photo: false, gps: false, lat: 12.9716, lng: 77.5946 });
  const [toast, setToast] = useState(null);
  const [points, setPoints] = useState(1240);
  const [selComp, setSelComp] = useState(null);
  const timerRef = useRef(null);

  // Sync state to URL history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentUrlParams = params.toString();
    
    params.set("sector", sector);
    params.set("gPage", gPage);
    params.set("gTab", gTab);
    params.set("tPage", tPage);
    params.set("ePage", ePage);
    
    const newUrlParams = params.toString();
    
    if (currentUrlParams !== newUrlParams) {
      const newUrl = `${window.location.pathname}?${newUrlParams}`;
      if (!window.location.search) {
        window.history.replaceState({}, "", newUrl);
      } else {
        window.history.pushState({}, "", newUrl);
      }
    }
  }, [sector, gPage, gTab, tPage, ePage]);

  // Handle back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const s = getUrlState();
      setSector(s.sector);
      setGPage(s.gPage);
      setGTab(s.gTab);
      setTPage(s.tPage);
      setEPage(s.ePage);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /* Animate buses */
  useEffect(() => {
    if (sector !== "transport" || tPage !== "map") return;
    timerRef.current = setInterval(() => {
      setBuses(prev => prev.map(b => ({
        ...b,
        lat: b.lat + (Math.random() - 0.49) * 0.0008,
        lng: b.lng + (Math.random() - 0.49) * 0.0009,
        next: Math.max(1, (parseInt(b.next) || 5) + (Math.random() > 0.5 ? 1 : -1)) + " min"
      })));
    }, 1800);
    return () => clearInterval(timerRef.current);
  }, [sector, tPage]);

  const toast_show = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const upvote = (id) => { setComplaints(p => p.map(c => c.id === id ? { ...c, upvotes: c.upvotes + 1, priority: Math.min(99, c.priority + 2) } : c)); setPoints(p => p + 5); toast_show("+5 civic points!"); };
  const assignDept = (id, dept) => { setComplaints(p => p.map(c => c.id === id ? { ...c, dept, status: c.status === "Open" ? "In Progress" : c.status } : c)); toast_show("Department assigned.", "info"); };
  const changeStatus = (id, st) => { setComplaints(p => p.map(c => c.id === id ? { ...c, status: st } : c)); toast_show("Status updated.", "info"); };
  const submitComplaint = () => {
    const n = { id: complaints.length + 1, title: formData.title || "Unnamed issue", cat: formData.cat, status: "Open", upvotes: 0, priority: Math.floor(Math.random() * 40) + 30, dept: "", lat: formData.lat, lng: formData.lng, reporter: auth.name || "You", date: new Date().toISOString().slice(0, 10), desc: formData.desc || "No description." };
    setComplaints(p => [n, ...p]); setPoints(p => p + 50); setShowForm(false); setFormStep(1);
    setFormData({ title: "", cat: "Infrastructure", desc: "", photo: false, gps: false, lat: 12.9716, lng: 77.5946 }); toast_show("Report submitted! +50 pts");
  };
  const submitTransportFeedback = (tForm) => {
    const n = { id: complaints.length + 1, title: tForm.issue + " (Route: " + tForm.route + ")", cat: "Transport", status: "Open", upvotes: 0, priority: Math.floor(Math.random() * 30) + 20, dept: "Transport Dept.", lat: 12.97, lng: 77.60, reporter: auth.name || "Citizen", date: new Date().toISOString().slice(0, 10), desc: tForm.desc || "No description provided." };
    setComplaints(p => [n, ...p]); setPoints(p => p + 10);
  };
  const submitBillingComplaint = (bForm) => {
    const n = { id: complaints.length + 1, title: bForm.type + " (ID: " + bForm.consumerId + ")", cat: "Electrical", status: "Open", upvotes: 0, priority: Math.floor(Math.random() * 40) + 40, dept: "Electricity Board", lat: 12.97, lng: 77.60, reporter: auth.name || "Citizen", date: new Date().toISOString().slice(0, 10), desc: bForm.desc || "No description provided." };
    setComplaints(p => [n, ...p]); setPoints(p => p + 20);
  };
  const doRecharge = () => {
    const amt = parseFloat(rechargeAmt);
    if (isNaN(amt) || amt < 10) { toast_show("Enter a valid amount (min ₹10).", "err"); return; }
    setBalance(b => +(b + amt).toFixed(2));
    setRecharges(p => [{ id: p.length + 1, date: new Date().toISOString().slice(0, 10), amount: amt, type: "Online", ref: "TXN" + Math.floor(Math.random() * 9000 + 1000) }, ...p]);
    setRechargeAmt(""); toast_show(`₹${amt} recharged successfully!`);
  };
  const doLogin = (name, role, dept) => {
    setAuth({ loggedIn: true, role, name, dept, id: Math.floor(Math.random() * 9000 + 1000) });
    setShowAuth(false);
    toast_show(`Welcome, ${name}!`);
    if (role === "department") { setSector("grievance"); setGPage("department"); }
    else if (role === "admin") { setSector("grievance"); setGPage("admin"); }
    else { setSector("citizen"); }
  };
  const doLogout = () => { setAuth({ loggedIn: false, role: "citizen", name: "", dept: "", id: null }); setSector("home"); toast_show("Logged out.", "info"); };

  const filtered = filterCat === "All" ? complaints : complaints.filter(c => c.cat === filterCat);
  const adminFilt = adminFilter === "All" ? complaints : complaints.filter(c => c.status === adminFilter);
  const stats = { total: complaints.length, open: complaints.filter(c => c.status === "Open").length, inProg: complaints.filter(c => c.status === "In Progress").length, resolved: complaints.filter(c => c.status === "Resolved").length };

  const navHome = () => { setSector("home"); setSelBus(null); setSelStop(null); };

  /* shared style helpers */
  const bG = (extra = {}) => ({ padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", background: GOLD, color: N2, border: "none", borderRadius: 6, fontFamily: "inherit", ...extra });
  const bO = (extra = {}) => ({ padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: "transparent", color: N1, border: "1.5px solid " + N1, borderRadius: 6, fontFamily: "inherit", ...extra });

  return (
    <div style={{ minHeight: "100vh", background: OFF, fontFamily: "'Inter', sans-serif", color: N2 }}>
      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 3000, background: toast.type === "ok" ? "#edf7ed" : toast.type === "err" ? "#fff0f0" : "#e8f1fa", color: toast.type === "ok" ? "#1a6b2a" : toast.type === "err" ? "#8b1a1a" : N1, padding: "11px 20px", borderRadius: 6, border: "1px solid " + (toast.type === "ok" ? "#a8d8a8" : toast.type === "err" ? "#f5c2c2" : "#9bbcda"), fontSize: 14, maxWidth: 320, boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>{toast.msg}</div>}

      {/* ══ NAVBAR ══ */}
      <nav className="glass-panel-dark" style={{ background: "rgba(15, 23, 42, 0.9)", borderBottom: "2px solid " + GOLD, minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, zIndex: 1000 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div onClick={navHome} style={{ width: 42, height: 42, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={N2} strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <div>
            <div style={{ color: WHITE, fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", lineHeight: 1.3, fontFamily: "'Outfit', sans-serif" }}>SMART CITY HUB</div>
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif" }}>{sector === "home" ? "OFFICIAL PORTAL" : sector === "citizen" ? "CITIZEN HUB" : sector === "grievance" ? "GRIEVANCE MODULE" : sector === "transport" ? "TRANSPORT MODULE" : "ELECTRICITY MODULE"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          {sector === "home" && [
            ["home", "🏠 Home", () => setSector("home")],
            ["guide", "📖 How to Use", () => { setSector("grievance"); setGPage("guide"); }],
            ["citizen", "👤 Citizen", () => {
              if (auth.loggedIn && auth.role === "citizen") { setSector("citizen"); }
              else { setAuthRole("citizen"); setShowAuth(true); }
            }],
            ["department", "🏢 Dept", () => {
              if (auth.loggedIn && auth.role === "department") { setSector("grievance"); setGPage("department"); }
              else { setAuthRole("department"); setShowAuth(true); }
            }],
            ["admin", "🔐 Admin", () => {
              if (auth.loggedIn && auth.role === "admin") { setSector("grievance"); setGPage("admin"); }
              else { setAuthRole("admin"); setShowAuth(true); }
            }]
          ].map(([k, l, fn]) => <NavBtn key={k} label={l} active={showAuth ? k === authRole : k === "home"} onClick={fn} />)}
          {sector === "citizen" && [
            ["home", "🏠 Home", () => navHome()],
            ["citizen", "👤 Citizen Hub", () => { }],
          ].map(([k, l, fn]) => <NavBtn key={k} label={l} active={k === "citizen"} onClick={fn} />)}
          {sector === "grievance" && [
            ["home", "🏠 Home", () => navHome()],
            gPage === "guide" && ["guide", "📖 How to Use", () => { setSector("grievance"); setGPage("guide"); }],
            (!auth.loggedIn || auth.role === "citizen") && ["hub", "👤 Citizen Hub", () => {
              if (auth.loggedIn && auth.role === "citizen") { setSector("citizen"); }
              else { setAuthRole("citizen"); setShowAuth(true); }
            }],
            (!auth.loggedIn || auth.role === "citizen") && gPage !== "guide" && ["citizen", "📋 Grievances", () => {
              if (auth.loggedIn && auth.role === "citizen") { setSector("grievance"); setGPage("citizen"); }
              else { setAuthRole("citizen"); setShowAuth(true); }
            }],
            (!auth.loggedIn || auth.role === "department") && ["department", "🏢 Dept", () => {
              if (auth.loggedIn && auth.role === "department") { setSector("grievance"); setGPage("department"); }
              else { setAuthRole("department"); setShowAuth(true); }
            }],
            (!auth.loggedIn || auth.role === "admin") && ["admin", "🔐 Admin", () => {
              if (auth.loggedIn && auth.role === "admin") { setSector("grievance"); setGPage("admin"); }
              else { setAuthRole("admin"); setShowAuth(true); }
            }],
          ].filter(Boolean).map(([k, l, fn]) => {
            const isActive = gPage === k || (showAuth && (authRole === "citizen" ? k === "hub" : authRole === k));
            return <NavBtn key={k} label={l} active={isActive} onClick={fn} />
          })}
          {sector === "transport" && [
            ["home", "🏠 Home", () => navHome()],
            (!auth.loggedIn || auth.role === "citizen") && ["hub", "👤 Citizen Hub", () => setSector("citizen")],
            ["map", "🚌 Live Bus Tracking", () => setTPage("map")],
            ["complaints", "📝 Transport Feedback", () => setTPage("complaints")],
          ].filter(Boolean).map(([k, l, fn]) => <NavBtn key={k} label={l} active={tPage === k} onClick={fn} />)}
          {sector === "electricity" && [
            ["home", "🏠 Home", () => navHome()],
            (!auth.loggedIn || auth.role === "citizen") && ["hub", "👤 Citizen Hub", () => setSector("citizen")],
            ["dashboard", "💡 My Prepaid Meter", () => setEPage("dashboard")],
            ["grid", "🗺️ Grid Health Map", () => setEPage("grid")],
            ["billing", "📋 Billing Complaints", () => setEPage("billing")],
          ].filter(Boolean).map(([k, l, fn]) => <NavBtn key={k} label={l} active={ePage === k} onClick={fn} />)}
          <div style={{ marginLeft: 8, display: "flex", gap: 6, alignItems: "center" }}>
            {auth.loggedIn
              ? <><div style={{ padding: "6px 12px", background: "rgba(200,168,75,0.15)", border: "1px solid " + GOLD + "55", borderRadius: 4, color: GOLD, fontSize: 12, fontFamily: "sans-serif" }}>{auth.name} · {auth.role === "official" ? "Official" : "Citizen"}</div><button onClick={doLogout} style={{ ...bO({ padding: "6px 12px", fontSize: 12, color: GOLD, border: "1px solid " + GOLD + "55", background: "transparent" }) }}>Logout</button></>
              : ((sector !== "home" && !(sector === "grievance" && gPage === "guide")) ? <button onClick={() => { setAuthRole("citizen"); setShowAuth(true); }} style={{ ...bG({ padding: "7px 16px", fontSize: 13 }) }}>Login / Sign Up</button> : null)
            }
          </div>
        </div>
      </nav>

      {/* ══ PAGES ══ */}
      {sector === "home" && <HomePage stats={stats} setShowAuth={() => { setAuthRole("citizen"); setShowAuth(true); }} auth={auth} setSector={setSector} setGPage={setGPage} />}
      {sector === "citizen" && <CitizenHub setSector={setSector} setTPage={setTPage} setEPage={setEPage} setGPage={setGPage} stats={stats} />}
      {sector === "grievance" && <GrievanceModule gPage={gPage} setGPage={setGPage} gTab={gTab} setGTab={setGTab} filtered={filtered} filterCat={filterCat} setFilterCat={setFilterCat} complaints={complaints} adminFilt={adminFilt} adminFilter={adminFilter} setAdminFilter={setAdminFilter} stats={stats} upvote={upvote} assignDept={assignDept} changeStatus={changeStatus} setShowForm={setShowForm} selComp={selComp} setSelComp={setSelComp} points={points} auth={auth} />}
      {sector === "transport" && <TransportModule tPage={tPage} setTPage={setTPage} buses={buses} selBus={selBus} setSelBus={setSelBus} selStop={selStop} setSelStop={setSelStop} toast_show={toast_show} auth={auth} submitTransportFeedback={submitTransportFeedback} />}
      {sector === "electricity" && <ElectricityModule ePage={ePage} setEPage={setEPage} balance={balance} recharges={recharges} rechargeAmt={rechargeAmt} setRechargeAmt={setRechargeAmt} doRecharge={doRecharge} zones={zones} toast_show={toast_show} auth={auth} submitBillingComplaint={submitBillingComplaint} />}

      {showForm && <ComplaintForm formStep={formStep} setFormStep={setFormStep} formData={formData} setFormData={setFormData} submitComplaint={submitComplaint} onClose={() => { setShowForm(false); setFormStep(1); }} />}
      {showAuth && <AuthModal onLogin={doLogin} onClose={() => setShowAuth(false)} initialRole={authRole} />}
    </div>
  );
}

function NavBtn({ label, active, onClick }) {
  return <button className={active ? "" : "hover-lift"} onClick={onClick} style={{ padding: "8px 16px", border: "none", background: active ? GOLD : "transparent", color: active ? "#fff" : "#94A3B8", fontSize: 14, fontWeight: active ? 600 : 500, cursor: "pointer", borderRadius: 6, fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", transition: "all 0.2s" }}>{label}</button>;
}

/* ─── HOME PAGE ────────────────────────────────────────────── */
function HomePage({ stats, setShowAuth, auth, setSector, setGPage }) {
  return (
    <div className="animate-fade-in" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ padding: "140px 24px 150px", textAlign: "center", background: "rgba(15, 23, 42, 0.4)", borderBottom: "4px solid " + GOLD }}>
        <div className="glass-panel animate-fade-in-up" style={{ display: "inline-flex", alignItems: "center", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: 20, padding: "6px 20px", marginBottom: 24, fontFamily: "'Inter', sans-serif" }}>
          <span style={{ color: GOLD, fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>GOVERNMENT INITIATIVE — SMART CITIES MISSION 2026</span>
        </div>
        <h1 className="animate-fade-in-up delay-100" style={{ color: WHITE, fontSize: 56, fontWeight: 700, fontFamily: "'Outfit', sans-serif", margin: "0 auto 16px", maxWidth: 780, lineHeight: 1.15, letterSpacing: "-0.03em", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>Smart City Management Hub</h1>
        <p className="animate-fade-in-up delay-200" style={{ color: "#F8FAFC", fontSize: 19, fontWeight: 400, margin: "0 auto 40px", maxWidth: 640, lineHeight: 1.6, fontFamily: "'Inter', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>A unified, GIS-enabled platform for citizen services — grievance redressal, public transport tracking, and electricity management.</p>
        {!auth.loggedIn ? (
          <button className="btn-primary hover-lift animate-fade-in-up delay-300" onClick={() => setShowAuth(true)} style={{ padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", border: "none", borderRadius: 8, fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}>Get Started — Login / Register</button>
        ) : (
          <button className="btn-primary hover-lift animate-fade-in-up delay-300" onClick={() => {
            if (auth.role === "citizen") setSector("citizen");
            else if (auth.role === "department") { setSector("grievance"); setGPage("department"); }
            else if (auth.role === "admin") { setSector("grievance"); setGPage("admin"); }
          }} style={{ padding: "16px 40px", fontSize: 16, fontWeight: 600, cursor: "pointer", border: "none", borderRadius: 8, fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 15px rgba(0,0,0,0.4)" }}>Go to Dashboard</button>
        )}
      </div>

      {/* Stat bar */}
      <div style={{ background: "rgba(15, 23, 42, 0.65)", position: "relative", backdropFilter: "blur(4px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "16px 0" }}>
          {[{ v: stats.total, l: "Total Complaints", i: "📊" }, { v: stats.resolved, l: "Issues Resolved", i: "✅" }, { v: 5, l: "Active Buses", i: "🚌" }, { v: "4.2d", l: "Avg. Resolution", i: "⏱️" }].map((s, i) => (
            <div key={i} className={`hover-lift-card animate-fade-in-up delay-${(i + 2) * 100}`} style={{ padding: "24px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none", borderRadius: 12, margin: "0 8px" }}>
              <div style={{ fontSize: 28, marginBottom: 8, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>{s.i}</div>
              <div className="gradient-text-gold" style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Outfit', sans-serif", lineHeight: 1.1 }}>{s.v}</div>
              <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500, marginTop: 8, letterSpacing: "0.05em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in delay-500" style={{ background: "rgba(15, 23, 42, 0.75)", padding: "20px 24px", textAlign: "center", marginTop: "auto", backdropFilter: "blur(4px)" }}>
        <div style={{ color: "#94A3B8", fontSize: 12, fontFamily: "sans-serif" }}>Smart City Management Hub · Official Government Platform · Full-Stack: React + Spring Boot + MySQL · CSBS Project 2026</div>
      </div>
    </div>
  );
}

/* ─── CITIZEN HUB ──────────────────────────────────────────── */
function CitizenHub({ setSector, setTPage, setEPage, setGPage, stats }) {
  const cards = [
    { key: "grievance", icon: "📋", title: "Grievance Redressal", color: "linear-gradient(135deg, #4F46E5, #3B82F6)", desc: "Report potholes, sanitation issues, utility failures, and infrastructure problems. Track status and upvote community complaints.", stats: [{ l: "Active Complaints", v: stats.open + stats.inProg }, { l: "Resolved", v: stats.resolved }], btn: "Open Grievance Portal", fn: () => { setSector("grievance"); setGPage("citizen"); } },
    { key: "transport", icon: "🚌", title: "Public Transport", color: "linear-gradient(135deg, #10B981, #059669)", desc: "Track live bus locations on the GIS map, view next arrival times, check route schedules, and submit transport feedback.", stats: [{ l: "Buses Active", v: 5 }, { l: "Routes", v: 18 }], btn: "Track Live Buses", fn: () => { setSector("transport"); setTPage("map"); } },
    { key: "electricity", icon: "⚡", title: "Electricity Services", color: "linear-gradient(135deg, #F59E0B, #D97706)", desc: "Manage your prepaid meter balance, view grid health across wards, recharge your account, and raise billing complaints.", stats: [{ l: "Zones Online", v: 2 }, { l: "Alerts", v: 2 }], btn: "Open My Meter", fn: () => { setSector("electricity"); setEPage("dashboard"); } },
  ];
  return (
    <div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: N1, fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", marginBottom: 12 }}>CITIZEN DASHBOARD</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: N2, margin: "0 0 16px" }}>Choose a Service to Continue</h2>
          <div style={{ width: 64, height: 4, background: GOLD, margin: "0 auto", borderRadius: 2 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 32 }}>
          {cards.map((c, i) => (
            <div key={c.key} className={`hover-lift-card animate-fade-in-up delay-${(i + 1) * 100} glass-panel`} style={{ borderRadius: 16, overflow: "hidden", background: WHITE }}>
              <div style={{ background: c.color, padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 54, marginBottom: 16, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }}>{c.icon}</div>
                <div style={{ color: WHITE, fontSize: 22, fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.01em" }}>{c.title}</div>
              </div>
              <div style={{ padding: "28px 24px" }}>
                <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, marginBottom: 24 }}>{c.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                  {c.stats.map(s => <div key={s.l} style={{ background: OFF, borderRadius: 8, padding: "12px 14px", border: "1px solid " + BORDER, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 600, color: N1, fontFamily: "'Outfit', sans-serif" }}>{s.v}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: SLATE2, marginTop: 4 }}>{s.l}</div>
                  </div>)}
                </div>
                <button className="btn-primary" onClick={c.fn} style={{ width: "100%", padding: "16px", fontSize: 16, fontWeight: 600, cursor: "pointer", border: "none", borderRadius: 8, fontFamily: "'Inter', sans-serif" }}>
                  {c.btn} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── AUTH MODAL ───────────────────────────────────────────── */
function AuthModal({ onLogin, onClose, initialRole = "citizen" }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState(initialRole);
  const [deptName, setDeptName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const doSubmit = async () => {
    if (tab === "signup" && !name.trim()) { setErr("Please enter your name."); return; }
    if (role === "department" && !deptName) { setErr("Please select your department."); return; }
    if (!email.trim()) { setErr("Please enter your email."); return; }
    if (!email.includes("@")) { setErr("Please enter a valid email address containing '@'."); return; }
    if (!pass.trim()) { setErr("Please enter a password."); return; }

    try {
      if (tab === "signup") {
        const res = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: name.trim(), email: email.trim(), password: pass.trim(), role: role.toUpperCase(), departmentName: deptName })
        });
        if (!res.ok) {
          const msg = await res.text();
          setErr(msg || "Registration failed");
          return;
        }
        const data = await res.json();
        onLogin(data.name || name.trim(), data.role.toLowerCase(), deptName);
      } else {
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password: pass.trim() })
        });
        if (!res.ok) {
          setErr("Invalid credentials");
          return;
        }
        const data = await res.json();
        onLogin(data.name, data.role.toLowerCase(), deptName);
      }
    } catch (error) {
      setErr("Failed to connect to server");
    }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,24,50,0.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 10, width: "100%", maxWidth: 460, overflow: "hidden", border: "2px solid " + GOLD }}>
        <div style={{ background: N2, padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid " + GOLD }}>
          <div style={{ color: WHITE, fontSize: 17 }}>{role === "citizen" ? "Citizen" : role === "department" ? "Department" : "Admin"} Portal — Access</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 24, lineHeight: 1 }}>×</button>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", background: OFF, borderBottom: "1px solid " + BORDER }}>
          {["login", "signup"].map(t => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px", border: "none", background: tab === t ? WHITE : "transparent", color: tab === t ? N1 : SLATE2, fontSize: 14, cursor: "pointer", borderBottom: tab === t ? "3px solid " + N1 : "3px solid transparent", fontFamily: "inherit", fontWeight: tab === t ? 500 : 400 }}>{t === "login" ? "Sign In" : "Create Account"}</button>)}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }} style={{ padding: "26px 24px" }}>
          {role === "department" && <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N1, display: "block", marginBottom: 6 }}>Department</label><select value={deptName} onChange={e => setDeptName(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, fontFamily: "inherit" }}><option value="">-- Choose Department --</option>{[...Object.values(DEPT_MAP), "Animal Control"].map(d => <option key={d} value={d}>{d}</option>)}</select></div>}
          {tab === "signup" && <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N1, display: "block", marginBottom: 6 }}>Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Arjun Kumar" style={{ width: "100%", padding: "12px 14px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, boxSizing: "border-box", fontFamily: "inherit" }} /></div>}
          <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N1, display: "block", marginBottom: 6 }}>Email Address</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" style={{ width: "100%", padding: "12px 14px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
          <div style={{ marginBottom: 20 }}><label style={{ fontSize: 14, color: N1, display: "block", marginBottom: 6 }}>Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
          {err && <div style={{ marginBottom: 14, padding: "10px 14px", background: "#fff0f0", borderRadius: 5, border: "1px solid #f5c2c2", fontSize: 13, color: "#8b1a1a", fontFamily: "sans-serif" }}>{err}</div>}
          <button type="submit" style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 500, cursor: "pointer", background: N1, color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>{tab === "login" ? "Sign In →" : "Create Account →"}</button>
        </form>
      </div>
    </div>
  );
}

/* ─── GRIEVANCE MODULE ─────────────────────────────────────── */
function GrievanceModule({ gPage, gTab, setGTab, filtered, filterCat, setFilterCat, complaints, adminFilt, adminFilter, setAdminFilter, stats, upvote, assignDept, changeStatus, setShowForm, selComp, setSelComp, points, auth }) {
  const mapW = 680, mapH = 340, minLat = 12.94, maxLat = 12.99, minLng = 77.56, maxLng = 77.64;
  const toX = lng => ((lng - minLng) / (maxLng - minLng)) * (mapW - 40) + 20;
  const toY = lat => ((maxLat - lat) / (maxLat - minLat)) * (mapH - 40) + 20;
  const dotCol = { Infrastructure: "#1e6bb8", Sanitation: "#1a6b2a", Utilities: "#7a4f00", Electrical: "#7a4f00", "Public Safety": "#6b1a1a", Transport: "#534ab7", Environment: "#1a6b2a" };

  return (
    <div>
      {gPage === "guide" && <GuidePanel />}
      {(gPage === "citizen") && (
        <div>
          <div style={{ background: N1, padding: "20px 24px 0", borderBottom: "3px solid " + GOLD }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div><h2 style={{ color: WHITE, fontWeight: 400, fontSize: 20, margin: "0 0 3px" }}>Citizen Dashboard</h2><div style={{ color: "#a8c4dc", fontSize: 13, fontFamily: "sans-serif" }}>Track, upvote, and file civic complaints</div></div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ padding: "6px 12px", background: "rgba(200,168,75,0.2)", borderRadius: 4, color: GOLD, fontSize: 12, fontFamily: "sans-serif" }}>★ {points.toLocaleString()} pts</div>
                  <button onClick={() => setShowForm(true)} style={{ padding: "10px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: GOLD, color: N2, border: "none", borderRadius: 6, fontFamily: "inherit" }}>+ File Report</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[{ k: "map", l: "🗺️ Live Map" }, { k: "list", l: "📋 All Reports" }, { k: "profile", l: "👤 My Profile" }, { k: "analytics", l: "📊 Analytics" }].map(t => (
                  <button key={t.k} onClick={() => setGTab(t.k)} style={{ padding: "9px 18px", border: "none", background: gTab === t.k ? OFF : "transparent", color: gTab === t.k ? N2 : "#a8c4dc", fontWeight: gTab === t.k ? 500 : 400, fontSize: 13, cursor: "pointer", borderRadius: "5px 5px 0 0", fontFamily: "inherit" }}>{t.l}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
              {[{ l: "Total", v: stats.total, a: N1 }, { l: "Open", v: stats.open, a: "#8b1a1a" }, { l: "In Progress", v: stats.inProg, a: "#7a4f00" }, { l: "Resolved", v: stats.resolved, a: "#1a6b2a" }].map(s => (
                <div key={s.l} style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, borderTop: "3px solid " + s.a, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif", marginBottom: 4, letterSpacing: "0.04em" }}>{s.l}</div>
                  <div style={{ fontSize: 26, color: s.a }}>{s.v}</div>
                </div>
              ))}
            </div>

            {gTab === "map" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 270px", gap: 14 }}>
                <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid " + BORDER, display: "flex", gap: 5, flexWrap: "wrap", background: OFF }}>
                    {["All", ...CATS].map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid " + (filterCat === c ? N1 : BORDER), background: filterCat === c ? N1 : WHITE, color: filterCat === c ? WHITE : SLATE, fontSize: 11, cursor: "pointer", fontFamily: "sans-serif" }}>{CAT_ICONS[c] || ""} {c}</button>)}
                  </div>
                  <div style={{ background: "#dde8f0", height: mapH, width: "100%", position: "relative", zIndex: 0 }}>
                    <MapContainer center={[12.965, 77.600]} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={true}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      />
                      {filtered.map(c => {
                        const col = dotCol[c.cat] || N1;
                        const sel = selComp?.id === c.id;
                        const icon = L.divIcon({
                          className: '',
                          html: `<div style="display:flex;align-items:center;justify-content:center;width:${sel ? 36 : 28}px;height:${sel ? 36 : 28}px;background-color:${col};border:${sel ? '3px solid gold' : '2px solid white'};border-radius:50%;color:white;font-size:11px;font-weight:600;box-shadow:0 2px 5px rgba(0,0,0,0.3);transition:all 0.2s;">${c.upvotes}</div>`,
                          iconSize: [sel ? 36 : 28, sel ? 36 : 28],
                          iconAnchor: [sel ? 18 : 14, sel ? 18 : 14]
                        });
                        return (
                          <Marker
                            key={c.id}
                            position={[c.lat, c.lng]}
                            icon={icon}
                            eventHandlers={{ click: () => setSelComp(sel ? null : c) }}
                          />
                        );
                      })}
                    </MapContainer>
                    <div style={{ padding: "6px 12px", background: WHITE, borderTop: "1px solid " + BORDER, display: "flex", gap: 12, flexWrap: "wrap", position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
                      {Object.entries(dotCol).slice(0, 4).map(([k, v]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SLATE, fontFamily: "sans-serif" }}><div style={{ width: 9, height: 9, borderRadius: "50%", background: v }} />{CAT_ICONS[k]} {k}</div>)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selComp ? <CompCard c={selComp} upvote={upvote} /> : (
                    <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: 14 }}>
                      <div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif", fontWeight: 500, marginBottom: 12, letterSpacing: "0.06em" }}>HIGH PRIORITY</div>
                      {filtered.filter(c => c.priority > 70 && c.status !== "Resolved").slice(0, 4).map(c => (
                        <div key={c.id} onClick={() => setSelComp(c)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + BORDER, cursor: "pointer" }}>
                          <div><div style={{ fontSize: 13, color: N2, marginBottom: 2 }}>{c.title}</div><div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif" }}>{CAT_ICONS[c.cat]} {c.cat}</div></div>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.priority > 85 ? "#fff0f0" : "#fff8e6", border: "2px solid " + (c.priority > 85 ? "#8b1a1a" : "#7a4f00"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, color: c.priority > 85 ? "#8b1a1a" : "#7a4f00", fontFamily: "sans-serif", flexShrink: 0 }}>{c.priority}</div>
                        </div>
                      ))}
                      <div style={{ marginTop: 12, fontSize: 13, color: SLATE, fontFamily: "sans-serif", textAlign: "center" }}>Click a map pin to view details</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {gTab === "list" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {["All", ...CATS].map(c => <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "7px 14px", borderRadius: 4, border: "1px solid " + (filterCat === c ? N1 : BORDER), background: filterCat === c ? N1 : WHITE, color: filterCat === c ? WHITE : SLATE, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>{CAT_ICONS[c] || ""} {c}</button>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
                  {filtered.map(c => <CompCard key={c.id} c={c} upvote={upvote} />)}
                </div>
              </div>
            )}

            {gTab === "profile" && <ProfilePanel points={points} auth={auth} />}
            {gTab === "analytics" && <AnalyticsPanel complaints={complaints} />}
          </div>
        </div>
      )}

      {gPage === "admin" && (
        <div>
          <div style={{ background: N1, padding: "20px 24px 18px", borderBottom: "3px solid " + GOLD }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2 style={{ color: WHITE, fontWeight: 400, fontSize: 20, margin: "0 0 3px" }}>Administration Control Centre</h2>
              <div style={{ color: "#a8c4dc", fontSize: 13, fontFamily: "sans-serif" }}>Manage complaints, assign departments, update field status</div>
            </div>
          </div>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginBottom: 18 }}>
              {[{ l: "Total", v: stats.total, a: N1 }, { l: "Open", v: stats.open, a: "#8b1a1a" }, { l: "In Progress", v: stats.inProg, a: "#7a4f00" }, { l: "Resolved", v: stats.resolved, a: "#1a6b2a" }].map(s => (
                <div key={s.l} style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, borderTop: "3px solid " + s.a, padding: "12px 14px" }}><div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif", marginBottom: 4 }}>{s.l}</div><div style={{ fontSize: 26, color: s.a }}>{s.v}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: SLATE, fontFamily: "sans-serif" }}>Filter:</span>
              {["All", "Open", "In Progress", "Resolved"].map(s => <button key={s} onClick={() => setAdminFilter(s)} style={{ padding: "7px 16px", borderRadius: 4, border: "1.5px solid " + (adminFilter === s ? N1 : BORDER), background: adminFilter === s ? N1 : WHITE, color: adminFilter === s ? WHITE : SLATE, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>{s}</button>)}
            </div>
            <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "sans-serif" }}>
                  <thead><tr style={{ background: N2 }}>
                    {["ID", "Complaint", "Category", "Reporter", "Priority", "Status", "Department", "Action"].map(h => <th key={h} style={{ padding: "11px 12px", textAlign: "left", color: "#a8c4dc", borderBottom: "2px solid " + GOLD, fontSize: 11, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>)}
                  </tr></thead>
                  <tbody>{adminFilt.map((c, i) => {
                    const sc = SC[c.status] || {}; return (
                      <tr key={c.id} style={{ borderBottom: "1px solid " + BORDER, background: i % 2 === 0 ? WHITE : OFF }}>
                        <td style={{ padding: "10px 12px", color: SLATE2 }}>#{c.id}</td>
                        <td style={{ padding: "10px 12px", maxWidth: 180 }}><div style={{ color: N2 }}>{c.title}</div><div style={{ fontSize: 11, color: SLATE2 }}>{c.date}</div></td>
                        <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, background: "#e8f1fa", color: N1, padding: "2px 7px", borderRadius: 3, border: "1px solid #9bbcda", whiteSpace: "nowrap" }}>{CAT_ICONS[c.cat]} {c.cat}</span></td>
                        <td style={{ padding: "10px 12px", color: SLATE, fontSize: 12 }}>{c.reporter}</td>
                        <td style={{ padding: "10px 12px" }}><div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 36, height: 7, background: OFF, borderRadius: 3, overflow: "hidden", border: "1px solid " + BORDER }}><div style={{ height: "100%", width: c.priority + "%", background: c.priority > 70 ? "#8b1a1a" : c.priority > 40 ? "#7a4f00" : "#1a6b2a", borderRadius: 3 }} /></div><span style={{ fontSize: 11, fontWeight: 500, color: N2 }}>{c.priority}</span></div></td>
                        <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, background: sc.bg, color: sc.text, border: "1px solid " + (sc.bd || BORDER), padding: "2px 7px", borderRadius: 3, whiteSpace: "nowrap" }}>{c.status}</span></td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: c.dept ? "#1a6b2a" : SLATE2 }}>{c.dept || <span style={{ fontStyle: "italic" }}>Unassigned</span>}</td>
                        <td style={{ padding: "10px 12px" }}>{c.dept ? <span style={{ fontSize: 11, padding: "5px 10px", borderRadius: 4, border: "1px solid #a8d8a8", background: "#edf7ed", color: "#1a6b2a", whiteSpace: "nowrap" }}>Assigned ✓</span> : <button onClick={() => assignDept(c.id, DEPT_MAP[c.cat] || "General")} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 4, border: "1.5px solid " + N1, background: "#e8f1fa", color: N1, cursor: "pointer", whiteSpace: "nowrap" }}>Assign ↗</button>}</td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "10px 12px", borderTop: "1px solid " + BORDER, fontSize: 12, color: SLATE2, background: OFF }}>Showing {adminFilt.length} of {complaints.length} complaints</div>
            </div>
          </div>
        </div>
      )}

      {gPage === "department" && (
        <div>
          <div style={{ background: N1, padding: "20px 24px 18px", borderBottom: "3px solid " + GOLD }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2 style={{ color: WHITE, fontWeight: 400, fontSize: 20, margin: "0 0 3px" }}>Department Portal</h2>
              <div style={{ color: "#a8c4dc", fontSize: 13, fontFamily: "sans-serif" }}>Update status for assigned complaints</div>
            </div>
          </div>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
            <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "sans-serif" }}>
                  <thead><tr style={{ background: N2 }}>
                    {["ID", "Complaint", "Category", "Reporter", "Priority", "Status"].map(h => <th key={h} style={{ padding: "11px 12px", textAlign: "left", color: "#a8c4dc", borderBottom: "2px solid " + GOLD, fontSize: 11, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>)}
                  </tr></thead>
                  <tbody>{complaints.filter(c => c.dept === auth.dept).map((c, i) => {
                    const sc = SC[c.status] || {}; return (
                      <tr key={c.id} style={{ borderBottom: "1px solid " + BORDER, background: i % 2 === 0 ? WHITE : OFF }}>
                        <td style={{ padding: "10px 12px", color: SLATE2 }}>#{c.id}</td>
                        <td style={{ padding: "10px 12px", maxWidth: 180 }}><div style={{ color: N2 }}>{c.title}</div><div style={{ fontSize: 11, color: SLATE2 }}>{c.date}</div></td>
                        <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, background: "#e8f1fa", color: N1, padding: "2px 7px", borderRadius: 3, border: "1px solid #9bbcda", whiteSpace: "nowrap" }}>{CAT_ICONS[c.cat]} {c.cat}</span></td>
                        <td style={{ padding: "10px 12px", color: SLATE, fontSize: 12 }}>{c.reporter}</td>
                        <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 11, fontWeight: 500, color: N2 }}>{c.priority}</span></td>
                        <td style={{ padding: "10px 12px" }}><select value={c.status} onChange={e => changeStatus(c.id, e.target.value)} style={{ fontSize: 12, padding: "4px 6px", borderRadius: 4, border: "1px solid " + (sc.bd || BORDER), background: sc.bg || OFF, color: sc.text || N2, cursor: "pointer" }}><option>Open</option><option>In Progress</option><option>Resolved</option></select></td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompCard({ c, upvote }) {
  const sc = SC[c.status] || {};
  return (
    <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
      <div style={{ background: N1, padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: WHITE, fontSize: 12, fontFamily: "sans-serif" }}>#{c.id} · {c.cat}</span>
        <span style={{ fontSize: 11, background: sc.bg, color: sc.text, border: "1px solid " + (sc.bd || BORDER), padding: "2px 7px", borderRadius: 3, fontFamily: "sans-serif" }}>{c.status}</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 15, color: N2, marginBottom: 6 }}>{c.title}</div>
        <div style={{ fontSize: 13, color: SLATE, fontFamily: "sans-serif", lineHeight: 1.65, marginBottom: 10 }}>{c.desc}</div>
        <div style={{ fontSize: 12, color: SLATE2, fontFamily: "sans-serif", marginBottom: 12 }}>By {c.reporter} · {c.date}{c.dept && " · " + c.dept}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => upvote(c.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 5, border: "2px solid " + N1, background: WHITE, color: N1, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" }}>👍 Upvote · <strong>{c.upvotes}</strong></button>
          <div style={{ fontSize: 12, color: SLATE2, fontFamily: "sans-serif" }}>Priority: <strong style={{ color: c.priority > 70 ? "#8b1a1a" : c.priority > 40 ? "#7a4f00" : "#1a6b2a" }}>{c.priority}</strong></div>
        </div>
      </div>
    </div>
  );
}

function GuidePanel() {
  const steps = [
    { n: "01", i: "📋", t: "Multi-Sector Reporting", tag: "Grievance, Transport, Electricity", b: "File civic complaints with photo evidence, submit transport feedback, or raise electricity billing issues. All reports are now centralized and directly routed for admin review." },
    { n: "02", i: "🗺️", t: "Interactive GIS Mapping", tag: "Leaflet Maps Integration", b: "Use the integrated open-source Leaflet maps to precisely geotag your grievance locations or track active public transport buses in real-time across the city." },
    { n: "03", i: "⚙️", t: "Centralized Admin Routing", tag: "Admin Dashboard Control", b: "Submitted feedback and complaints are automatically routed to the Admin Dashboard. Administrators review, manage, and assign tasks to the correct municipal departments." },
    { n: "04", i: "✅", t: "Community & Resolution", tag: "Upvotes & Verified Fixes", b: "Upvote community complaints to increase their priority score. Complaints are escalated based on priority and closed only when verified by the assigned department." },
  ];
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "44px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontSize: 26, fontWeight: 400, color: N2, margin: "0 0 10px" }}>How the Smart City Hub Works</h2>
        <div style={{ width: 54, height: 3, background: GOLD, margin: "0 auto" }} />
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 24, marginBottom: 40 }}>
          <div style={{ flexShrink: 0, textAlign: "center", width: 72 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: N2, border: "3px solid " + GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 6 }}>{s.i}</div>
            <div style={{ fontSize: 10, color: SLATE2, fontFamily: "sans-serif", letterSpacing: "0.08em" }}>STEP {s.n}</div>
            {i < steps.length - 1 && <div style={{ width: 2, height: 44, background: GOLD + "40", margin: "8px auto 0" }} />}
          </div>
          <div style={{ flex: 1, paddingTop: 6 }}>
            <div style={{ display: "inline-block", background: "#e8f1fa", color: N1, fontSize: 11, letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 3, fontFamily: "sans-serif", marginBottom: 8 }}>{s.tag}</div>
            <h3 style={{ fontSize: 20, fontWeight: 400, color: N2, margin: "0 0 10px" }}>{s.t}</h3>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.85, fontFamily: "sans-serif", margin: 0 }}>{s.b}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfilePanel({ points, auth }) {
  const bgs = [{ l: "Street Sentinel", i: "🛡️", e: true, pts: 500 }, { l: "Clean City Champion", i: "♻️", e: true, pts: 300 }, { l: "Night Watcher", i: "🌙", e: true, pts: 200 }, { l: "Community Hero", i: "⭐", e: false, pts: 1000 }, { l: "Early Adopter", i: "🚀", e: false, pts: 150 }];
  const lvls = ["Newcomer", "Civic Contributor", "Urban Guardian", "City Champion"];
  const thr = [0, 500, 1000, 2000, 5000];
  const li = thr.filter(t => points >= t).length - 1;
  const level = lvls[Math.min(li, lvls.length - 1)];
  const nxt = thr[Math.min(li + 1, thr.length - 1)];
  const prog = Math.min(100, Math.round(points / nxt * 100));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18 }}>
      <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
        <div style={{ background: N2, padding: "20px", textAlign: "center", borderBottom: "3px solid " + GOLD }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 22, color: N2 }}>{auth.name ? auth.name.slice(0, 2).toUpperCase() : "AK"}</div>
          <div style={{ color: WHITE, fontSize: 16, marginBottom: 2 }}>{auth.name || "Arjun Kumar"}</div>
          <div style={{ color: GOLD, fontSize: 13, fontFamily: "sans-serif" }}>{level}</div>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "sans-serif", fontSize: 13, color: SLATE }}><span>Level progress</span><span style={{ fontWeight: 500, color: N2 }}>{points.toLocaleString()} / {nxt.toLocaleString()}</span></div>
            <div style={{ height: 10, background: OFF, borderRadius: 5, border: "1px solid " + BORDER, overflow: "hidden" }}><div style={{ height: "100%", width: prog + "%", background: N1, borderRadius: 5 }} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center", fontFamily: "sans-serif" }}>
            {[{ l: "Reports", v: 12 }, { l: "Upvotes", v: 47 }, { l: "Resolved", v: 8 }].map(s => (
              <div key={s.l} style={{ background: OFF, borderRadius: 5, border: "1px solid " + BORDER, padding: "10px 4px" }}><div style={{ fontSize: 20, color: N2 }}>{s.v}</div><div style={{ fontSize: 11, color: SLATE2 }}>{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: 20 }}>
        <div style={{ fontSize: 17, color: N2, marginBottom: 16, paddingBottom: 12, borderBottom: "2px solid " + BORDER }}>Civic Badges</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 12 }}>
          {bgs.map(b => (
            <div key={b.l} style={{ background: b.e ? "#e8f1fa" : OFF, borderRadius: 6, border: "1px solid " + (b.e ? "#9bbcda" : BORDER), padding: 14, opacity: b.e ? 1 : 0.6 }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{b.i}</div>
              <div style={{ fontSize: 13, color: b.e ? N1 : SLATE, marginBottom: 10 }}>{b.l}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "sans-serif" }}>
                <span style={{ fontSize: 12, color: GOLD_D, fontWeight: 500 }}>+{b.pts} pts</span>
                {b.e ? <span style={{ fontSize: 10, background: "#edf7ed", color: "#1a6b2a", border: "1px solid #a8d8a8", padding: "2px 6px", borderRadius: 3 }}>Earned</span> : <span style={{ fontSize: 10, color: SLATE2 }}>Locked</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel({ complaints }) {
  const months = ["Jan", "Feb", "Mar", "Apr"];
  const recv = [18, 23, 31, complaints.length];
  const res = [14, 18, 22, complaints.filter(c => c.status === "Resolved").length];
  const mx = Math.max(...recv, ...res, 1);
  const catC = CATS.map(cat => ({ cat, count: complaints.filter(c => c.cat === cat).length }));
  const mxC = Math.max(...catC.map(c => c.count), 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: 18, borderTop: "3px solid " + N1 }}>
        <div style={{ fontSize: 15, color: N2, marginBottom: 4 }}>Received vs. Resolved</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14, fontFamily: "sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><div style={{ width: 12, height: 12, borderRadius: 2, background: N1 }} /><span style={{ color: SLATE }}>Received</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}><div style={{ width: 12, height: 12, borderRadius: 2, background: "#1a6b2a" }} /><span style={{ color: SLATE }}>Resolved</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 140 }}>
          {months.map((m, i) => (
            <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 120 }}>
                <div style={{ width: 18, background: N1, height: (recv[i] / mx * 110) + "px", borderRadius: "3px 3px 0 0" }} />
                <div style={{ width: 18, background: "#1a6b2a", height: (res[i] / mx * 110) + "px", borderRadius: "3px 3px 0 0" }} />
              </div>
              <span style={{ fontSize: 12, color: SLATE2, fontFamily: "sans-serif" }}>{m}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: 18, borderTop: "3px solid " + N1 }}>
        <div style={{ fontSize: 15, color: N2, marginBottom: 14 }}>By Category</div>
        {catC.map(({ cat, count }) => (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "sans-serif" }}><span style={{ fontSize: 12, color: SLATE }}>{CAT_ICONS[cat]} {cat}</span><span style={{ fontSize: 12, fontWeight: 500, color: N2 }}>{count}</span></div>
            <div style={{ height: 7, background: OFF, borderRadius: 3, border: "1px solid " + BORDER, overflow: "hidden" }}><div style={{ height: "100%", width: (count / mxC * 100) + "%", background: N1, borderRadius: 3 }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationPickerMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  const icon = L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background-color:#10B981;border:2px solid white;border-radius:50%;color:white;font-size:14px;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} icon={icon} />
  );
}

/* ─── COMPLAINT FORM ───────────────────────────────────────── */
function ComplaintForm({ formStep, setFormStep, formData, setFormData, submitComplaint, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(6,24,50,0.72)", zIndex: 1500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: WHITE, borderRadius: 8, width: "100%", maxWidth: 500, overflow: "hidden", border: "2px solid " + GOLD }}>
        <div style={{ background: N2, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid " + GOLD }}>
          <div>
            <div style={{ color: WHITE, fontSize: 16, marginBottom: 8 }}>File Official Complaint</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {[1, 2, 3].map(s => <><div key={s} style={{ width: 26, height: 26, borderRadius: "50%", background: s <= formStep ? GOLD : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: s <= formStep ? N2 : "rgba(255,255,255,0.4)" }}>{s}</div>{s < 3 && <div style={{ width: 20, height: 2, background: s < formStep ? GOLD : "rgba(255,255,255,0.15)" }} />}</>)}
              <span style={{ color: "#a8c4dc", fontSize: 12, marginLeft: 6, fontFamily: "sans-serif" }}>{["Details", "Evidence", "Review"][formStep - 1]}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 24, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "22px 22px 14px" }}>
          {formStep === 1 && (<div>
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 5 }}>Complaint Title</label><input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Pothole on Station Road" style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, boxSizing: "border-box", fontFamily: "inherit" }} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 5 }}>Category</label><select value={formData.cat} onChange={e => setFormData(p => ({ ...p, cat: e.target.value }))} style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, fontFamily: "inherit" }}>{CATS.map(c => <option key={c}>{c}</option>)}</select><div style={{ marginTop: 5, fontSize: 12, color: "#1e6bb8", fontFamily: "sans-serif" }}>Routes to: {DEPT_MAP[formData.cat]}</div></div>
            <div><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 5 }}>Description</label><textarea value={formData.desc} onChange={e => setFormData(p => ({ ...p, desc: e.target.value }))} rows={3} placeholder="Describe the issue clearly..." style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 14, color: N2, resize: "vertical", boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
          </div>)}
          {formStep === 2 && (<div>
            <div style={{ fontSize: 13, color: SLATE2, fontFamily: "sans-serif", marginBottom: 16 }}>Photo evidence is mandatory for all reports.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={() => setFormData(p => ({ ...p, photo: !p.photo }))} style={{ padding: 18, borderRadius: 8, border: "2px solid " + (formData.photo ? N1 : BORDER), background: formData.photo ? "#e8f1fa" : OFF, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 14, color: formData.photo ? N1 : SLATE }}>Capture Photo</div>
                <div style={{ fontSize: 12, color: formData.photo ? "#1e6bb8" : SLATE2, marginTop: 4, fontFamily: "sans-serif" }}>{formData.photo ? "✓ Captured" : "Tap to open"}</div>
              </button>
              <button onClick={() => setFormData(p => ({ ...p, gps: !p.gps }))} style={{ padding: 18, borderRadius: 8, border: "2px solid " + (formData.gps ? N1 : BORDER), background: formData.gps ? "#e8f1fa" : OFF, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>📍</div>
                <div style={{ fontSize: 14, color: formData.gps ? N1 : SLATE }}>GPS Location</div>
                <div style={{ fontSize: 12, color: formData.gps ? "#1e6bb8" : SLATE2, marginTop: 4, fontFamily: "sans-serif" }}>{formData.gps ? "✓ Pinned" : "Tap to select"}</div>
              </button>
            </div>
            {formData.gps && (
              <div style={{ marginTop: 16, height: 200, width: "100%", borderRadius: 8, overflow: "hidden", border: "1.5px solid " + BORDER, zIndex: 0, position: "relative" }}>
                <MapContainer center={[formData.lat, formData.lng]} zoom={14} style={{ width: "100%", height: "100%" }} zoomControl={true}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <LocationPickerMarker position={{lat: formData.lat, lng: formData.lng}} setPosition={(pos) => setFormData(p => ({ ...p, lat: pos.lat, lng: pos.lng }))} />
                </MapContainer>
                <div style={{ position: "absolute", top: 10, left: 50, zIndex: 1000, background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: 4, fontSize: 12, border: "1px solid " + BORDER }}>Click on the map to place the pin</div>
              </div>
            )}
            {!formData.photo && <div style={{ marginTop: 12, padding: "10px 12px", background: "#fff8e6", borderRadius: 5, border: "1px solid #f5d98b", fontSize: 13, color: "#7a4f00", fontFamily: "sans-serif" }}>⚠ Photo is required to submit this complaint.</div>}
          </div>)}
          {formStep === 3 && (<div>
            <div style={{ background: OFF, borderRadius: 6, border: "1px solid " + BORDER, padding: "4px 14px", marginBottom: 12 }}>
              {[{ l: "Title", v: formData.title || "—" }, { l: "Category", v: formData.cat }, { l: "Department", v: DEPT_MAP[formData.cat] }, { l: "Photo", v: formData.photo ? "✓ Attached" : "✗ Missing" }, { l: "GPS", v: formData.gps ? `${formData.lat.toFixed(4)}°N, ${formData.lng.toFixed(4)}°E` : "Not captured" }].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid " + BORDER, fontFamily: "sans-serif", fontSize: 14 }}><span style={{ color: SLATE2, minWidth: 90 }}>{r.l}</span><span style={{ color: N2, maxWidth: "60%", textAlign: "right" }}>{r.v}</span></div>
              ))}
            </div>
            <div style={{ padding: "10px 12px", background: "#e8f1fa", borderRadius: 5, border: "1px solid #9bbcda", fontSize: 13, color: N1, fontFamily: "sans-serif" }}>Submitting earns +50 civic points and notifies {DEPT_MAP[formData.cat]}.</div>
          </div>)}
        </div>
        <div style={{ padding: "12px 22px 18px", borderTop: "1px solid " + BORDER, display: "flex", gap: 10 }}>
          <button onClick={() => formStep > 1 ? setFormStep(s => s - 1) : onClose()} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: "transparent", color: N1, border: "1.5px solid " + N1, borderRadius: 6, fontFamily: "inherit" }}>{formStep === 1 ? "Cancel" : "← Back"}</button>
          {formStep < 3 ? <button onClick={() => setFormStep(s => s + 1)} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: N1, color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>Continue →</button> : <button onClick={submitComplaint} style={{ flex: 1, padding: "11px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: "#1a6b2a", color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>Submit Report ✓</button>}
        </div>
      </div>
    </div>
  );
}

/* ─── TRANSPORT MODULE ─────────────────────────────────────── */
function TransportModule({ tPage, setTPage, buses, selBus, setSelBus, selStop, setSelStop, toast_show, auth, submitTransportFeedback }) {
  const [tForm, setTForm] = useState({ route: "", issue: "", desc: "", submitted: false });
  const mapW = 680, mapH = 340, minLat = 12.94, maxLat = 12.99, minLng = 77.56, maxLng = 77.64;
  const toX = lng => Math.max(10, Math.min(mapW - 10, ((lng - minLng) / (maxLng - minLng)) * (mapW - 40) + 20));
  const toY = lat => Math.max(10, Math.min(mapH - 10, ((maxLat - lat) / (maxLat - minLat)) * (mapH - 40) + 20));
  const busColors = ["#0d4a8a", "#1a6b2a", "#7a4f00", "#6b1a1a", "#534ab7"];

  const doSubmit = () => {
    if (!tForm.route || !tForm.issue) { toast_show("Please fill all required fields.", "err"); return; }
    submitTransportFeedback(tForm);
    setTForm(p => ({ ...p, submitted: true, ref: "TFB-" + Math.floor(Math.random() * 9000 + 1000) })); toast_show("Transport feedback submitted successfully!");
  };

  return (
    <div>
      <div style={{ background: N1, padding: "20px 24px 0", borderBottom: "3px solid " + GOLD }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ color: WHITE, fontWeight: 400, fontSize: 20, margin: "0 0 14px" }}>Public Transport Services</h2>
          <div style={{ display: "flex", gap: 2 }}>
            {[{ k: "map", l: "🚌 Live Bus Tracking" }, { k: "complaints", l: "📝 Transport Feedback" }].map(t => (
              <button key={t.k} onClick={() => setTPage(t.k)} style={{ padding: "9px 18px", border: "none", background: tPage === t.k ? OFF : "transparent", color: tPage === t.k ? N2 : "#a8c4dc", fontWeight: tPage === t.k ? 500 : 400, fontSize: 13, cursor: "pointer", borderRadius: "5px 5px 0 0", fontFamily: "inherit" }}>{t.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        {tPage === "map" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
            <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", background: OFF, borderBottom: "1px solid " + BORDER, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a6b2a", animation: "pulse 1s infinite" }} />
                <span style={{ fontSize: 13, color: N1, fontFamily: "sans-serif", fontWeight: 500 }}>Live Bus Tracking — GIS Map</span>
                <span style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif", marginLeft: "auto" }}>Updates every 1.8s · Click bus or stop to view info</span>
              </div>
              <div style={{ background: "#d8e8f2", position: "relative", height: mapH, width: "100%", zIndex: 0 }}>
                <MapContainer center={[12.965, 77.600]} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  {/* Bus stops */}
                  {BUS_STOPS.map(s => {
                    const sel = selStop?.id === s.id;
                    const icon = L.divIcon({
                      className: '',
                      html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:16px;background-color:${sel ? '#fff3cd' : 'white'};border:${sel ? '2px solid gold' : '1px solid #7a9ab8'};font-size:10px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">🚏</div>`,
                      iconSize: [28, 16],
                      iconAnchor: [14, 8]
                    });
                    return (
                      <Marker
                        key={s.id}
                        position={[s.lat, s.lng]}
                        icon={icon}
                        eventHandlers={{ click: () => setSelStop(sel ? null : s) }}
                      />
                    );
                  })}
                  {/* Buses */}
                  {buses.map((b, i) => {
                    const sel = selBus?.id === b.id;
                    const col = busColors[i % busColors.length];
                    const icon = L.divIcon({
                      className: '',
                      html: `<div style="display:flex;align-items:center;justify-content:center;width:${sel ? 33 : 28}px;height:${sel ? 24 : 20}px;background-color:${col};border:${sel ? '3px solid gold' : '2px solid white'};font-size:14px;box-shadow:0 2px 4px rgba(0,0,0,0.3);">🚌</div>`,
                      iconSize: [sel ? 33 : 28, sel ? 24 : 20],
                      iconAnchor: [sel ? 16 : 14, sel ? 12 : 10]
                    });
                    return (
                      <Marker
                        key={b.id}
                        position={[b.lat, b.lng]}
                        icon={icon}
                        eventHandlers={{ click: () => setSelBus(sel ? null : b) }}
                      />
                    );
                  })}
                </MapContainer>
              </div>
              {/* Route legend */}
              <div style={{ padding: "8px 14px", background: WHITE, borderTop: "1px solid " + BORDER, display: "flex", gap: 14, flexWrap: "wrap" }}>
                {buses.map((b, i) => <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SLATE, fontFamily: "sans-serif" }}><div style={{ width: 10, height: 10, borderRadius: 2, background: busColors[i % busColors.length] }} />{b.id}</div>)}
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SLATE, fontFamily: "sans-serif" }}><div style={{ width: 12, height: 10, borderRadius: 2, border: "1px solid #7a9ab8", background: WHITE }} />Bus Stop</div>
              </div>
            </div>

            {/* Side panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(selBus || selStop) ? (
                <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
                  <div style={{ background: selBus ? N1 : "#5c4a00", padding: "10px 14px", borderBottom: "2px solid " + GOLD }}>
                    <div style={{ color: WHITE, fontSize: 14 }}>{selBus ? "🚌 Bus Details" : "🚏 Stop Info"}</div>
                  </div>
                  <div style={{ padding: 14 }}>
                    {selBus && <>
                      <div style={{ fontSize: 16, color: N2, marginBottom: 8, fontWeight: 400 }}>{selBus.route}</div>
                      {[{ l: "Bus ID", v: selBus.id }, { l: "Next Arrival", v: selBus.next }, { l: "Speed", v: selBus.speed + " km/h" }, { l: "Seats Available", v: selBus.seats > 0 ? selBus.seats + " seats" : "Full — No Seats" }, { l: "Status", v: selBus.seats === 0 ? "Standing Room Only" : "Boarding" }].map(r => (
                        <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid " + BORDER, fontFamily: "sans-serif", fontSize: 13 }}><span style={{ color: SLATE2 }}>{r.l}</span><span style={{ color: N2, fontWeight: r.l === "Next Arrival" ? 500 : 400 }}>{r.v}</span></div>
                      ))}
                    </>}
                    {selStop && !selBus && <>
                      <div style={{ fontSize: 16, color: N2, marginBottom: 10 }}>{selStop.name}</div>
                      <div style={{ fontSize: 13, color: SLATE, fontFamily: "sans-serif", marginBottom: 10 }}>Buses serving this stop:</div>
                      {buses.slice(0, 3).map(b => (
                        <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid " + BORDER, fontFamily: "sans-serif", fontSize: 13 }}><span style={{ color: N1 }}>{b.route.split("–")[0]}</span><span style={{ color: "#1a6b2a", fontWeight: 500 }}>{b.next}</span></div>
                      ))}
                    </>}
                    <button onClick={() => { setSelBus(null); setSelStop(null); }} style={{ marginTop: 12, width: "100%", padding: "9px", border: "1px solid " + BORDER, borderRadius: 5, background: OFF, color: SLATE, cursor: "pointer", fontSize: 13, fontFamily: "sans-serif" }}>Clear Selection</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: 14 }}>
                  <div style={{ fontSize: 12, color: SLATE2, fontFamily: "sans-serif", fontWeight: 500, marginBottom: 12, letterSpacing: "0.06em" }}>ACTIVE BUSES</div>
                  {buses.map((b) => (
                    <div key={b.id} onClick={() => setSelBus(b)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + BORDER, cursor: "pointer" }}>
                      <div><div style={{ fontSize: 13, color: N2, marginBottom: 2 }}>{b.id}</div><div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.route}</div></div>
                      <div style={{ background: b.next.startsWith("1") || b.next.startsWith("2") ? "#edf7ed" : "#fff8e6", color: b.next.startsWith("1") || b.next.startsWith("2") ? "#1a6b2a" : "#7a4f00", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, fontFamily: "sans-serif", flexShrink: 0, border: "1px solid " + (b.next.startsWith("1") || b.next.startsWith("2") ? "#a8d8a8" : "#f5d98b") }}>{b.next}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tPage === "complaints" && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {tForm.submitted ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: WHITE, borderRadius: 8, border: "1px solid " + BORDER }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 20, color: N2, marginBottom: 8 }}>Feedback Submitted</div>
                <p style={{ fontSize: 14, color: SLATE, fontFamily: "sans-serif", lineHeight: 1.7, marginBottom: 20 }}>Your transport feedback has been recorded and forwarded to the Transport Department. Reference: {tForm.ref || "TFB-0000"}</p>
                <button onClick={() => setTForm({ route: "", issue: "", desc: "", submitted: false })} style={{ padding: "11px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: N1, color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>Submit Another</button>
              </div>
            ) : (
              <div style={{ background: WHITE, borderRadius: 8, border: "1px solid " + BORDER, overflow: "hidden" }}>
                <div style={{ background: N1, padding: "16px 20px", borderBottom: "3px solid " + GOLD }}><div style={{ color: WHITE, fontSize: 17 }}>Transport Feedback / Complaint</div><div style={{ color: "#a8c4dc", fontSize: 13, fontFamily: "sans-serif", marginTop: 3 }}>Report bus service issues, route problems, or safety concerns</div></div>
                <div style={{ padding: 22 }}>
                  <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Route / Bus Number <span style={{ color: "#8b1a1a" }}>*</span></label><select value={tForm.route} onChange={e => setTForm(p => ({ ...p, route: e.target.value }))} style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, fontFamily: "inherit" }}><option value="">-- Select Route --</option>{BUSES_INIT.map(b => <option key={b.id} value={b.id}>{b.id} · {b.route}</option>)}</select></div>
                  <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Issue Type <span style={{ color: "#8b1a1a" }}>*</span></label><select value={tForm.issue} onChange={e => setTForm(p => ({ ...p, issue: e.target.value }))} style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, fontFamily: "inherit" }}><option value="">-- Select Issue --</option>{["Bus Not Running", "Overcrowding", "Driver Misconduct", "Route Deviation", "Vehicle Condition", "Stop Not Served", "Late Arrival", "Safety Concern"].map(o => <option key={o}>{o}</option>)}</select></div>
                  <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Description</label><textarea value={tForm.desc} onChange={e => setTForm(p => ({ ...p, desc: e.target.value }))} rows={4} placeholder="Describe the issue in detail..." style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 14, color: N2, resize: "vertical", boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Date of Incident</label><input type="date" defaultValue={new Date().toISOString().slice(0, 10)} style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 14, color: N2, boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
                    <div><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Time (approx.)</label><input type="time" style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 14, color: N2, boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
                  </div>
                  <button onClick={doSubmit} style={{ marginTop: 20, width: "100%", padding: "13px", fontSize: 15, fontWeight: 500, cursor: "pointer", background: N1, color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>Submit Feedback →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ELECTRICITY MODULE ───────────────────────────────────── */
function ElectricityModule({ ePage, setEPage, balance, recharges, rechargeAmt, setRechargeAmt, doRecharge, zones, toast_show, auth, submitBillingComplaint }) {
  const [bForm, setBForm] = useState({ consumerId: "", type: "", desc: "", submitted: false });
  const mapW = 680, mapH = 300;
  const zoneRects = [{ x: 5, y: 5, w: 320, h: 135 }, { x: 355, y: 5, w: 320, h: 135 }, { x: 5, y: 155, w: 320, h: 135 }, { x: 355, y: 155, w: 320, h: 135 }];
  const zoneCol = { online: "#1a6b2a", maintenance: "#7a4f00", outage: "#8b1a1a" };
  const zoneBg = { online: "#c8ecd0", maintenance: "#fef3cd", outage: "#fdd8d8" };
  const [countdown, setCountdown] = useState(3600);
  useEffect(() => {
    if (ePage !== "grid") return;
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 3600), 1000);
    return () => clearInterval(t);
  }, [ePage]);
  const fmtTime = s => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
      <div style={{ background: N1, padding: "20px 24px 0", borderBottom: "3px solid " + GOLD }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ color: WHITE, fontWeight: 400, fontSize: 20, margin: "0 0 14px" }}>Electricity Services — Nagaland DOSE Model</h2>
          <div style={{ display: "flex", gap: 2 }}>
            {[{ k: "dashboard", l: "💡 My Prepaid Meter" }, { k: "grid", l: "🗺️ Grid Health Map" }, { k: "billing", l: "📋 Billing Complaints" }].map(t => (
              <button key={t.k} onClick={() => setEPage(t.k)} style={{ padding: "9px 18px", border: "none", background: ePage === t.k ? OFF : "transparent", color: ePage === t.k ? N2 : "#a8c4dc", fontWeight: ePage === t.k ? 500 : 400, fontSize: 13, cursor: "pointer", borderRadius: "5px 5px 0 0", fontFamily: "inherit" }}>{t.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px" }}>
        {ePage === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
            {/* Wallet card */}
            <div style={{ background: "linear-gradient(135deg," + N2 + " 0%," + N3 + " 100%)", borderRadius: 12, border: "2px solid " + GOLD, padding: "28px 24px", color: WHITE, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div><div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 4 }}>PREPAID SMART METER</div><div style={{ fontSize: 13, color: "#a8c4dc", fontFamily: "sans-serif" }}>Nagaland DOSE — Consumer Portal</div></div>
                <div style={{ fontSize: 28 }}>⚡</div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: "#a8c4dc", fontFamily: "sans-serif", marginBottom: 6 }}>Available Balance</div>
                <div style={{ fontSize: 42, fontWeight: 400, color: GOLD, lineHeight: 1 }}>₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div style={{ fontSize: 12, color: balance < 200 ? "#f5c2c2" : "#a8d8a8", fontFamily: "sans-serif", marginTop: 6 }}>{balance < 200 ? "⚠ Low balance — please recharge soon" : "● Active — Sufficient Balance"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {[{ l: "Consumer ID", v: "NGL-" + ((auth.id || 9021).toString().padStart(6, "0")) }, { l: "Ward", v: "Ward A – Central" }, { l: "Meter No.", v: "SM-" + ((auth.id || 9021) * 7).toString().slice(0, 6) }, { l: "Tariff", v: "Domestic BPL" }].map(f => (
                  <div key={f.l}><div style={{ fontSize: 10, color: "#7a90a8", fontFamily: "sans-serif", letterSpacing: "0.06em", marginBottom: 2 }}>{f.l}</div><div style={{ fontSize: 13, color: WHITE, fontFamily: "sans-serif" }}>{f.v}</div></div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={rechargeAmt} onChange={e => setRechargeAmt(e.target.value)} placeholder="Enter amount ₹" type="number" style={{ flex: 1, padding: "10px 12px", borderRadius: 5, border: "1px solid " + GOLD + "55", background: "rgba(255,255,255,0.1)", color: WHITE, fontSize: 14, fontFamily: "sans-serif", outline: "none" }} />
                <button onClick={doRecharge} style={{ padding: "10px 18px", borderRadius: 5, border: "none", background: GOLD, color: N2, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Recharge</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {[100, 200, 500, 1000].map(a => <button key={a} onClick={() => setRechargeAmt(String(a))} style={{ flex: 1, padding: "6px 4px", borderRadius: 4, border: "1px solid " + GOLD + "40", background: "rgba(200,168,75,0.15)", color: GOLD, fontSize: 12, cursor: "pointer", fontFamily: "sans-serif" }}>₹{a}</button>)}
              </div>
            </div>

            {/* Recharge history */}
            <div>
              <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ background: N2, padding: "12px 16px", borderBottom: "2px solid " + GOLD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: WHITE, fontSize: 15 }}>Recharge History</div>
                  <div style={{ color: GOLD, fontSize: 12, fontFamily: "sans-serif" }}>{recharges.length} transactions</div>
                </div>
                {recharges.slice(0, 8).map((r, i) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + BORDER, background: i % 2 === 0 ? WHITE : OFF }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8f1fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
                      <div><div style={{ fontSize: 13, color: N2, fontFamily: "sans-serif" }}>{r.type} Recharge</div><div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif" }}>{r.ref} · {r.date}</div></div>
                    </div>
                    <div style={{ fontSize: 16, color: "#1a6b2a", fontFamily: "sans-serif", fontWeight: 500 }}>+₹{r.amount}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ l: "Units Consumed (Apr)", v: "48.3 kWh" }, { l: "Avg. Daily Usage", v: "1.6 kWh" }, { l: "Monthly Estimate", v: "₹382" }, { l: "Last Reading", v: "2026-04-05" }].map(s => (
                  <div key={s.l} style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: "14px 16px", borderTop: "3px solid " + N1 }}><div style={{ fontSize: 11, color: SLATE2, fontFamily: "sans-serif", marginBottom: 5, letterSpacing: "0.04em" }}>{s.l}</div><div style={{ fontSize: 18, color: N1, fontFamily: "sans-serif" }}>{s.v}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {ePage === "grid" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
              <div style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", background: OFF, borderBottom: "1px solid " + BORDER, fontFamily: "sans-serif", fontSize: 13, color: N1, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>Grid Health Map — Zone Overview</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: SLATE2 }}>Live status · {new Date().toLocaleTimeString()}</span>
                </div>
                <svg width="100%" viewBox={"0 0 " + mapW + " " + mapH} style={{ display: "block" }}>
                  <rect width={mapW} height={mapH} fill="#e8eff5" />
                  {zones.map((z, i) => {
                    const r = zoneRects[i];
                    const col = zoneCol[z.status] || "#888";
                    const bg = zoneBg[z.status] || "#eee";
                    return (<g key={z.id}>
                      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={6} fill={bg} stroke={col} strokeWidth={2} />
                      <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 18} textAnchor="middle" fontSize={22} fontFamily="sans-serif">{z.status === "online" ? "✅" : z.status === "maintenance" ? "🔧" : "❌"}</text>
                      <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 4} textAnchor="middle" fontSize={11} fontWeight="500" fill={col} fontFamily="sans-serif">{z.name}</text>
                      <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 20} textAnchor="middle" fontSize={9} fill={col} fontFamily="sans-serif">{z.status === "online" ? "OPERATIONAL" : z.status === "maintenance" ? "SCHEDULED MAINT." : "UNSCHEDULED OUTAGE"}</text>
                      {z.status !== "online" && <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 35} textAnchor="middle" fontSize={9} fill={col} fontFamily="sans-serif">{z.status === "maintenance" ? "Timer: " + fmtTime(countdown) : "Crews Deployed"}</text>}
                      <text x={r.x + 8} y={r.y + r.h - 8} fontSize={8} fill={col + "99"} fontFamily="sans-serif">{z.consumers} consumers</text>
                    </g>);
                  })}
                  <line x1={mapW / 2} y1={0} x2={mapW / 2} y2={mapH} stroke="white" strokeWidth={4} />
                  <line x1={0} y1={mapH / 2} x2={mapW} y2={mapH / 2} stroke="white" strokeWidth={4} />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {zones.map(z => (
                  <div key={z.id} style={{ background: WHITE, borderRadius: 6, border: "1px solid " + BORDER, padding: 14, borderLeft: "4px solid " + zoneCol[z.status] }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: N2, fontWeight: 500 }}>{z.name}</div>
                      <span style={{ fontSize: 10, background: zoneBg[z.status], color: zoneCol[z.status], border: "1px solid " + zoneCol[z.status] + "44", padding: "2px 7px", borderRadius: 3, fontFamily: "sans-serif", fontWeight: 500 }}>{z.status.toUpperCase()}</span>
                    </div>
                    {z.status !== "online" && <div style={{ fontSize: 12, color: SLATE2, fontFamily: "sans-serif", lineHeight: 1.5 }}><div>{z.reason}</div>{z.schedTime && <div>Time: {z.schedTime}</div>}{z.status === "maintenance" && <div style={{ color: zoneCol.maintenance, fontWeight: 500 }}>Restores in: {fmtTime(countdown)}</div>}</div>}
                    {z.status === "online" && <div style={{ fontSize: 12, color: "#1a6b2a", fontFamily: "sans-serif" }}>All systems operational</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {ePage === "billing" && (
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {bForm.submitted ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: WHITE, borderRadius: 8, border: "1px solid " + BORDER }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <div style={{ fontSize: 20, color: N2, marginBottom: 8 }}>Billing Complaint Registered</div>
                <p style={{ fontSize: 14, color: SLATE, fontFamily: "sans-serif", lineHeight: 1.7, marginBottom: 20 }}>Your complaint has been forwarded to the Electricity Board billing team. Reference: {bForm.ref || "BILL-0000"}</p>
                <button onClick={() => setBForm({ consumerId: "", type: "", desc: "", submitted: false })} style={{ padding: "11px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", background: N1, color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>Submit Another</button>
              </div>
            ) : (
              <div style={{ background: WHITE, borderRadius: 8, border: "1px solid " + BORDER, overflow: "hidden" }}>
                <div style={{ background: N1, padding: "16px 20px", borderBottom: "3px solid " + GOLD }}><div style={{ color: WHITE, fontSize: 17 }}>Billing Complaint / Electricity Grievance</div><div style={{ color: "#a8c4dc", fontSize: 13, fontFamily: "sans-serif", marginTop: 3 }}>Report billing errors, meter issues, or connection problems</div></div>
                <div style={{ padding: 22 }}>
                  <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Consumer ID <span style={{ color: "#8b1a1a" }}>*</span></label><input value={bForm.consumerId} onChange={e => setBForm(p => ({ ...p, consumerId: e.target.value }))} placeholder="e.g. NGL-009021" style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
                  <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Complaint Type <span style={{ color: "#8b1a1a" }}>*</span></label><select value={bForm.type} onChange={e => setBForm(p => ({ ...p, type: e.target.value }))} style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 15, color: N2, fontFamily: "inherit" }}><option value="">-- Select Type --</option>{["Wrong Bill Amount", "Meter Not Reading", "Recharge Not Credited", "Connection Failure", "Voltage Fluctuation", "Meter Tampering", "New Connection Request", "Name Transfer"].map(o => <option key={o}>{o}</option>)}</select></div>
                  <div style={{ marginBottom: 16 }}><label style={{ fontSize: 14, color: N2, display: "block", marginBottom: 6 }}>Description</label><textarea value={bForm.desc} onChange={e => setBForm(p => ({ ...p, desc: e.target.value }))} rows={4} placeholder="Describe the billing issue or problem in detail..." style={{ width: "100%", padding: "11px 12px", borderRadius: 5, border: "1.5px solid " + BORDER, fontSize: 14, color: N2, resize: "vertical", boxSizing: "border-box", fontFamily: "sans-serif" }} /></div>
                  <div style={{ padding: "12px 14px", background: "#fff8e6", borderRadius: 5, border: "1px solid #f5d98b", fontSize: 13, color: "#7a4f00", fontFamily: "sans-serif", marginBottom: 16 }}>Helpline: 1912 · Office Hours: Mon–Sat 9AM–5PM · Emergency: 1800-345-3765</div>
                  <button onClick={() => { if (!bForm.consumerId || !bForm.type) { toast_show("Fill required fields.", "err"); return; } submitBillingComplaint(bForm); setBForm(p => ({ ...p, submitted: true, ref: "BILL-" + Math.floor(Math.random() * 9000 + 1000) })); toast_show("Billing complaint submitted!"); }} style={{ width: "100%", padding: "13px", fontSize: 15, fontWeight: 500, cursor: "pointer", background: N1, color: WHITE, border: "none", borderRadius: 6, fontFamily: "inherit" }}>Submit Complaint →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
