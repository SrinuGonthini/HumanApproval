import React, { useEffect, useState } from "react";
import API from "./api";
import './App.css'

function timeSince(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function App() {
  const [approvals, setApprovals] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", email: "" });
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      const res = await API.get("/");
      setApprovals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 5000);
    return () => clearInterval(t);
  }, []);

  const createApproval = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/", form);
      setForm({ title: "", description: "", email: "" });
      fetch();
    } catch (err) {
      console.error(err);
      alert("Create failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Main">
      <h1>Human-in-the-Loop (HITL) Dashboard</h1>

      <section>
        <h3>Create Approval</h3>
        <form onSubmit={createApproval} style={{ display: "grid", gap: 8 }}>
          <input type="text" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} required />
          <input type="text" placeholder="Approver email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
          <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Approval"}</button>
        </form>
      </section>

      <section>
        <h3>Approvals</h3>
        {approvals.length === 0 && <p>No approvals yet</p>}
        {approvals.map(a => (
          <div key={a.approvalId} className="One">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{a.title}</strong>
              <span>{a.status}</span>
            </div>
            <div style={{ color: "#555" }}>{a.description}</div>
            <div style={{ marginTop: 8 }}>
              Attempts: {a.attempts} / {a.maxAttempts} — Last attempt: {timeSince(a.lastAttemptAt)}
            </div>
            <div style={{ marginTop: 8 }}>
              {a.status === "pending" && (
                <>
                  <a href={`http://localhost:3500/api/approvals/response?approvalId=${a.approvalId}&action=approve`} style={{ marginRight: 8 }}>Approve</a>
                  <a href={`http://localhost:3500/api/approvals/response?approvalId=${a.approvalId}&action=reject`}>Reject</a>
                </>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
