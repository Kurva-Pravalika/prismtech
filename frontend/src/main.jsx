import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  AlertTriangle, Bell, Camera, CheckCircle2, ChevronRight, CloudOff,
  Crosshair, FileWarning, Flame, Gauge, Globe2, Home, ImagePlus, Info,
  LayoutDashboard, LocateFixed, MapPin, Menu, MessageSquare, Moon, Navigation,
  Plus, RefreshCw, Route, Search, Send, ShieldAlert, ShieldCheck, Siren,
  Sparkles, Sun, UserRound, Wifi, WifiOff, X, Zap, Trophy, HeartHandshake,
  Activity, ArrowUpRight, Radio, Clock3, Target, UsersRound
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "sociosolve_reports_v2";

const seedReports = [
  {
    id:"SS-1042",
    title:"Open manhole near community park",
    category:"Open Manhole",
    priority:"EMERGENCY",
    status:"In Progress",
    lat:17.4522,
    lng:78.3911,
    time:"2 min ago",
    description:"Large uncovered manhole on the roadside.",
    reporter:"Citizen",
    emergency:true
  },
  {
    id:"SS-1041",
    title:"Broken streetlight on 4th Avenue",
    category:"Streetlight",
    priority:"HIGH",
    status:"Assigned",
    lat:17.4485,
    lng:78.3877,
    time:"18 min ago",
    description:"Streetlight is not working after sunset.",
    reporter:"Citizen",
    emergency:false
  },
  {
    id:"SS-1040",
    title:"Garbage overflow beside bus stop",
    category:"Garbage",
    priority:"NORMAL",
    status:"Resolved",
    lat:17.4550,
    lng:78.3945,
    time:"1 hr ago",
    description:"Waste bin overflowing.",
    reporter:"Citizen",
    emergency:false
  }
];

function loadReports(){
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedReports;
  } catch {
    return seedReports;
  }
}

