import { useEffect, useMemo, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const fun = {
  needValentine: [
    "Oru try... Eni athava biriyani Kittiyalooo",
    "Kittiyal Ooty illenki Chattii",
    "Ingane okke nadanna mathiyooo",
  ],

  loadingEmployees: [
    "Kaathirikkuuu sundharii sundharaaa",
  ],

  loadEmployeesError: [
    "Aval poyedaaaaaa.....",
  ],

  submitSuccess: [
    "Ijj sundari allenn aaraa paranje... ❤️",
    "Ninnekkondonnum koottiya koodilla, nalla prayandalloo, valla panikkum podoo",
    "Enikkum ishtamaan, kalyanam kazhikkan thayyarumaan, appo enthaann vechaa..! 💍",
    "Parasparam onn cheranulla oravasaravum nammal pazhakkaruth",
    "Nokki irunnoo, ippo kittum...!",
    "Kuttyy onn manass vechaa, ee kalavara namukkoru maniyarayakkam 💘",
    "Ente nenjaake neeyalle....",
    "Porunnoo ente koode",
  ],

  submitError: [
    "Ninakk kalaparamayittulla kazhiv undoo, ninne nalalu ariyumoo... 👀",
    "Dont try play fool with me Nikesh....",
    "Velachil edukkaruth kettooo...",
    "Oh god, You againnnn, veendum ningalooo!!!!",
    "Koutham lesham kooduthala, maappakkanam!!",
    "Ninne kandappo thanne enikk manassilayii, nee verum koothara alla looka koothara aanenn",
  ],

  dupeIp: [
    "Ninakk kalaparamayittulla kazhiv undoo, ninne nalalu ariyumoo... 👀",
    "Dont try play fool with me Nikesh....",
    "Velachil edukkaruth kettooo...",
    "Oh god, You againnnn, veendum ningalooo!!!!",
    "Koutham lesham kooduthala, maappakkanam!!",
    "Ninne kandappo thanne enikk manassilayii, nee verum koothara alla looka koothara aanenn",
  ],

  invalidEmployee: [
    "That valentine ID looks fake and Cupid is unimpressed 🕵️",
    "Invalid ID because Cupid now has trust issues 🫥",
    "Nice try, that ID is not in the love database 📇",
  ],

  employeeNotFound: [
    "That valentine vanished into the mist, try again 🌫️",
    "Employee not found and Cupid checked twice 🔍",
    "Nope, that person is off the love grid 📡",
  ],

  adminNeedPassword: [
    "Pha paranari nee aaroodaan evide ninnaan kalikkunnathenn orma venom? 🤨",
    "Ezheech podooo",
    "Thurakkilla makaneeee",
  ],

  adminGranted: [
    "Access granted, proceed to the love stats 📊",
    "Welcome Admin, may your spreadsheets be romantic 📈",
    "You’re in, try not to trip on the roses 🌹",
    "Open sesame and the stats await 🧮",
    "Authorized, Cupid salutes you 🫡",
  ],

  adminUnauthorized: [
    "Pha paranari nee aaroodaan evide ninnaan kalikkunnathenn orma venom? 🤨",
    "Ezheech podooo",
    "Thurakkilla makaneeee",
  ],

  resultsLoading: [
    "Counting love letters in real time 💌",
    "Tallying hearts and spreadsheets 📊",
    "Asking Cupid to do math 🧮",
    "Crunching votes like cookies 🍪",
    "Summoning the leaderboard with dramatic flair ✨",
  ],

  resultsEmpty: [
    "No votes yet because Cupid is still warming up 🔥",
    "The leaderboard is empty—love takes time ⏳",
    "Zero votes and the romantic suspense is real 🎭",
    "Nothing yet because Cupid is tying his shoelaces 👟",
    "No love data yet, the drama builds 📽️",
  ],

  resultsError: [
    "Couldn’t load results because Cupid dropped the clipboard 📋",
    "Stats are hiding, please try again 🫣",
    "Results failed and the love server needs a pep talk 📣",
    "The leaderboard ran away with the chocolates 🍫",
    "Error loading results because Cupid needs coffee ☕",
  ],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const formatVoteError = (rawMessage) => {
  if (!rawMessage) return pick(fun.submitError);
  if (rawMessage.toLowerCase().includes("ip address")) return pick(fun.dupeIp);
  if (rawMessage.toLowerCase().includes("invalid"))
    return pick(fun.invalidEmployee);
  if (rawMessage.toLowerCase().includes("not found"))
    return pick(fun.employeeNotFound);
  return pick(fun.submitError);
};

const formatResultsError = (rawMessage, status) => {
  if (status === 401) return pick(fun.adminUnauthorized);
  return pick(fun.resultsError);
};

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valentineId, setValentineId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState(
    typeof window !== "undefined" && window.location.hash === "#/admin"
      ? "admin"
      : "vote",
  );
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem("adminKey") || "",
  );
  const [adminInput, setAdminInput] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(
    pick(fun.loadingEmployees),
  );
  const [resultsLoadingMessage, setResultsLoadingMessage] = useState(
    pick(fun.resultsLoading),
  );
  const [emptyResultsMessage, setEmptyResultsMessage] = useState(
    pick(fun.resultsEmpty),
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadingMessage(pick(fun.loadingEmployees));
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/employees`);
        if (!res.ok) {
          throw new Error("Failed to load employees.");
        }
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        setError(pick(fun.loadEmployeesError));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        if (cancelled) return;
        setDeviceId(result.visitorId);
      } catch (err) {
        if (cancelled) return;
        setDeviceId("");
      }
    };
    initFingerprint();
    return () => {
      cancelled = true;
    };
  }, []);

  const valentineOptions = useMemo(() => employees, [employees]);

  useEffect(() => {
    const onHashChange = () => {
      setView(window.location.hash === "#/admin" ? "admin" : "vote");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const loadResults = async () => {
    setResultsLoading(true);
    setResultsLoadingMessage(pick(fun.resultsLoading));
    setResultsError("");
    try {
      const res = await fetch(`${API_URL}/api/votes/results`, {
        headers: { "x-admin-password": adminKey },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data?.error || "Failed to load results.";
        throw { message, status: res.status };
      }
      const data = await res.json();
      setResults(data.results || []);
      setEmptyResultsMessage(pick(fun.resultsEmpty));
    } catch (err) {
      setResultsError(formatResultsError(err?.message, err?.status));
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "admin" && adminKey) {
      loadResults();
    }
  }, [view, adminKey]);

  const canSendDevice = deviceId && deviceId.length > 0;
  const canSubmit = valentineId && canSendDevice && !submitting && !success;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!canSendDevice) {
      setError(pick(fun.submitError));
      return;
    }

    if (!valentineId) {
      setError(pick(fun.needValentine));
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
        },
        body: JSON.stringify({ valentineId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Vote failed.");
      }

      setSuccess(pick(fun.submitSuccess));
    } catch (err) {
      setError(formatVoteError(err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="glow" />
      <main className="card">
        <header>
          <p className="eyebrow">Company Valentine Poll</p>
          <h1>Pick Your Valentine</h1>
          <p className="subtitle">
            Select the colleague who made your workdays brighter. Glitter
            optional.
          </p>
          <div className="tabs">
            <button
              type="button"
              className={view === "vote" ? "tab active" : "tab"}
              onClick={() => (window.location.hash = "#/")}
            >
              Vote
            </button>
            <button
              type="button"
              className={view === "admin" ? "tab active" : "tab"}
              onClick={() => (window.location.hash = "#/admin")}
            >
              Admin
            </button>
          </div>
        </header>

        {view === "vote" ? (
          <>
            <form onSubmit={handleSubmit} className="form">
              <label className="field">
                <span>Your valentine</span>
                <select
                  value={valentineId}
                  onChange={(e) => setValentineId(e.target.value)}
                  disabled={loading || success}
                  required
                >
                  <option value="">Select a valentine</option>
                  {valentineOptions.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name}
                      {employee.department ? ` — ${employee.department}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" disabled={!canSubmit}>
                {submitting ? "Submitting..." : "Submit Vote"}
              </button>
            </form>

            {loading && <p className="hint">{loadingMessage}</p>}
            {error && <p className="notice error">{error}</p>}
            {success && <p className="notice success">{success}</p>}

            <p className="footnote">
              One vote per user. Duplicate submissions are blocked faster than a
              bad pickup line.
            </p>
          </>
        ) : (
          <div className="admin">
            <div className="admin-header">
              <h2>Results</h2>
              {adminKey && (
                <button
                  type="button"
                  onClick={loadResults}
                  disabled={resultsLoading}
                >
                  {resultsLoading ? "Refreshing..." : "Refresh"}
                </button>
              )}
            </div>
            {!adminKey ? (
              <form
                className="form admin-login"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!adminInput.trim()) {
                    setAdminMessage(pick(fun.adminNeedPassword));
                    return;
                  }
                  sessionStorage.setItem("adminKey", adminInput.trim());
                  setAdminKey(adminInput.trim());
                  setAdminInput("");
                  setAdminMessage(pick(fun.adminGranted));
                }}
              >
                <label className="field">
                  <span>Admin password</span>
                  <input
                    type="password"
                    value={adminInput}
                    onChange={(e) => setAdminInput(e.target.value)}
                    placeholder="Enter admin password"
                  />
                </label>
                <button type="submit">Unlock Results</button>
                {adminMessage && <p className="hint">{adminMessage}</p>}
              </form>
            ) : (
              <>
                {resultsLoading && (
                  <p className="hint">{resultsLoadingMessage}</p>
                )}
                {resultsError && <p className="notice error">{resultsError}</p>}
                {!resultsLoading && !resultsError && results.length === 0 && (
                  <p className="hint">{emptyResultsMessage}</p>
                )}
                {results.length > 0 && (
                  <div className="table">
                    <div className="row head">
                      <span>Name</span>
                      <span>Department</span>
                      <span className="count">Votes</span>
                    </div>
                    {results.map((row) => (
                      <div className="row" key={row.valentineId}>
                        <span>{row.name}</span>
                        <span>{row.department || "—"}</span>
                        <span className="count">{row.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
