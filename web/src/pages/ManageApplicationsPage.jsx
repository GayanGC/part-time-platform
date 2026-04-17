import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection, query, where, getDocs,
  doc, getDoc, updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { QRCodeSVG } from "qrcode.react";

function generateQRToken(jobId, studentUid) {
  const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
  const ts   = Date.now().toString(36).toUpperCase();
  return `PT-${jobId.slice(0, 6)}-${studentUid.slice(0, 6)}-${rand}-${ts}`;
}

export default function ManageApplicationsPage() {
  const { jobId } = useParams();

  const [job, setJob]           = useState(null);
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const jSnap = await getDoc(doc(db, "jobs", jobId));
        if (jSnap.exists()) setJob({ id: jSnap.id, ...jSnap.data() });

        const q    = query(collection(db, "applications"), where("jobId", "==", jobId));
        const snap = await getDocs(q);
        setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [jobId]);

  async function handleApprove(app) {
    try {
      setUpdating(app.id);
      const qrCode = generateQRToken(jobId, app.studentUid);
      await updateDoc(doc(db, "applications", app.id), {
        status: "approved", qrCode, approvedAt: new Date().toISOString(),
      });
      setApps((p) => p.map((a) => a.id === app.id ? { ...a, status: "approved", qrCode } : a));
    } catch (err) {
      alert("Approve failed: " + err.message);
    } finally {
      setUpdating(null);
    }
  }

  async function handleReject(app) {
    try {
      setUpdating(app.id);
      await updateDoc(doc(db, "applications", app.id), {
        status: "rejected", rejectedAt: new Date().toISOString(),
      });
      setApps((p) => p.map((a) => a.id === app.id ? { ...a, status: "rejected" } : a));
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="spinner mt-24" />;

  const pending  = apps.filter((a) => a.status === "pending");
  const approved = apps.filter((a) => a.status === "approved");
  const rejected = apps.filter((a) => a.status === "rejected");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-100">Manage Applications</h1>
        {job && (
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="badge badge-poster">📋 {job.title}</span>
            <span className="text-slate-500 text-sm self-center">📍 {job.location}</span>
            <span className="text-slate-500 text-sm self-center">💰 LKR {Number(job.salary).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Count pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Pending",  count: pending.length,  color: "text-amber-400" },
          { label: "Approved", count: approved.length, color: "text-emerald-400" },
          { label: "Rejected", count: rejected.length, color: "text-red-400" },
        ].map(({ label, count, color }) => (
          <div key={label}
            className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2">
            <span className={`font-black text-lg ${color}`}>{count}</span>
            <span className="text-slate-500 text-xs uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4 opacity-40">📭</div>
          <p className="font-semibold text-slate-400">No applications yet.</p>
          <p className="text-sm mt-1">Share your job so students can apply.</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Pending */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-amber-400 mb-4">⏳ Pending Review</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-slate-500 text-xs uppercase tracking-widest">
                    <tr>
                      {["Student","University","Applied","Actions"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((app) => (
                      <tr key={app.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-200">{app.studentName || "—"}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{app.studentUid?.slice(0,10)}…</p>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{app.university || "—"}</td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button id={`approve-${app.id}`}
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(app)}
                              disabled={updating === app.id}>
                              {updating === app.id ? "…" : "✓ Approve"}
                            </button>
                            <button id={`reject-${app.id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(app)}
                              disabled={updating === app.id}>
                              ✗ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Approved QR cards */}
          {approved.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-emerald-400 mb-4">✅ Approved — QR Codes</h2>
              <div className="flex flex-wrap gap-5">
                {approved.map((app) => (
                  <div key={app.id}
                    className="bg-dark-600/60 border border-white/[0.08] rounded-2xl p-5 text-center w-52">
                    <p className="font-bold text-slate-100 text-sm">{app.studentName || "—"}</p>
                    <p className="text-xs text-slate-500 mb-4">{app.university || "—"}</p>
                    {app.qrCode ? (
                      <>
                        <div className="flex justify-center p-3 bg-white rounded-xl mb-3">
                          <QRCodeSVG value={app.qrCode} size={136} />
                        </div>
                        <p className="text-[10px] text-slate-600 break-all leading-tight">{app.qrCode}</p>
                      </>
                    ) : (
                      <p className="text-slate-500 text-xs">QR not generated</p>
                    )}
                    <span className="badge badge-approved mt-3">✓ Approved</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-red-400 mb-4">❌ Rejected</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.04] text-slate-500 text-xs uppercase tracking-widest">
                    <tr>
                      {["Student","University","Applied","Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rejected.map((app) => (
                      <tr key={app.id} className="border-t border-white/[0.04]">
                        <td className="px-5 py-4 font-semibold text-slate-300">{app.studentName || "—"}</td>
                        <td className="px-5 py-4 text-slate-400">{app.university || "—"}</td>
                        <td className="px-5 py-4 text-slate-500 text-xs">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-4"><span className="badge badge-rejected">Rejected</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
