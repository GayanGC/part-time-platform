import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadow } from "../theme/tokens";

const UNIVERSITIES = [
  "University of Colombo", "University of Peradeniya", "University of Kelaniya",
  "University of Moratuwa", "University of Sri Jayewardenepura", "University of Ruhuna",
  "Eastern University", "NSBM Green University", "SLIIT", "Other",
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [role, setRole]         = useState("student");
  const [name, setName]         = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showUniPicker, setShowUniPicker] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert("Missing Fields", "Please fill in all required fields.");
    }
    if (password.length < 6) {
      return Alert.alert("Weak Password", "Password must be at least 6 characters.");
    }
    try {
      setLoading(true);
      await register(email, password, { name: name.trim(), university, role });
      // Navigation handled by AppNavigator after auth state change
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered."
        : err.message;
      Alert.alert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

      {/* Logo */}
      <Text style={s.logo}>⚡ Part Time</Text>
      <Text style={s.tagline}>Create your account</Text>

      {/* Role Selector */}
      <Text style={s.label}>I am a…</Text>
      <View style={s.roleRow}>
        {[
          { id: "student", icon: "🎓", label: "Student" },
          { id: "poster",  icon: "📋", label: "Job Poster" },
        ].map(({ id, icon, label }) => (
          <TouchableOpacity
            key={id}
            style={[s.roleBtn, role === id && s.roleBtnActive]}
            onPress={() => setRole(id)}
            activeOpacity={0.8}
          >
            <Text style={s.roleIcon}>{icon}</Text>
            <Text style={[s.roleLabel, role === id && s.roleLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Full Name */}
      <Text style={s.label}>Full Name *</Text>
      <TextInput
        style={s.input}
        placeholder="Kasun Perera"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        autoComplete="name"
      />

      {/* University (student only) */}
      {role === "student" && (
        <>
          <Text style={s.label}>University</Text>
          <TouchableOpacity style={s.input} onPress={() => setShowUniPicker(!showUniPicker)} activeOpacity={0.8}>
            <Text style={university ? s.inputText : { color: colors.textMuted }}>
              {university || "Select your university…"}
            </Text>
          </TouchableOpacity>
          {showUniPicker && (
            <View style={s.pickerDropdown}>
              {UNIVERSITIES.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[s.pickerItem, university === u && s.pickerItemActive]}
                  onPress={() => { setUniversity(u); setShowUniPicker(false); }}
                >
                  <Text style={[s.pickerItemText, university === u && { color: colors.brandLight }]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      {/* Email */}
      <Text style={s.label}>Email Address *</Text>
      <TextInput
        style={s.input}
        placeholder="you@example.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {/* Password */}
      <Text style={s.label}>Password *</Text>
      <TextInput
        style={s.input}
        placeholder="Min. 6 characters"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password-new"
      />

      {/* Submit */}
      <TouchableOpacity
        style={[s.btnPrimary, loading && s.btnDisabled]}
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>
              Register as {role === "poster" ? "Job Poster" : "Student"}
            </Text>
        }
      </TouchableOpacity>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={s.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:  { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },

  logo:    { fontSize: 34, fontWeight: "900", color: colors.brandLight, textAlign: "center", marginBottom: 6 },
  tagline: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 36 },

  label: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.2,
    textTransform: "uppercase", color: colors.textSecondary, marginBottom: 8, marginTop: 16,
  },

  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 15,
    justifyContent: "center",
  },
  inputText: { color: colors.textPrimary, fontSize: 15 },

  roleRow: { flexDirection: "row", gap: 12 },
  roleBtn: {
    flex: 1, alignItems: "center", paddingVertical: 18,
    borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.md, backgroundColor: colors.bgCard,
  },
  roleBtnActive: {
    borderColor: colors.brand,
    backgroundColor: "rgba(108,99,255,0.12)",
    ...shadow.glow,
  },
  roleIcon:  { fontSize: 26, marginBottom: 6 },
  roleLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", color: colors.textSecondary },
  roleLabelActive: { color: colors.brandLight },

  pickerDropdown: {
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, marginTop: 4,
    overflow: "hidden",
  },
  pickerItem: { paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.border },
  pickerItemActive: { backgroundColor: "rgba(108,99,255,0.1)" },
  pickerItemText: { color: colors.textSecondary, fontSize: 14 },

  btnPrimary: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
    ...shadow.glow,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28, alignItems: "center" },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.brandLight, fontWeight: "700", fontSize: 14 },
});
