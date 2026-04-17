import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  collection, query, where, getDocs, doc, updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/* ── Scanner States ─────────────────────────────────────────── */
const STATE = {
  IDLE:      "idle",
  STARTING:  "starting",
  SCANNING:  "scanning",
  FOUND:     "found",
  ERROR:     "error",
};

export default function AttendanceScannerPage() {
  const [scannerState, setScannerState] = useState(STATE.IDLE);
  const [scanResult, setScanResult]     = useState(null); // { app, status }
  const [errorMsg, setErrorMsg]         = useState("");
  const [recentScans, setRecentScans]   = useState([]); // last 5 scans

  const html5QrRef = useRef(null);
  const isScanning  = useRef(false);

  /* ── Start camera ── */
  const startScanner = useCallback(async () => {
    setScannerState(STATE.STARTING);
    setErrorMsg("");

    try {
      // List cameras first
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error("No camera found on this device.");
      }

      const cameraId = cameras[0].id; // use first (front) camera
      html5QrRef.current = new Html5Qrcode("qr-reader");

      await html5QrRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        undefined // suppress qr not found warnings
      );

      isScanning.current = true;
      setScannerState(STATE.SCANNING);
    } catch (err) {
      setErrorMsg(err.message || "Could not start camera.");
      setScannerState(STATE.ERROR);
    }
  }, []);

  /* ── Stop camera ── */
  const stopScanner = useCallback(async () => {
    if (html5QrRef.current && isScanning.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch { /* ignore */ }
      isScanning.current = false;
    }
    setScannerState(STATE.IDLE);
  }, []);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  /* ── QR detected ── */
  async function onScanSuccess(decodedText) {
    if (!isScanning.current) return;

    // Pause scanning while we process
    isScanning.current = false;
    setScannerState(STATE.FOUND);

    try {
      // Look up the QR token in Firestore
      const q    = query(collection(db, "applications"), where("qrCode", "==", decodedText));
      const snap = await getDocs(q);

      if (snap.empty) {
        setScanResult({ status: "not_found", qrCode: decodedText });
        return;
      }

      const appDoc  = snap.docs[0];
      const appData = { id: appDoc.id, ...appDoc.data() };

      if (appData.status === "completed") {
        setScanResult({ status: "already_completed", app: appData });
        return;
      }

      // Mark as completed
      await updateDoc(doc(db, "applications", appDoc.id), {
        status:      "completed",
        attendedAt:  new Date().toISOString(),
      });

      const updatedApp = { ...appData, status: "completed", attendedAt: new Date().toISOString() };
      setScanResult({ status: "success", app: updatedApp });

      // Add to recent scans log
      setRecentScans((prev) => [
        { ...updatedApp, scannedAt: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setScanResult({ status: "error", message: err.message });
    }
  }

  /* ── Reset to scan again ── */
  async function handleScanAnother() {
    setScanResult(null);
    isScanning.current = true;
    setScannerState(STATE.SCANNING);
    // The html5qrcode instance is still running in DOM — resume it
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-100">Attendance Scanner 📷</h1>
        <p className="text-slate-500 text-sm mt-1">
          Scan a student's QR code to mark their attendance as completed.
        </p>
      </div>

      {/* ── Scanner Card ── */}
      <div className="bg-dark-600/60 border border-white/[0.08] rounded-2xl p-6 mb-6">

        {/* QR reader viewport */}
        <div
          id="qr-reader"
          className={`w-full rounded-xl overflow-hidden mb-5 transition-all duration-300
            ${scannerState === STATE.SCANNING ? "ring-2 ring-brand-500 shadow-glow" : ""}`}
          style={{ minHeight: scannerState !== STATE.IDLE ? 280 : 0 }}
        />

        {/* IDLE state */}
        {scannerState === STATE.IDLE && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 opacity-60">📷</div>
            <p className="text-slate-400 text-sm mb-6">
              Camera is off. Click the button below to start scanning.
            </p>
            <button id="start-scanner-btn" className="btn btn-primary" onClick={startScanner}>
              Start Camera & Scan QR
            </button>
          </div>
        )}

        {/* STARTING */}
        {scannerState === STATE.STARTING && (
          <div className="flex items-center justify-center gap-3 py-4 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-sm">Starting camera…</span>
          </div>
        )}

        {/* SCANNING — controls */}
        {scannerState === STATE.SCANNING && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-semibold">Scanning…</span>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Point the camera at a student's QR code.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={stopScanner}>
              Stop Camera
            </button>
          </div>
        )}

        {/* FOUND — result */}
        {scannerState === STATE.FOUND && scanResult && (
          <ScanResultPanel result={scanResult} onScanAnother={handleScanAnother} onStop={stopScanner} />
        )}

        {/* ERROR */}
        {scannerState === STATE.ERROR && (
          <div className="text-center py-4">
            <div className="alert alert-error mb-4">{errorMsg}</div>
            <p className="text-slate-500 text-xs mb-4">
              Make sure you have granted camera permission in your browser.
            </p>
            <button className="btn btn-primary" onClick={startScanner}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* ── Recent Scans Log ── */}
      {recentScans.length > 0 && (
        <div className="bg-dark-600/60 border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-200 mb-4">Recent Scans</h2>
          <div className="space-y-3">
            {recentScans.map((s, i) => (
              <div key={i}
                className="flex items-center justify-between bg-white/[0.03] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{s.studentName}</p>
                  <p className="text-xs text-slate-500">{s.university || "—"} · {s.jobTitle || "—"}</p>
                </div>
                <div className="text-right">
                  <span className="badge badge-approved text-[10px]">✓ Attended</span>
                  <p className="text-xs text-slate-600 mt-1">{s.scannedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Scan Result Panel ─────────────────────────────────────── */
function ScanResultPanel({ result, onScanAnother, onStop }) {
  if (result.status === "success") {
    return (
      <div className="text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center
                        mx-auto mb-4 text-3xl">✅</div>
        <h3 className="text-xl font-black text-emerald-400">Attendance Recorded!</h3>
        <p className="text-slate-300 text-sm mt-1 font-semibold">{result.app.studentName}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {result.app.university} · {result.app.jobTitle || "Job"}
        </p>
        <p className="text-slate-600 text-xs mt-0.5">
          Marked at {new Date().toLocaleTimeString()}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <button className="btn btn-primary" onClick={onScanAnother}>
            Scan Another →
          </button>
          <button className="btn btn-ghost" onClick={onStop}>
            Done
          </button>
        </div>
      </div>
    );
  }

  if (result.status === "already_completed") {
    return (
      <div className="text-center animate-fade-up">
        <div className="text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-bold text-amber-400">Already Attended</h3>
        <p className="text-slate-400 text-sm mt-1">
          <strong>{result.app.studentName}</strong> has already been marked as attended.
        </p>
        <button className="btn btn-ghost btn-sm mt-5" onClick={onScanAnother}>
          Scan Another
        </button>
      </div>
    );
  }

  if (result.status === "not_found") {
    return (
      <div className="text-center animate-fade-up">
        <div className="text-4xl mb-3">❓</div>
        <h3 className="text-lg font-bold text-red-400">QR Code Not Recognised</h3>
        <p className="text-slate-500 text-xs mt-2 font-mono break-all max-w-xs mx-auto">
          {result.qrCode}
        </p>
        <p className="text-slate-500 text-sm mt-2">
          This QR code doesn't match any approved application.
        </p>
        <button className="btn btn-ghost btn-sm mt-5" onClick={onScanAnother}>
          Try Again
        </button>
      </div>
    );
  }

  // Generic error
  return (
    <div className="text-center animate-fade-up">
      <div className="text-4xl mb-3">❌</div>
      <h3 className="text-lg font-bold text-red-400">Scan Error</h3>
      <p className="text-slate-500 text-sm mt-1">{result.message}</p>
      <button className="btn btn-ghost btn-sm mt-5" onClick={onScanAnother}>
        Try Again
      </button>
    </div>
  );
}