function saveReports(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const categoryRules = [
  ["manhole", "Open Manhole", "EMERGENCY"],
  ["wire", "Fallen Electric Wire", "EMERGENCY"],
  ["electric", "Fallen Electric Wire", "EMERGENCY"],
  ["pothole", "Pothole", "HIGH"],
  ["garbage", "Garbage", "NORMAL"],
  ["waste", "Garbage", "NORMAL"],
  ["streetlight", "Streetlight", "HIGH"],
  ["light", "Streetlight", "HIGH"],
  ["water", "Water Leakage", "HIGH"],
  ["leak", "Water Leakage", "HIGH"],
  ["road", "Broken Road", "HIGH"]
];

function aiAnalyze(text){
  const t = text.toLowerCase();

  const found = categoryRules.find(([word]) => t.includes(word));

  return {
    category: found ? found[1] : "Other Civic Issue",
    suggestedPriority: found ? found[2] : "NORMAL",
    duplicate:
      t.includes("same") ||
      t.includes("again") ||
      t.includes("already")
  };
}

function App(){
  const [reports, setReports] = useState(loadReports);
  const [page, setPage] = useState("home");
  const [impact, setImpact] = useState(87);
  const [role, setRole] = useState("citizen");
  const [dark, setDark] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(()=>{
    const on = ()=>setOnline(true);
    const off = ()=>setOnline(false);

    window.addEventListener("online",on);
    window.addEventListener("offline",off);

    return ()=>{
      window.removeEventListener("online",on);
      window.removeEventListener("offline",off);
    };
  },[]);

  useEffect(()=>{
    saveReports(reports);
  },[reports]);

  const emergencyCount =
    reports.filter(
      r=>r.priority==="EMERGENCY" && r.status!=="Resolved"
    ).length;

  const activeCount =
    reports.filter(r=>r.status!=="Resolved").length;

  const nearby =
    reports.filter(
      r=>r.priority==="EMERGENCY" || r.priority==="HIGH"
    ).length;

  const notify = (message, kind="success") => {
    setToast({message,kind});
    setTimeout(()=>setToast(null),3200);
  };

  // =========================================================
  // SEND NEW REPORT TO SPRING BOOT + MONGODB ATLAS
  // =========================================================
  async function addReport(report){

    const item = {
      title: report.title,
      description: report.description,
      category: report.category,
      priority: report.priority,
      status: "Submitted",
      lat: report.lat,
      lng: report.lng,
      emergency: report.emergency
    };

    try {

      const response = await fetch(
        "http://localhost:8081/api/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(item)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save complaint");
      }

      const savedComplaint = await response.json();

      const frontendItem = {
        ...item,
        id: savedComplaint.id || "SS-" + Date.now(),
        time: "Just now",
        reporter: "You"
      };

      setReports(prev => [
        frontendItem,
        ...prev
      ]);

      notify(
        item.emergency
          ? "Emergency report routed with highest priority."
          : "Report submitted successfully."
      );

      setPage("track");

    } catch(error) {

      console.error("Backend error:", error);

      // If backend is unavailable,
      // save the report locally.
      const localItem = {
        ...item,
        id: "SS-" + Date.now(),
        time: "Just now",
        reporter: "You"
      };

      setReports(prev => [
        localItem,
        ...prev
      ]);

      notify(
        "Backend unavailable. Report saved locally.",
        "offline"
      );

      setPage("track");
    }
  }

  function syncOffline(){
    if(!online){
      notify(
        "No internet connection. Still in offline mode.",
        "offline"
      );
      return;
    }

    notify("Offline queue synchronized successfully.");
  }

  const themeClass = dark ? "app dark" : "app light";

  return (
    <div className={themeClass}>

      <header className="topbar">

        <div
          className="brand"
          onClick={()=>setPage("home")}
        >
          <div className="brandMark">
            <Globe2 size={22}/>
          </div>

          <div>
            <strong>SocioSolve</strong>
            <span>Smart Community Safety</span>
          </div>
        </div>

        <div className="topActions">

          <div className={"network "+(online?"online":"offline")}>
            <span className="dot"></span>
            {online?"Online":"Offline"}
          </div>

          <button
            className="iconBtn"
            onClick={()=>setShowNotifications(!showNotifications)}
          >
            <Bell size={19}/>
            {emergencyCount>0&&<b>{emergencyCount}</b>}
          </button>

          <button
            className="iconBtn"
            onClick={()=>setDark(!dark)}
          >
            {dark?<Sun size={19}/>:<Moon size={19}/>}
          </button>

          <button className="profileBtn">
            <UserRound size={18}/>
            <span>
              {role==="authority"?"Authority":"Citizen"}
            </span>
          </button>

          <button
            className="mobileMenu"
            onClick={()=>setMenu(!menu)}
          >
            <Menu/>
          </button>

        </div>

        {showNotifications &&
          <NotificationPanel
            reports={reports}
            onClose={()=>setShowNotifications(false)}
          />
        }

      </header>

      <aside className={"sidebar "+(menu?"open":"")}>

        <div className="roleSwitch">

          <button
            className={role==="citizen"?"active":""}
            onClick={()=>{
              setRole("citizen");
              setPage("home");
              setMenu(false);
            }}
          >
            <UserRound size={16}/>
            Citizen
          </button>

          <button
            className={role==="authority"?"active":""}
            onClick={()=>{
              setRole("authority");
              setPage("dashboard");
              setMenu(false);
            }}
          >
            <ShieldCheck size={16}/>
            Authority
          </button>

        </div>

        {role==="citizen" ? <>

          <Nav
            icon={<Home/>}
            label="Home"
            active={page==="home"}
            onClick={()=>setPage("home")}
          />

          <Nav
            icon={<Plus/>}
            label="Report Issue"
            active={page==="report"}
            onClick={()=>setPage("report")}
          />

          <Nav
            icon={<Navigation/>}
            label="Risk Map"
            active={page==="map"}
            onClick={()=>setPage("map")}
          />

          <Nav
            icon={<Route/>}
            label="My Reports"
            active={page==="track"}
            onClick={()=>setPage("track")}
          />

          <Nav
            icon={<Trophy/>}
            label="Community Hub"
            active={page==="impact"}
            onClick={()=>setPage("impact")}
          />

        </> : <>

          <Nav
            icon={<LayoutDashboard/>}
            label="Command Center"
            active={page==="dashboard"}
            onClick={()=>setPage("dashboard")}
          />

          <Nav
            icon={<MapPin/>}
            label="Risk Map"
            active={page==="map"}
            onClick={()=>setPage("map")}
          />

          <Nav
            icon={<FileWarning/>}
            label="All Reports"
            active={page==="track"}
            onClick={()=>setPage("track")}
          />

          <Nav
            icon={<Activity/>}
            label="Impact Analytics"
            active={page==="impact"}
            onClick={()=>setPage("impact")}
          />

        </>}

        <div className="sideBottom">

          <div className="offlineCard">

            {online?<Wifi size={17}/>:<WifiOff size={17}/>}

            <div>
              <strong>
                {online?"Connected":"Offline-first mode"}
              </strong>

              <span>
                {online
                  ?"Live sync enabled"
                  :"Reports are safely queued"}
              </span>
            </div>

          </div>

          <button
            className="syncBtn"
            onClick={syncOffline}
          >
            <RefreshCw size={16}/>
            Sync queue
          </button>

        </div>

      </aside>

      <main className="content">

        {role==="authority" && page==="dashboard" ?

          <AuthorityDashboard
            reports={reports}
            setReports={setReports}
            notify={notify}
            onMap={()=>setPage("map")}
          />

        :

        page==="home" ?

          <HomePage
            reports={reports}
            activeCount={activeCount}
            emergencyCount={emergencyCount}
            nearby={nearby}
            online={online}
            go={setPage}
          />

        :

        page==="report" ?

          <ReportPage
            online={online}
            addReport={addReport}
          />

        :

        page==="map" ?

          <RiskMap
            reports={reports}
            selected={selected}
            setSelected={setSelected}
          />

        :

        page==="impact" ?

          <ImpactHub
            reports={reports}
            role={role}
            impact={impact}
            setImpact={setImpact}
            notify={notify}
          />

        :

          <TrackPage
            reports={reports}
            selected={selected}
            setSelected={setSelected}
            role={role}
          />

        }

      </main>

      {toast &&
        <div className={"toast "+toast.kind}>

          <div className="toastIcon">
            {toast.kind==="offline"
              ? <CloudOff size={18}/>
              : <CheckCircle2 size={18}/>
            }
          </div>

          {toast.message}

          <button onClick={()=>setToast(null)}>
            <X size={15}/>
          </button>

        </div>
      }

    </div>
  );
}

