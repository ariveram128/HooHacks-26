import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, radii } from '../theme';
import { useAuth } from '../context/AuthContext';

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const err = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>
            Sabio<Text style={styles.logoDot}>.</Text>
          </Text>
          <Text style={styles.tagline}>Your Spanish companion</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Create account</Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={colors.warmGrayLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.warmGrayLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.warmGrayLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
            />
          </View>

          {error.length > 0 && (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSignUp}
            disabled={loading}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && !loading && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              loading && { opacity: 0.7 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },

  logoWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontFamily: fonts.serif,
    fontSize: 48,
    color: colors.charcoal,
    letterSpacing: -1,
  },
  logoDot: {
    color: colors.terracotta,
    fontSize: 56,
  },
  tagline: {
    fontFamily: fonts.light,
    fontSize: 15,
    color: colors.warmGray,
    marginTop: 4,
  },

  form: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.charcoal,
    marginBottom: 28,
  },
  inputWrap: {
    marginBottom: 18,
  },
  inputLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.charcoal,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.charcoal,
  },

  errorWrap: {
    backgroundColor: 'rgba(194,85,58,0.1)',
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.terracotta,
  },

  submitBtn: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.terracottaDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.white,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.warmGray,
  },
  footerLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.teal,
  },
});
