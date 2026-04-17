import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from "react-native";
import {
  collection, query, where, getDocs, orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadow } from "../theme/tokens";

export default function StudentFeedScreen({ navigation }) {
  const { currentUser } = useAuth();

  const [jobs, setJobs]           = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appliedSet, setAppliedSet] = useState(new Set());
  const [search, setSearch]         = useState("");

  async function fetchData() {
    try {
      const snap = await getDocs(
        query(collection(db, "jobs"), where("status", "==", "open"), orderBy("createdAt", "desc"))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setJobs(list);
      filterJobs(list, search);

      const mySnap = await getDocs(
        query(collection(db, "applications"), where("studentUid", "==", currentUser.uid))
      );
      setAppliedSet(new Set(mySnap.docs.map((d) => d.data().jobId)));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // Filter by search text (university or location)
  function filterJobs(list, text) {
    if (!text.trim()) { setFiltered(list); return; }
    const q = text.toLowerCase();
    setFiltered(
      list.filter((j) =>
        (j.university && j.university.toLowerCase().includes(q)) ||
        (j.location   && j.location.toLowerCase().includes(q)) ||
        (j.title      && j.title.toLowerCase().includes(q))
      )
    );
  }

  function handleSearch(text) {
    setSearch(text);
    filterJobs(jobs, text);
  }

  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  function renderJob({ item }) {
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate("JobDetail", { job: item, applied: appliedSet.has(item.id) })}
        activeOpacity={0.8}
      >
        {/* Title row */}
        <View style={s.cardHeader}>
          <Text style={s.jobTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[s.badge, s.badgeOpen]}>
            <Text style={s.badgeOpenText}>● Open</Text>
          </View>
        </View>

        {/* Details */}
        <View style={s.metaGrid}>
          <MetaRow icon="📍" text={item.location} />
          <MetaRow icon="💰" text={`LKR ${Number(item.salary).toLocaleString()}`} />
          <MetaRow icon="🎓" text={item.university === "Any" ? "All universities" : (item.university || "Any")} />
          <MetaRow icon="👥" text={`👦 ${item.boysNeeded}   👧 ${item.girlsNeeded}`} />
        </View>

        {/* CTA */}
        <View style={s.cardFooter}>
          {appliedSet.has(item.id) ? (
            <View style={s.appliedBadge}>
              <Text style={s.appliedBadgeText}>✓ Applied</Text>
            </View>
          ) : (
            <Text style={s.seeMore}>View Details →</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={s.wrapper}>

      {/* Search Bar */}
      <View style={s.searchBar}>
        <TextInput
          style={s.searchInput}
          placeholder="🔍  Search by university, location…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Result count */}
      {!loading && (
        <Text style={s.resultCount}>
          {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
          {search ? ` for "${search}"` : ""}
        </Text>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
            />
          }
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>No jobs found</Text>
              <Text style={s.emptySubtitle}>
                {search ? "Try a different search term." : "Pull down to refresh."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function MetaRow({ icon, text }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaIcon}>{icon}</Text>
      <Text style={s.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },

  searchBar: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  searchInput: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 12,
    color: colors.textPrimary, fontSize: 14,
    borderWidth: 1.5, borderColor: colors.border,
  },

  resultCount: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4,
    fontSize: 12, color: colors.textMuted,
  },

  list: { padding: 16, paddingTop: 8, gap: 14, paddingBottom: 40 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.card,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 14 },
  jobTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: colors.textPrimary, lineHeight: 22 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeOpen: { backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  badgeOpenText: { color: colors.success, fontSize: 11, fontWeight: "700" },

  metaGrid: { gap: 6, marginBottom: 16 },
  metaRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  metaIcon: { fontSize: 13 },
  metaText: { fontSize: 13, color: colors.textSecondary, flex: 1 },

  cardFooter: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, alignItems: "flex-end" },
  seeMore: { color: colors.brandLight, fontSize: 13, fontWeight: "600" },

  appliedBadge: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.3)",
  },
  appliedBadgeText: { color: colors.success, fontSize: 12, fontWeight: "700" },

  emptyState: { alignItems: "center", marginTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 52, marginBottom: 16, opacity: 0.4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textSecondary, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
});