function Nav({icon,label,active,onClick}){

  return (
    <button
      className={"navItem "+(active?"active":"")}
      onClick={onClick}
    >
      {React.cloneElement(icon,{size:18})}

      <span>{label}</span>

      {active && <ChevronRight size={15}/>}
    </button>
  );
}

function NotificationPanel({reports,onClose}){

  const alerts =
    reports
      .filter(
        r=>r.priority==="EMERGENCY" ||
           r.priority==="HIGH"
      )
      .slice(0,4);

  return (
    <div className="notificationPanel">

      <div className="panelTitle">
        <strong>Safety Alerts</strong>

        <button onClick={onClose}>
          <X size={16}/>
        </button>
      </div>

      {alerts.length ?

        alerts.map(r=>
          <div
            className="notif"
            key={r.id}
          >

            <div
              className={
                "notifIcon "+
                r.priority.toLowerCase()
              }
            >
              <Siren size={16}/>
            </div>

            <div>

              <strong>
                {r.priority==="EMERGENCY"
                  ?"DANGER NEAR YOU"
                  :"Safety notice"}
              </strong>

              <p>{r.title}</p>

              <small>
                {r.time} • {r.category}
              </small>

            </div>

          </div>
        )

        :

        <div className="empty">
          No active safety alerts.
        </div>
      }

    </div>
  );
}

function HomePage({
  reports,
  activeCount,
  emergencyCount,
  nearby,
  online,
  go
}){

  return (
    <div>

      <section className="hero">

        <div className="heroText">

          <div className="eyebrow">
            <Sparkles size={15}/>
            REPORT • ROUTE • WARN • RESOLVE
          </div>

          <h1>
            Make your community
            <br/>
            <em>safer, together.</em>
          </h1>

          <p>
            Turn everyday civic problems into visible,
            trackable action. SocioSolve connects citizens,
            smart triage, authorities and community safety
            in one beautiful loop.
          </p>

          <div className="heroActions">

            <button
              className="primary"
              onClick={()=>go("report")}
            >
              <Plus size={18}/>
              Report an issue
            </button>

            <button
              className="secondary"
              onClick={()=>go("map")}
            >
              <MapPin size={18}/>
              Explore risk map
            </button>

          </div>

        </div>

        <div className="heroVisual">

          <div className="radar">

            <div className="radarRing r1"></div>
            <div className="radarRing r2"></div>
            <div className="radarRing r3"></div>

            <div className="radarCore">
              <ShieldCheck size={30}/>
              <span>SAFE</span>
            </div>

            <span className="radarDot d1"></span>
            <span className="radarDot d2"></span>
            <span className="radarDot d3"></span>

          </div>

          <div className="floatingAlert">

            <div className="pulseIcon">
              <Siren size={18}/>
            </div>

            <div>
              <strong>Emergency detected</strong>
              <span>Nearby users warned</span>
            </div>

            <b>200m</b>

          </div>

        </div>

      </section>

      <div className="trustStrip">

        <div>
          <span className="liveDot"></span>
          <strong>COMMUNITY PULSE</strong>
          <small>Live demo intelligence</small>
        </div>

        <div>
          <b>{Math.min(99,91+reports.length)}%</b>
          <span>reports acknowledged</span>
        </div>

        <div>
          <b>
            {Math.max(
              1,
              reports.filter(r=>r.status==="Resolved").length
            )}
          </b>
          <span>issues closed today</span>
        </div>

        <div>
          <b>24/7</b>
          <span>safety awareness</span>
        </div>

        <button onClick={()=>go("impact")}>
          <Trophy size={16}/>
          See your impact
          <ArrowUpRight size={15}/>
        </button>

      </div>

      <section className="statGrid">

        <Stat
          icon={<FileWarning/>}
          value={activeCount}
          label="Active issues"
        />

        <Stat
          icon={<ShieldAlert/>}
          value={emergencyCount}
          label="Emergency alerts"
          danger
        />

        <Stat
          icon={<MapPin/>}
          value={nearby}
          label="Priority locations"
        />

        <Stat
          icon={online?<Wifi/>:<WifiOff/>}
          value={online?"LIVE":"OFFLINE"}
          label={online?"Network status":"Saved locally"}
        />

      </section>

      <section className="sectionHead">

        <div>
          <span className="eyebrow">SMART FEATURES</span>
          <h2>One platform. The full civic loop.</h2>
        </div>

        <button
          className="textBtn"
          onClick={()=>go("report")}
        >
          Start reporting
          <ChevronRight size={16}/>
        </button>

      </section>

      <div className="featureGrid">

        <Feature
          icon={<Siren/>}
          color="red"
          title="Emergency Safety Mode"
          text="Fallen wires, open manholes and dangerous roads trigger nearby warnings and highest-priority routing."
          tag="GPS + PRIORITY + ALERT"
        />

        <Feature
          icon={<CloudOff/>}
          color="blue"
          title="Smart Offline Reporting"
          text="Photo, GPS and description stay safely on the device and auto-sync when connectivity returns."
          tag="OFFLINE-FIRST"
        />

        <Feature
          icon={<Sparkles/>}
          color="purple"
          title="AI Smart Processing"
          text="Suggests category, spots possible duplicates and assists priority. Authority keeps final control."
          tag="AI ASSISTANCE"
        />

        <Feature
          icon={<MapPin/>}
          color="green"
          title="Community Risk Map"
          text="See active issues and risk clusters by location so citizens can avoid danger."
          tag="LIVE RISK VIEW"
        />

        <Feature
          icon={<Trophy/>}
          color="gold"
          title="Impact & Recognition"
          text="Build a positive civic footprint with contribution points, streaks and community milestones."
          tag="CIVIC IMPACT"
        />

        <Feature
          icon={<Radio/>}
          color="cyan"
          title="Live Safety Broadcast"
          text="Surface urgent community alerts, active response work and resolution updates in one glance."
          tag="REAL-TIME AWARENESS"
        />

      </div>

      <section className="flowSection">

        <div className="sectionHead">

          <div>
            <span className="eyebrow">
              CLOSED-LOOP WORKFLOW
            </span>

            <h2>From report to resolution.</h2>
          </div>

        </div>

        <div className="flow">

          <Flow n="01" title="Report" sub="Photo + GPS"/>
          <Flow n="02" title="Understand" sub="AI category"/>
          <Flow n="03" title="Prioritize" sub="Risk check"/>
          <Flow n="04" title="Route" sub="Right team"/>
          <Flow n="05" title="Warn" sub="Nearby users"/>
          <Flow n="06" title="Resolve" sub="Status update"/>

        </div>

      </section>

    </div>
  );
}

