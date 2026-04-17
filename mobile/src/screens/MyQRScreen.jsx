import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Share,
} from "react-native";
import {
  collection, query, where, getDocs, orderBy,
} from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadow } from "../theme/tokens";

const STATUS_MAP = {
  pending:   { label: "Pending Review",  emoji: "⏳", color: colors.warning, bg: "rgba(245,158,11,0.12)" },
  approved:  { label: "Approved",        emoji: "✅", color: colors.success, bg: "rgba(34,197,94,0.12)"  },
  rejected:  { label: "Rejected",        emoji: "❌", color: colors.danger,  bg: "rgba(239,68,68,0.12)"  },
  completed: { label: "Attended",        emoji: "🏁", color: colors.info,    bg: "rgba(56,189,248,0.12)" },
};

export default function MyQRScreen() {
  const { currentUser } = useAuth();

  const [apps, setApps]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  async function fetchApps() {
    try {
      const q    = query(
        collection(db, "applications"),
        where("studentUid", "==", currentUser.uid),
        orderBy("appliedAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setApps(list);

      // Auto-expand first approved app
      const firstApproved = list.find((a) => a.status === "approved" && a.qrCode);
      if (firstApproved) setExpandedId(firstApproved.id);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchApps(); }, [currentUser]);

  function onRefresh() { setRefreshing(true); fetchApps(); }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  const approved  = apps.filter((a) => a.status === "approved");
  const others    = apps.filter((a) => a.status !== "approved");

  return (
    <ScrollView
      style={s.wrapper}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
    >
      {/* Header */}
      <Text style={s.heading}>My Applications & QR Codes</Text>
      <Text style={s.subheading}>Pull down to refresh. Approved apps show your QR.</Text>

      {/* Summary row */}
      <View style={s.summaryRow}>
        {[
          { label: "Pending",  count: apps.filter((a) => a.status === "pending").length,   color: colors.warning },
          { label: "Approved", count: approved.length,                                     color: colors.success },
          { label: "Rejected", count: apps.filter((a) => a.status === "rejected").length,  color: colors.danger  },
        ].map(({ label, count, color }) => (
          <View key={label} style={s.pill}>
            <Text style={[s.pillNum, { color }]}>{count}</Text>
            <Text style={s.pillLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {apps.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📭</Text>
          <Text style={s.emptyTitle}>No applications yet</Text>
          <Text style={s.emptySubtitle}>Go to Find Jobs and apply to see them here.</Text>
        </View>
      ) : (
        <>
          {/* ── Approved with QR codes ── */}
          {approved.length > 0 && (
            <>
              <Text style={s.sectionTitle}>✅ Approved — Show QR to Poster</Text>
              {approved.map((app) => (
                <ApprovedCard
                  key={app.id}
                  app={app}
                  isExpanded={expandedId === app.id}
                  onToggle={() => toggleExpand(app.id)}
                />
              ))}
            </>
          )}

          {/* ── Other applications ── */}
          {others.length > 0 && (
            <>
              <Text style={s.sectionTitle}>All Applications</Text>
              {others.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

/* ── Approved Card (with QR) ─────────────────────────────────── */
function ApprovedCard({ app, isExpanded, onToggle }) {
  return (
    <View style={s.card}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={s.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.jobTitle} numberOfLines={1}>{app.jobTitle || "Job Application"}</Text>
            <Text style={s.univText}>{app.university || "—"}</Text>
          </View>
          <View style={[s.statusPill, { backgroundColor: STATUS_MAP.approved.bg }]}>
            <Text style={[s.statusText, { color: STATUS_MAP.approved.color }]}>
              {STATUS_MAP.approved.emoji} Approved
            </Text>
          </View>
        </View>

        <View style={[s.toggleHint, isExpanded && s.toggleHintOpen]}>
          <Text style={s.toggleText}>
            {isExpanded ? "Hide QR Code ▲" : "Show QR Code 📲 ▼"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* QR Panel */}
      {isExpanded && app.qrCode && (
        <View style={s.qrPanel}>
          <Text style={s.qrHint}>
            Show this QR to the Job Poster for attendance
          </Text>
          <View style={s.qrBox}>
            <QRCode
              value={app.qrCode}
              size={200}
              color="#000"
              backgroundColor="#fff"
            />
          </View>
          <Text style={s.qrToken} numberOfLines={2} ellipsizeMode="middle">
            {app.qrCode}
          </Text>
          <Text style={s.qrDate}>
            Approved {app.approvedAt
              ? new Date(app.approvedAt).toLocaleDateString("en-LK", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "—"}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ── Generic App Card ────────────────────────────────────────── */
function AppCard({ app }) {
  const cfg = STATUS_MAP[app.status] || STATUS_MAP.pending;
  return (
    <View style={[s.card, s.cardSmall]}>
      <View style={s.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.jobTitle} numberOfLines={1}>{app.jobTitle || "Job Application"}</Text>
          <Text style={s.univText}>
            {app.university || "—"} ·{" "}
            {app.appliedAt
              ? new Date(app.appliedAt).toLocaleDateString("en-LK", { day: "numeric", month: "short" })
              : "—"}
          </Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>
            {cfg.emoji} {cfg.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:  { flex: 1, backgroundColor: colors.bg },
  content:  { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },

  heading:    { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 12, color: colors.textMuted, marginBottom: 20 },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  pill: {
    flex: 1, backgroundColor: colors.bgCard,
    borderRadius: radius.md, padding: 12, alignItems: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  pillNum:   { fontSize: 22, fontWeight: "900", marginBottom: 2 },
  pillLabel: { fontSize: 10, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase" },

  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.8,
    marginTop: 8, marginBottom: 12,
  },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 12,
    overflow: "hidden",
    ...shadow.card,
  },
  cardSmall: { },
  cardHeader: {
    flexDirection: "row", gap: 12, alignItems: "center",
    padding: 16,
  },

  jobTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 3 },
  univText: { fontSize: 12, color: colors.textSecondary },

  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, shrink: 0 },
  statusText: { fontSize: 11, fontWeight: "700" },

  toggleHint: {
    borderTopWidth: 1, borderColor: colors.border,
    paddingVertical: 10, paddingHorizontal: 16,
    backgroundColor: "rgba(108,99,255,0.04)",
  },
  toggleHintOpen: { backgroundColor: "rgba(108,99,255,0.08)" },
  toggleText: { color: colors.brandLight, fontSize: 13, fontWeight: "600", textAlign: "center" },

  qrPanel: {
    padding: 20, alignItems: "center",
    borderTopWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bgInput,
  },
  qrHint: { fontSize: 12, color: colors.textSecondary, textAlign: "center", marginBottom: 16, lineHeight: 18 },
  qrBox: {
    padding: 16, backgroundColor: "#ffffff",
    borderRadius: radius.lg,
    marginBottom: 12,
    ...shadow.glow,
  },
  qrToken: {
    fontSize: 9, color: colors.textMuted,
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  qrDate: { fontSize: 11, color: colors.textMuted },

  emptyState:   { alignItems: "center", paddingTop: 80 },
  emptyIcon:    { fontSize: 52, marginBottom: 16, opacity: 0.4 },
  emptyTitle:   { fontSize: 16, fontWeight: "700", color: colors.textSecondary },
  emptySubtitle:{ fontSize: 13, color: colors.textMuted, marginTop: 6, textAlign: "center" },
});
