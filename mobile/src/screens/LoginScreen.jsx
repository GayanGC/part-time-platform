import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadow } from "../theme/tokens";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Missing Fields", "Please enter your email and password.");
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert("Login Failed", "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.content}>

        {/* Logo */}
        <Text style={s.logo}>⚡ Part Time</Text>
        <Text style={s.tagline}>Sign in to continue</Text>

        {/* Card */}
        <View style={s.card}>

          <Text style={s.label}>Email Address</Text>
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

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="Your password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Sign In →</Text>
            }
          </TouchableOpacity>

          {/* Tip */}
          <View style={s.tip}>
            <Text style={s.tipText}>
              💡 Tip: Your account is shared between the web and mobile apps.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>New to Part Time? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={s.footerLink}>Create an account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: "center", padding: 24 },

  logo:    { fontSize: 36, fontWeight: "900", color: colors.brandLight, textAlign: "center", marginBottom: 6 },
  tagline: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 36 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1, borderColor: colors.border,
    ...shadow.card,
  },

  label: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.2,
    textTransform: "uppercase", color: colors.textSecondary,
    marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 15,
  },

  btnPrimary: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    ...shadow.glow,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  tip: {
    marginTop: 16, padding: 12,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderRadius: radius.sm,
    borderWidth: 1, borderColor: "rgba(56,189,248,0.2)",
  },
  tipText: { color: colors.info, fontSize: 12, lineHeight: 18 },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.brandLight, fontWeight: "700", fontSize: 14 },
});