function Stat({icon,value,label,danger}){

  return (
    <div className="statCard">

      <div
        className={"statIcon "+(danger?"danger":"")}
      >
        {React.cloneElement(icon,{size:19})}
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

    </div>
  );
}

function Feature({icon,color,title,text,tag}){

  return (
    <div className="featureCard">

      <div className={"featureIcon "+color}>
        {React.cloneElement(icon,{size:21})}
      </div>

      <div className="featureTag">
        {tag}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <div className="featureLine"></div>

    </div>
  );
}

function Flow({n,title,sub}){

  return (
    <div className="flowItem">

      <span>{n}</span>

      <div>
        <strong>{title}</strong>
        <small>{sub}</small>
      </div>

    </div>
  );
}

function ReportPage({online,addReport}){

  const [desc,setDesc]=useState("");
  const [image,setImage]=useState(null);
  const [loc,setLoc]=useState(null);
  const [manualEmergency,setManualEmergency]=useState(false);
  const [analysis,setAnalysis]=useState(null);
  const [busy,setBusy]=useState(false);
  const [anonymous,setAnonymous]=useState(false);
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    if(desc.trim())
      setAnalysis(aiAnalyze(desc));
    else
      setAnalysis(null);
  },[desc]);

  const getLocation=()=>{

    if(!navigator.geolocation){

      setLoc({
        lat:17.4522,
        lng:78.3911,
        source:"demo"
      });

      return;
    }

    navigator.geolocation.getCurrentPosition(

      p=>setLoc({
        lat:p.coords.latitude,
        lng:p.coords.longitude,
        source:"GPS"
      }),

      ()=>setLoc({
        lat:17.4522,
        lng:78.3911,
        source:"demo"
      })

    );
  };

  const submit=()=>{

    if(!desc.trim()){
      alert("Please describe the issue.");
      return;
    }

    setBusy(true);

    setTimeout(()=>{

      const a=analysis||aiAnalyze(desc);

      const emergency =
        manualEmergency ||
        a.suggestedPriority==="EMERGENCY";

      addReport({
        title:
          desc.slice(0,55) +
          (desc.length>55?"…":""),

        description:desc,

        category:a.category,

        priority:
          emergency
            ?"EMERGENCY"
            :a.suggestedPriority,

        lat:loc?.lat||17.4522,

        lng:loc?.lng||78.3911,

        emergency
      });

      setBusy(false);

    },600);
  };

  return (
    <div className="reportPage">

      <div className="pageHeader">

        <div>

          <span className="eyebrow">
            NEW REPORT
          </span>

          <h1>
            Tell us what needs attention.
          </h1>

          <p>
            Your photo, description and location
            create a traceable civic report.
          </p>

        </div>

        <div
          className={
            "modeBadge "+(online?"":"offline")
          }
        >
          <span></span>
          {online
            ?"LIVE SUBMISSION"
            :"OFFLINE QUEUE"}
        </div>

      </div>

      <div className="reportLayout">

        <div className="formCard">

          <label>What happened?</label>

          <textarea
            value={desc}
            onChange={e=>setDesc(e.target.value)}
            placeholder="Example: There is a large open manhole near the park entrance..."
          />

          <div className="aiHint">

            {analysis ?

              <>
                <Sparkles size={15}/>

                <span>
                  <b>AI suggestion:</b>
                  {" "}
                  {analysis.category}
                  {" • "}
                  {analysis.suggestedPriority}
                  {" priority "}
                  {analysis.duplicate
                    ?"• possible duplicate"
                    :""}
                </span>
              </>

              :

              <>
                <Info size={15}/>

                <span>
                  AI will suggest a category and
                  priority from your description.
                </span>
              </>
            }

          </div>

          <label>Evidence photo</label>

          <div
            className={
              "uploadBox "+(image?"hasImage":"")
            }
          >

            {image ?

              <img src={image}/>

              :

              <>
                <ImagePlus size={28}/>
                <strong>Add a photo</strong>
                <span>
                  JPG / PNG • optional for demo
                </span>
              </>
            }

            <input
              type="file"
              accept="image/*"
              onChange={e=>{
                const f=e.target.files?.[0];

                if(f){
                  setImage(
                    URL.createObjectURL(f)
                  );
                }
              }}
            />

          </div>

          <div className="reportMeta">

            <span>
              <Clock3 size={14}/>
              ~30 sec report
            </span>

            <span>
              <ShieldCheck size={14}/>
              privacy-first
            </span>

            <span>
              {desc.length}/500
            </span>

          </div>

          <div className="twoCol">

            <div>

              <label>Location</label>

              <button
                className={
                  "locationBtn "+(loc?"located":"")
                }
                onClick={getLocation}
              >
                <LocateFixed size={17}/>

                {loc
                  ?`${loc.source} location captured`
                  :"Capture GPS location"}
              </button>

            </div>

            <div>

              <label>Emergency safety mode</label>

              <button
                className={
                  "emergencyToggle "+
                  (manualEmergency?"on":"")
                }
                onClick={()=>
                  setManualEmergency(!manualEmergency)
                }
              >

                <span></span>

                {manualEmergency
                  ?"Highest priority enabled"
                  :"Mark as emergency"}

              </button>

            </div>

            <div>

              <label>Reporter privacy</label>

              <button
                className={
                  "privacyToggle "+
                  (anonymous?"on":"")
                }
                onClick={()=>
                  setAnonymous(!anonymous)
                }
              >

                <span></span>

                {anonymous
                  ?"Anonymous report"
                  :"Show my name"}

              </button>

            </div>

          </div>

          <div className="formActions">

            <button
              className="ghostBtn"
              onClick={()=>{
                localStorage.setItem(
                  "sociosolve_draft",
                  desc
                );

                setSaved(true);

                setTimeout(
                  ()=>setSaved(false),
                  1800
                );
              }}
            >
              <Clock3 size={16}/>

              {saved
                ?"Draft saved"
                :"Save draft"}
            </button>

            <button
              className="submitBtn"
              disabled={busy}
              onClick={submit}
            >

              {busy
                ?<RefreshCw
                    className="spin"
                    size={18}
                  />
                :<Send size={18}/>
              }

              {busy
                ?"Processing…"
                :online
                  ?"Submit report"
                  :"Save offline & sync later"}

            </button>

          </div>

        </div>

        <div className="previewCard">

          <div className="previewTop">

            <span>LIVE PREVIEW</span>

            <span
              className={
                online
                  ?"greenText"
                  :"orangeText"
              }
            >
              {online
                ?"● Connected"
                :"● Offline"}
            </span>

          </div>

          <div className="previewMap">

            <div className="mapGrid"></div>

            <div className="mapRoad rA"></div>
            <div className="mapRoad rB"></div>
            <div className="mapRoad rC"></div>

            <div className="mapPin big">
              <MapPin size={26}/>
            </div>

            <div className="mapLabel">
              Report location
            </div>

          </div>

          <div className="previewDetails">

            <div>
              <span>Category</span>
              <strong>
                {analysis?.category ||
                 "Waiting for description"}
              </strong>
            </div>

            <div>
              <span>Priority</span>

              <strong
                className={
                  (
                    manualEmergency ||
                    analysis?.suggestedPriority==="EMERGENCY"
                  )
                    ?"redText"
                    :""
                }
              >
                {manualEmergency
                  ?"EMERGENCY"
                  :analysis?.suggestedPriority||"—"}
              </strong>
            </div>

            <div>
              <span>Sync</span>

              <strong>
                {online
                  ?"Instant"
                  :"Automatic when online"}
              </strong>
            </div>

          </div>

          <div className="safetyNote">

            <ShieldCheck size={18}/>

            <div>

              <strong>Safety first</strong>

              <p>
                Emergency reports are routed to
                the authority with the highest
                priority and can warn nearby users.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

function RiskMap({reports,selected,setSelected}){

  return (
    <div className="mapPage">

      <div className="pageHeader">

        <div>

          <span className="eyebrow">
            COMMUNITY RISK MAP
          </span>

          <h1>
            Know what is happening around you.
          </h1>

          <p>
            Priority issues are visualized by
            location. Click a marker for details.
          </p>

        </div>

        <div className="legend">

          <span>
            <i className="redDot"></i>
            Emergency
          </span>

          <span>
            <i className="orangeDot"></i>
            High
          </span>

          <span>
            <i className="greenDot"></i>
            Normal
          </span>

        </div>

      </div>

      <div className="bigMap">

        <div className="mapTexture"></div>

        <div className="mapStreet s1"></div>
        <div className="mapStreet s2"></div>
        <div className="mapStreet s3"></div>
        <div className="mapStreet s4"></div>

        <div className="mapWater"></div>

        {reports.map((r,i)=>
          <button
            key={r.id}
            className={
              "marker "+r.priority.toLowerCase()
            }
            style={{
              left:(20+(i*17)%68)+"%",
              top:(24+(i*23)%58)+"%"
            }}
            onClick={()=>setSelected(r)}
          >
            <MapPin size={25}/>
            <span>{r.priority}</span>
          </button>
        )}

        <div className="youAreHere">

          <Crosshair size={18}/>
          <span>Your area</span>

        </div>

        {selected &&
          <div className="mapPopup">

            <button
              onClick={()=>setSelected(null)}
            >
              <X size={15}/>
            </button>

            <div
              className={
                "popupIcon "+
                selected.priority.toLowerCase()
              }
            >
              <AlertTriangle size={18}/>
            </div>

            <div>

              <small>
                {selected.id}
                {" • "}
                {selected.category}
              </small>

              <strong>
                {selected.title}
              </strong>

              <span>
                {selected.status}
                {" • "}
                {selected.time}
              </span>

            </div>

          </div>
        }

      </div>

      <div className="mapBottom">

        <div>
          <strong>{reports.length}</strong>
          <span>reported locations</span>
        </div>

        <div>
          <strong>
            {reports.filter(
              r=>r.priority==="EMERGENCY"
            ).length}
          </strong>
          <span>emergency risks</span>
        </div>

        <div>
          <strong>200m</strong>
          <span>warning radius demo</span>
        </div>

        <div className="mapInfo">
          <Info size={16}/>
          Demo map uses GPS-style markers.
          Connect a Maps provider for production tiles.
        </div>

      </div>

    </div>
  );
}

function TrackPage({
  reports,
  selected,
  setSelected,
  role
}){

  const [filter,setFilter]=useState("All");

  const list =
    reports.filter(
      r=>
        filter==="All" ||
        r.status===filter ||
        r.priority===filter
    );

  return (
    <div className="trackPage">

      <div className="pageHeader">

        <div>

          <span className="eyebrow">
            {role==="authority"
              ?"OPERATIONS"
              :"MY REPORTS"}
          </span>

          <h1>
            {role==="authority"
              ?"Manage community reports."
              :"Track every report."}
          </h1>

          <p>
            {role==="authority"
              ?"Assign, prioritize and update the closed-loop workflow."
              :"Stay informed from submission through resolution."}
          </p>

        </div>

      </div>

      <div className="filterBar">

        {[
          "All",
          "EMERGENCY",
          "HIGH",
          "Submitted",
          "Assigned",
          "In Progress",
          "Resolved"
        ].map(f=>
          <button
            key={f}
            className={
              filter===f?"active":""
            }
            onClick={()=>setFilter(f)}
          >
            {f}
          </button>
        )}

      </div>

      <div className="reportList">

        {list.map(r=>
          <ReportRow
            key={r.id}
            r={r}
            onClick={()=>setSelected(r)}
          />
        )}

        {!list.length &&
          <div className="emptyState">

            <FileWarning size={30}/>

            <h3>No matching reports</h3>

            <p>
              Try another filter.
            </p>

          </div>
        }

      </div>

      {selected &&
        <div className="detailModal">

          <div
            className="modalBackdrop"
            onClick={()=>setSelected(null)}
          ></div>

          <div className="modalCard">

            <button
              className="modalClose"
              onClick={()=>setSelected(null)}
            >
              <X/>
            </button>

            <div
              className={
                "modalBadge "+
                selected.priority.toLowerCase()
              }
            >
              {selected.priority}
            </div>

            <h2>
              {selected.title}
            </h2>

            <p>
              {selected.description}
            </p>

            <div className="detailGrid">

              <div>
                <span>Category</span>
                <strong>
                  {selected.category}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selected.status}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {selected.lat.toFixed(4)},
                  {" "}
                  {selected.lng.toFixed(4)}
                </strong>
              </div>

              <div>
                <span>Reported</span>
                <strong>
                  {selected.time}
                </strong>
              </div>

            </div>

            <div className="timeline">

              <Timeline
                label="Submitted"
                done
              />

              <Timeline
                label="AI analyzed"
                done
              />

              <Timeline
                label="Authority assigned"
                done={
                  selected.status!=="Submitted"
                }
              />

              <Timeline
                label="In progress"
                done={[
                  "In Progress",
                  "Resolved"
                ].includes(selected.status)}
              />

              <Timeline
                label="Resolved"
                done={
                  selected.status==="Resolved"
                }
              />

            </div>

          </div>

        </div>
      }

    </div>
  );
}

