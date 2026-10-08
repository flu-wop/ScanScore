import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { fetchProduct, Product } from '../api';
import { colors, space, type } from '../theme';

export default function Scan({ onResult }: { onResult: (p: Product) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const lock = useRef(false);

  const lookup = useCallback(
    async (code: string) => {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      setMessage(null);
      try {
        const product = await fetchProduct(code);
        if (product) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          onResult(product);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          setMessage(`No data found for ${code}.`);
        }
      } catch {
        setMessage('Lookup failed. Check your connection.');
      } finally {
        setBusy(false);
        setTimeout(() => {
          lock.current = false;
        }, 1500);
      }
    },
    [onResult]
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Scan</Text>
      <Text style={styles.sub}>Point at a barcode to score it.</Text>

      <View style={styles.cameraWrap}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
            }}
            onBarcodeScanned={busy ? undefined : ({ data }) => lookup(data)}
          />
        ) : (
          <View style={styles.permission}>
            <Text style={styles.permissionText}>Camera access is needed to scan.</Text>
            <Pressable style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Allow camera</Text>
            </Pressable>
          </View>
        )}
        {busy && (
          <View style={styles.busy}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        <View pointerEvents="none" style={styles.frame} />
      </View>

      {message && <Text style={styles.message}>{message}</Text>}

      <Text style={styles.label}>OR ENTER A BARCODE</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={manual}
          onChangeText={setManual}
          placeholder="0123456789012"
          placeholderTextColor={colors.unknown}
          keyboardType="number-pad"
          returnKeyType="search"
          onSubmitEditing={() => manual && lookup(manual)}
        />
        <Pressable
          style={[styles.button, !manual && styles.buttonDisabled]}
          disabled={!manual}
          onPress={() => lookup(manual)}
        >
          <Text style={styles.buttonText}>Look up</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: space.lg, backgroundColor: colors.bg },
  title: { ...type.display, color: colors.ink },
  sub: { ...type.body, color: colors.muted, marginTop: space.xs, marginBottom: space.md },
  cameraWrap: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: space.md,
  },
  frame: {
    position: 'absolute',
    top: '30%',
    left: '12%',
    right: '12%',
    bottom: '30%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },
  busy: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permission: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  permissionText: { color: '#fff', ...type.body, marginBottom: space.md, textAlign: 'center' },
  message: { ...type.body, color: colors.bad, marginBottom: space.md },
  label: { ...type.label, color: colors.muted, marginBottom: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
