"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://valentine-backend-a68b.onrender.com";

const fun = {
  needValentine: [
    "Pick a valentine—Cupid refuses empty forms",
    "Select a valentine before Cupid starts filing complaints",
    "You missed the most important dropdown, Casanova",
    "No selection is like sending a love letter without a stamp",
    "Choose a valentine or Cupid starts charging late fees",
    "Pick someone before the chocolates melt"
  ],
  loadingEmployees: [
    "Summoning the employee list with dramatic flair",
    "Warming up the Cupid database—stand by",
    "Fetching names faster than a love triangle starts",
    "Assembling the roster of romantic possibilities",
    "Checking the office crush registry"
  ],
  loadEmployeesError: [
    "We lost the employee list in a glitter storm",
    "Cupid misplaced the roster again, classic",
    "The list ghosted us, tragic",
    "Roster not found—Cupid blames Mercury retrograde",
    "We asked for names and got vibes instead"
  ],
  submitSuccess: [
    "Vote delivered—Cupid updated his spreadsheet",
    "Success, your valentine was notified by carrier pigeon",
    "Vote recorded and love is now in the database",
    "Sweet, your vote landed safely in Cupid's inbox",
    "Done, Cupid stamped this with a heart seal"
  ],
  submitError: [
    "Vote failed—Cupid tripped over a cable",
    "Nope, the love server said not today",
    "Error because Cupid's Wi‑Fi is acting single",
    "System error, Cupid is rebooting his wings",
    "Something broke, blame the chocolates"
  ],
  dupeIp: [
    "One vote per user—Cupid saw you double‑click",
    "Nice try, the user bouncer says you already voted",
    "Duplicate detected because love is a one‑time offer",
    "Sorry Romeo, this user has already serenaded",
    "No doubles allowed—Cupid has receipts"
  ],
  invalidEmployee: [
    "That valentine doesn't exist in this universe",
    "Invalid pick—Cupid is confused",
    "That name isn't on the list, plot twist",
    "Fake ID detected and Cupid is not impressed",
    "That valentine is fictional, try reality"
  ],
  employeeNotFound: [
    "That valentine vanished into the mist",
    "Employee not found, maybe on a romance sabbatical",
    "Nope, that person is off the love grid",
    "Cupid checked twice and still missing",
    "That name is a myth in the office lore"
  ],
  adminNeedPassword: [
    "Password required because Cupid insists on security",
    "Admin access denied until you whisper the secret word",
    "No password, no peeking—rules of love apply",
    "Say the magic word or the vault stays shut",
    "Admin gate locked and Cupid hid the key"
  ],
  adminGranted: [
    "Access granted, proceed to the love stats",
    "Welcome Admin, may your spreadsheets be romantic",
    "You're in, try not to trip on the roses",
    "Open sesame and the stats await",
    "Authorized, Cupid salutes you"
  ],
  adminUnauthorized: [
    "Wrong password and Cupid just shook his head",
    "Access denied because the love vault stays locked",
    "Nope, the admin door remains romantically sealed",
    "Incorrect, Cupid activated the glitter alarm",
    "Access denied, try the password not the vibes"
  ],
  resultsLoading: [
    "Counting love letters in real time",
    "Tallying hearts and spreadsheets",
    "Asking Cupid to do math",
    "Crunching votes like cookies",
    "Summoning the leaderboard with dramatic flair"
  ],
  resultsEmpty: [
    "No votes yet because Cupid is still warming up",
    "The leaderboard is empty—love takes time",
    "Zero votes and the romantic suspense is real",
    "Nothing yet because Cupid is tying his shoelaces",
    "No love data yet, the drama builds"
  ],
  resultsError: [
    "Couldn't load results because Cupid dropped the clipboard",
    "Stats are hiding, please try again",
    "Results failed and the love server needs a pep talk",
    "The leaderboard ran away with the chocolates",
    "Error loading results because Cupid needs coffee"
  ]
};

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

const formatVoteError = (rawMessage?: string) => {
  if (!rawMessage) return pick(fun.submitError);
  if (rawMessage.toLowerCase().includes("ip address")) return pick(fun.dupeIp);
  if (rawMessage.toLowerCase().includes("invalid")) return pick(fun.invalidEmployee);
  if (rawMessage.toLowerCase().includes("not found")) return pick(fun.employeeNotFound);
  return pick(fun.submitError);
};

const formatResultsError = (rawMessage?: string, status?: number) => {
  if (status === 401) return pick(fun.adminUnauthorized);
  return pick(fun.resultsError);
};

interface Employee {
  _id: string;
  name: string;
  department?: string;
}

interface Result {
  valentineId: string;
  name: string;
  department?: string;
  count: number;
}

export default function ValentinePoll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [valentineId, setValentineId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState<"vote" | "admin">("vote");
  const [results, setResults] = useState<Result[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [adminInput, setAdminInput] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(pick(fun.loadingEmployees));
  const [resultsLoadingMessage, setResultsLoadingMessage] = useState(pick(fun.resultsLoading));
  const [emptyResultsMessage, setEmptyResultsMessage] = useState(pick(fun.resultsEmpty));

  useEffect(() => {
    const storedKey = sessionStorage.getItem("adminKey");
    if (storedKey) setAdminKey(storedKey);
    
    if (window.location.hash === "#/admin") {
      setView("admin");
    }
  }, []);

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
      } catch {
        setError(pick(fun.loadEmployeesError));
      } finally {
        setLoading(false);
      }
    };

    load();
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
        headers: { "x-admin-password": adminKey }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data?.error || "Failed to load results.";
        throw { message, status: res.status };
      }
      const data = await res.json();
      setResults(data.results || []);
      setEmptyResultsMessage(pick(fun.resultsEmpty));
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      setResultsError(formatResultsError(error?.message, error?.status));
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "admin" && adminKey) {
      loadResults();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, adminKey]);

  const canSubmit = valentineId && !submitting && !success;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!valentineId) {
      setError(pick(fun.needValentine));
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valentineId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Vote failed.");
      }

      setSuccess(pick(fun.submitSuccess));
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(formatVoteError(error?.message));
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
            Select the colleague who made your workdays brighter. Glitter optional.
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
                  disabled={loading || !!success}
                  required
                >
                  <option value="">Select a valentine</option>
                  {valentineOptions.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name}{employee.department ? ` — ${employee.department}` : ""}
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
              One vote per user. Duplicate submissions are blocked faster than a bad pickup line.
            </p>
          </>
        ) : (
          <div className="admin">
            <div className="admin-header">
              <h2>Results</h2>
              {adminKey && (
                <button type="button" onClick={loadResults} disabled={resultsLoading}>
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
                {resultsLoading && <p className="hint">{resultsLoadingMessage}</p>}
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