function ReportRow({r,onClick}){

  return (
    <button
      className="reportRow"
      onClick={onClick}
    >

      <div
        className={
          "rowIcon "+
          r.priority.toLowerCase()
        }
      >
        {r.priority==="EMERGENCY"
          ?<Siren size={19}/>
          :<FileWarning size={19}/>}
      </div>

      <div className="rowMain">

        <div>

          <strong>{r.title}</strong>

          <span>
            {r.id}
            {" • "}
            {r.category}
          </span>

        </div>

        <p>
          {r.description}
        </p>

      </div>

      <div className="rowRight">

        <span
          className={
            "status "+
            r.status
              .toLowerCase()
              .replaceAll(" ","-")
          }
        >
          {r.status}
        </span>

        <small>
          {r.time}
        </small>

      </div>

      <ChevronRight size={17}/>

    </button>
  );
}

function Timeline({label,done}){

  return (
    <div
      className={
        "timelineItem "+
        (done?"done":"")
      }
    >

      <span>
        {done
          ?<CheckCircle2 size={15}/>
          :<span/>
        }
      </span>

      <strong>{label}</strong>

    </div>
  );
}

function ImpactHub({
  reports,
  role,
  impact,
  setImpact,
  notify
}){

  const resolved =
    reports.filter(
      r=>r.status==="Resolved"
    ).length;

  const emergency =
    reports.filter(
      r=>r.priority==="EMERGENCY"
    ).length;

  const points =
    impact +
    reports.length*3 +
    resolved*8;

  const milestones = [

    {
      icon:<Target size={18}/>,
      title:"First Report",
      text:"You helped turn a problem into a trackable case.",
      done:reports.length>0
    },

    {
      icon:<HeartHandshake size={18}/>,
      title:"Community Helper",
      text:"Contributed to a safer local environment.",
      done:reports.length>=3
    },

    {
      icon:<ShieldCheck size={18}/>,
      title:"Safety Champion",
      text:"Helped surface a high-priority safety issue.",
      done:emergency>0
    }

  ];

  return (
    <div className="impactPage">

      <div className="pageHeader">

        <div>

          <span className="eyebrow">
            {role==="authority"
              ?"IMPACT ANALYTICS"
              :"COMMUNITY HUB"}
          </span>

          <h1>
            Small actions. Visible impact.
          </h1>

          <p>
            SocioSolve turns civic participation
            into measurable community progress.
          </p>

        </div>

        <div className="impactBadge">

          <Trophy size={17}/>

          {points} impact points

        </div>

      </div>

      <div className="impactHero">

        <div className="impactScore">

          <div className="scoreRing">

            <span>
              {Math.min(100,points)}
            </span>

            <small>IMPACT</small>

          </div>

          <div>

            <span className="eyebrow">
              YOUR CIVIC MOMENTUM
            </span>

            <h2>
              Keep the neighborhood moving.
            </h2>

            <p>
              Every useful report, update and
              resolution helps the community respond faster.
            </p>

          </div>

        </div>

        <div className="impactBars">

          <div>
            <span>Participation</span>
            <b>
              {Math.min(
                100,
                58+reports.length*6
              )}%
            </b>
          </div>

          <i>
            <em
              style={{
                width:
                  Math.min(
                    100,
                    58+reports.length*6
                  )+"%"
              }}
            ></em>
          </i>

          <div>
            <span>Safety awareness</span>
            <b>
              {Math.min(
                100,
                72+emergency*7
              )}%
            </b>
          </div>

          <i>
            <em
              style={{
                width:
                  Math.min(
                    100,
                    72+emergency*7
                  )+"%"
              }}
            ></em>
          </i>

        </div>

      </div>

      <div className="impactGrid">

        <div className="impactCard">

          <div className="cardHead">

            <div>

              <span className="eyebrow">
                MILESTONES
              </span>

              <h3>
                Community achievements
              </h3>

            </div>

            <Trophy size={19}/>

          </div>

          {milestones.map(m=>

            <div
              className={
                "milestone "+
                (m.done?"done":"")
              }
              key={m.title}
            >

              <div>
                {m.icon}
              </div>

              <section>

                <strong>
                  {m.title}
                </strong>

                <span>
                  {m.text}
                </span>

              </section>

              <b>
                {m.done
                  ?"UNLOCKED"
                  :"NEXT"}
              </b>

            </div>

          )}

        </div>

        <div className="impactCard pulseCard">

          <span className="eyebrow">
            TODAY'S PULSE
          </span>

          <h3>
            What the community is doing
          </h3>

          <div className="pulseStat">

            <UsersRound/>

            <div>
              <strong>
                {reports.length+18}
              </strong>

              <span>
                people engaged
              </span>
            </div>

          </div>

          <div className="pulseStat">

            <CheckCircle2/>

            <div>
              <strong>
                {resolved+7}
              </strong>

              <span>
                issues resolved
              </span>
            </div>

          </div>

          <div className="pulseStat">

            <Radio/>

            <div>
              <strong>
                {emergency+3}
              </strong>

              <span>
                safety broadcasts
              </span>
            </div>

          </div>

          <button
            className="primary small"
            onClick={()=>{
              setImpact(v=>v+5);
              notify(
                "+5 impact points added for community participation!"
              );
            }}
          >

            <HeartHandshake size={16}/>
            Add a community action

          </button>

        </div>

      </div>

    </div>
  );
}

