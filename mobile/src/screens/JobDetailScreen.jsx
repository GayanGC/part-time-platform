import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadow } from "../theme/tokens";

export default function JobDetailScreen({ route, navigation }) {
  const { job, applied: initialApplied } = route.params;
  const { currentUser, userProfile } = useAuth();

  const [applied, setApplied]   = useState(initialApplied);
  const [loading, setLoading]   = useState(false);

  async function handleApply() {
    if (applied) return;
    try {
      setLoading(true);
      await addDoc(collection(db, "applications"), {
        jobId:       job.id,
        jobTitle:    job.title,
        studentUid:  currentUser.uid,
        studentName: userProfile?.name || "Unknown",
        university:  userProfile?.university || "",
        status:      "pending",
        qrCode:      null,
        appliedAt:   new Date().toISOString(),
      });
      setApplied(true);
      Alert.alert(
        "Application Sent! 🎉",
        "Your application is pending review. Check 'My QR' when approved.",
        [{ text: "OK" }]
      );
    } catch (err) {
      Alert.alert("Apply Failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.wrapper}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header badge */}
        <View style={s.badgeRow}>
          <View style={[s.badge, s.badgeOpen]}>
            <Text style={s.badgeOpenText}>● Open</Text>
          </View>
          {applied && (
            <View style={[s.badge, s.badgeApplied]}>
              <Text style={s.badgeAppliedText}>✓ Applied</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={s.title}>{job.title}</Text>

        {/* Info Cards */}
        <View style={s.infoGrid}>
          <InfoCard icon="💰" label="Salary"   value={`LKR ${Number(job.salary).toLocaleString()}`} />
          <InfoCard icon="📍" label="Location" value={job.location} />
        </View>
        <View style={s.infoGrid}>
          <InfoCard
            icon="🎓"
            label="University"
            value={job.university === "Any" ? "Open to all" : (job.university || "Any")}
          />
          <InfoCard
            icon="👥"
            label="Vacancies"
            value={`👦 ${job.boysNeeded}  ·  👧 ${job.girlsNeeded}`}
          />
        </View>

        {/* Description */}
        {job.description ? (
          <View style={s.descCard}>
            <Text style={s.descLabel}>Job Description</Text>
            <Text style={s.descText}>{job.description}</Text>
          </View>
        ) : null}

        {/* Posted date */}
        {job.createdAt?.toDate && (
          <Text style={s.postedAt}>
            Posted: {job.createdAt.toDate().toLocaleDateString("en-LK", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </Text>
        )}

      </ScrollView>

      {/* Sticky Apply Button */}
      <View style={s.stickyBar}>
        <TouchableOpacity
          style={[s.applyBtn, applied && s.applyBtnApplied, loading && s.applyBtnDisabled]}
          onPress={handleApply}
          disabled={applied || loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.applyBtnText}>
                {applied ? "✓ Already Applied" : "Apply Now →"}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <View style={s.infoCard}>
      <Text style={s.infoIcon}>{icon}</Text>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper:  { flex: 1, backgroundColor: colors.bg },
  content:  { padding: 20, paddingBottom: 120 },

  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  badge:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99 },
  badgeOpen: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 1, borderColor: "rgba(34,197,94,0.3)",
  },
  badgeOpenText: { color: colors.success, fontSize: 12, fontWeight: "700" },
  badgeApplied: {
    backgroundColor: "rgba(108,99,255,0.15)",
    borderWidth: 1, borderColor: "rgba(108,99,255,0.35)",
  },
  badgeAppliedText: { color: colors.brandLight, fontSize: 12, fontWeight: "700" },

  title: {
    fontSize: 24, fontWeight: "800", color: colors.textPrimary,
    lineHeight: 32, marginBottom: 20,
  },

  infoGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  infoCard: {
    flex: 1, backgroundColor: colors.bgCard,
    borderRadius: radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.card,
  },
  infoIcon:  { fontSize: 20, marginBottom: 6 },
  infoLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", color: colors.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },

  descCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md, padding: 16, marginTop: 4, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  descLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, color: colors.textMuted, marginBottom: 8 },
  descText:  { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },

  postedAt: { fontSize: 12, color: colors.textMuted, textAlign: "right", marginTop: 8 },

  stickyBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32,
    backgroundColor: colors.bg,
    borderTopWidth: 1, borderColor: colors.border,
  },
  applyBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    ...shadow.glow,
  },
  applyBtnApplied: { backgroundColor: colors.bgCard, ...shadow.card },
  applyBtnDisabled: { opacity: 0.6 },
  applyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
