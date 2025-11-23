import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { extractShareIdFromUrl } from '@/services/qr-code';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useAuth } from '@/hooks/use-auth';
import { X } from 'lucide-react-native';

// Try to import expo-camera, but handle if it's not installed
let CameraView: any;
let CameraType: any;
let useCameraPermissions: any;

try {
  const expoCamera = require('expo-camera');
  CameraView = expoCamera.CameraView;
  CameraType = expoCamera.CameraType;
  useCameraPermissions = expoCamera.useCameraPermissions;
} catch (e) {
  // expo-camera not installed - will show fallback UI
  console.warn('expo-camera not installed. QR scanner will not work. Install with: npx expo install expo-camera');
}

interface QRScannerProps {
  onScanComplete?: (shareId: string) => void;
  onCancel?: () => void;
}

/**
 * QR scanner component for scanning QR codes to share cards.
 * Scans QR codes containing share links and extracts shareId to send card.
 * 
 * Note: Requires expo-camera to be installed: npx expo install expo-camera
 */
export function QRScanner({ onScanComplete, onCancel }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, () => {}];
  const [scanned, setScanned] = useState(false);
  const sendCard = useMutation(api.sharing.sendCard);
  const currentUser = useQuery(api.users.getCurrentUser);
  const { convexUser } = useAuth();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // Extract shareId from scanned URL
      const shareId = extractShareIdFromUrl(data);
      
      if (!shareId) {
        Alert.alert(
          'Invalid QR Code',
          'This QR code does not contain a valid share link.',
          [
            {
              text: 'OK',
              onPress: () => setScanned(false),
            },
          ]
        );
        return;
      }

      // Get card by shareId using Convex query
      // Note: We need to use the Convex client directly for this
      // Since we can't use useQuery in an async handler, we'll need to call the API
      // For now, we'll show an alert and let the parent handle the API call
      // The parent should use the shareId to fetch the card and send it
      
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to share cards.');
        setScanned(false);
        return;
      }

      // Callback with shareId - parent component will handle fetching card and sending
      onScanComplete?.(shareId);
      
    } catch (error) {
      console.error('Error scanning QR code:', error);
      Alert.alert(
        'Error',
        'Failed to process QR code. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  useEffect(() => {
    if (permission && !permission.granted && requestPermission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Check if expo-camera is available
  if (!CameraView || !useCameraPermissions) {
    return (
      <Card>
        <CardContent className="gap-4 py-6">
          <Text className="text-center text-muted-foreground">
            QR Scanner requires expo-camera to be installed.
          </Text>
          <Text variant="small" className="text-center text-muted-foreground">
            Run: npx expo install expo-camera
          </Text>
          {onCancel && (
            <Button variant="outline" onPress={onCancel} className="mt-4">
              <Text>Cancel</Text>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!permission) {
    return (
      <Card>
        <CardContent className="py-6">
          <Text className="text-center text-muted-foreground">
            Loading camera permissions...
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (!permission.granted) {
    return (
      <Card>
        <CardContent className="gap-4 py-6">
          <Text className="text-center text-muted-foreground">
            Camera permission is required to scan QR codes.
          </Text>
          <Button onPress={requestPermission}>
            <Text>Grant Permission</Text>
          </Button>
          {onCancel && (
            <Button variant="outline" onPress={onCancel}>
              <Text>Cancel</Text>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={CameraType.back}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea} />
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>
      <View style={styles.controls}>
        {onCancel && (
          <Button variant="outline" onPress={onCancel}>
            <X className="size-4" />
            <Text>Cancel</Text>
          </Button>
        )}
        {scanned && (
          <Button onPress={() => setScanned(false)}>
            <Text>Scan Again</Text>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
});