function AuthorityDashboard({
  reports,
  setReports,
  notify,
  onMap
}){

  const active =
    reports.filter(
      r=>r.status!=="Resolved"
    );

  const updateStatus=(id,status)=>{

    setReports(
      prev=>
        prev.map(
          r=>
            r.id===id
              ?{...r,status}
              :r
        )
    );

    notify(
      `Report ${id} updated to ${status}.`
    );
  };

  return (
    <div className="dashboard">

      <div className="pageHeader">

        <div>

          <span className="eyebrow">
            AUTHORITY COMMAND CENTER
          </span>

          <h1>
            Good evening. Here’s the situation.
          </h1>

          <p>
            Monitor risk, route teams and keep
            citizens updated.
          </p>

        </div>

        <button
          className="primary small"
          onClick={onMap}
        >
          <MapPin size={17}/>
          Open risk map
        </button>

      </div>

      <div className="commandStats">

        <div className="commandCard red">

          <span>Emergency</span>

          <strong>
            {reports.filter(
              r=>
                r.priority==="EMERGENCY" &&
                r.status!=="Resolved"
            ).length}
          </strong>

          <small>
            Needs immediate attention
          </small>

          <Siren/>

        </div>

        <div className="commandCard">

          <span>Active queue</span>

          <strong>
            {active.length}
          </strong>

          <small>
            Across all categories
          </small>

          <Gauge/>

        </div>

        <div className="commandCard">

          <span>In progress</span>

          <strong>
            {reports.filter(
              r=>r.status==="In Progress"
            ).length}
          </strong>

          <small>
            Teams currently working
          </small>

          <RefreshCw/>

        </div>

        <div className="commandCard green">

          <span>Resolved</span>

          <strong>
            {reports.filter(
              r=>r.status==="Resolved"
            ).length}
          </strong>

          <small>
            Closed-loop completed
          </small>

          <CheckCircle2/>

        </div>

      </div>

      <div className="opsGrid">

        <div className="opsCard">

          <div className="cardHead">

            <div>

              <span className="eyebrow">
                PRIORITY QUEUE
              </span>

              <h3>
                Reports needing action
              </h3>

            </div>

            <span className="livePill">
              <i></i>
              Live
            </span>

          </div>

          {active.slice(0,6).map(r=>

            <div
              className="opsRow"
              key={r.id}
            >

              <div
                className={
                  "opsIcon "+
                  r.priority.toLowerCase()
                }
              >
                {r.priority==="EMERGENCY"
                  ?<Siren size={17}/>
                  :<AlertTriangle size={17}/>}
              </div>

              <div className="opsInfo">

                <strong>
                  {r.title}
                </strong>

                <span>
                  {r.id}
                  {" • "}
                  {r.category}
                </span>

              </div>

              <select
                value={r.status}
                onChange={
                  e=>
                    updateStatus(
                      r.id,
                      e.target.value
                    )
                }
              >

                <option>Submitted</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Resolved</option>

              </select>

            </div>
          )}

        </div>

        <div className="opsCard mapMini">

          <div className="cardHead">

            <div>

              <span className="eyebrow">
                RISK SNAPSHOT
              </span>

              <h3>
                Priority clusters
              </h3>

            </div>

          </div>

          <div className="miniMap">

            <div className="miniLines"></div>

            {reports.slice(0,6).map((r,i)=>

              <span
                key={i}
                className={
                  "miniMarker "+
                  r.priority.toLowerCase()
                }
                style={{
                  left:(15+i*13)+"%",
                  top:(25+(i*17)%55)+"%"
                }}
              ></span>

            )}

          </div>

          <button
            className="fullBtn"
            onClick={onMap}
          >
            Open full risk map
            <ChevronRight size={15}/>
          </button>

        </div>

      </div>

      <div className="aiBanner">

        <div className="aiOrb">
          <Sparkles size={22}/>
        </div>

        <div>

          <strong>
            AI assistance is active
          </strong>

          <p>
            Category and duplicate suggestions
            are advisory. Authorized staff retain
            final control over priority, category
            and routing.
          </p>

        </div>

        <ShieldCheck size={23}/>

      </div>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App/>);