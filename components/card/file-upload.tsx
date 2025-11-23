import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useCard } from '@/hooks/use-card';
import {
  pickImage,
  pickDocument,
  validateProfilePhoto,
  validateResume,
  readFileAsBase64,
  type ImageInfo,
  type FileInfo,
} from '@/services/file-upload';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as React from 'react';
import { View, ScrollView, Image, Alert } from 'react-native';

type FileUploadType = 'profilePhoto' | 'resume';

interface FileUploadProps {
  type: FileUploadType;
  currentFileUrl?: string | null;
  onUploadComplete?: () => void;
}

/**
 * File upload component for resume and profile photo uploads.
 * Handles file picking, validation, and upload to Convex storage.
 */
export function FileUpload({
  type,
  currentFileUrl,
  onUploadComplete,
}: FileUploadProps) {
  const { updateProfilePhoto, updateResume, removeProfilePhoto, removeResume, card } = useCard();
  const generateUploadUrl = useAction(api.files.generateUploadUrl);
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUri, setPreviewUri] = React.useState<string | null>(currentFileUrl || null);

  const handlePickFile = async () => {
    try {
      let file: ImageInfo | FileInfo | null = null;

      if (type === 'profilePhoto') {
        file = await pickImage();
      } else {
        file = await pickDocument({
          type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        });
      }

      if (!file) {
        return; // User cancelled
      }

      // Validate file
      const validation =
        type === 'profilePhoto'
          ? validateProfilePhoto(file as ImageInfo)
          : validateResume(file as FileInfo);

      if (!validation.valid) {
        Alert.alert('Invalid File', validation.error || 'File validation failed');
        return;
      }

      // Show preview for images
      if (type === 'profilePhoto' && 'uri' in file) {
        setPreviewUri(file.uri);
      }

      // Upload file
      await handleUpload(file);
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pick file');
    }
  };

  const handleUpload = async (file: ImageInfo | FileInfo) => {
    setIsUploading(true);
    try {
      // Generate upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Read file as base64
      const base64 = await readFileAsBase64(file.uri);

      // Convert base64 to binary
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload to Convex storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': file.mimeType || 'application/octet-stream',
        },
        body: bytes,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      // Convex returns the storage ID in the response
      const result = await response.json();
      const storageId = result.storageId;

      if (!storageId) {
        throw new Error('No storage ID returned from upload');
      }

      // Update card with file ID
      if (type === 'profilePhoto') {
        await updateProfilePhoto(storageId);
      } else {
        await updateResume(storageId);
      }

      onUploadComplete?.();
      Alert.alert('Success', `${type === 'profilePhoto' ? 'Profile photo' : 'Resume'} uploaded successfully`);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      'Remove File',
      `Are you sure you want to remove your ${type === 'profilePhoto' ? 'profile photo' : 'resume'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'profilePhoto') {
                await removeProfilePhoto();
              } else {
                await removeResume();
              }
              setPreviewUri(null);
              onUploadComplete?.();
            } catch (error) {
              console.error('Error removing file:', error);
              Alert.alert('Error', 'Failed to remove file');
            }
          },
        },
      ]
    );
  };

  const hasFile = type === 'profilePhoto' ? card?.profilePhotoId : card?.resumeFileId;

  return (
    <ScrollView className="flex-1">
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'profilePhoto' ? 'Profile Photo' : 'Resume'}
          </CardTitle>
          <CardDescription>
            {type === 'profilePhoto'
              ? 'Upload a profile photo for your digital card'
              : 'Upload your resume (PDF, DOC, DOCX, or TXT, max 10MB)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {type === 'profilePhoto' && previewUri && (
            <View className="items-center">
              <Image
                source={{ uri: previewUri }}
                className="h-32 w-32 rounded-full"
                resizeMode="cover"
              />
            </View>
          )}

          {hasFile && (
            <View className="gap-2">
              <Text variant="muted">
                {type === 'profilePhoto'
                  ? 'Profile photo is uploaded'
                  : 'Resume is uploaded'}
              </Text>
            </View>
          )}

          <View className="flex-row gap-2">
            <Button
              className="flex-1"
              onPress={handlePickFile}
              disabled={isUploading}>
              <Text>{isUploading ? 'Uploading...' : hasFile ? 'Replace' : 'Upload'}</Text>
            </Button>
            {hasFile && (
              <Button
                variant="destructive"
                onPress={handleRemove}
                disabled={isUploading}>
                <Text>Remove</Text>
              </Button>
            )}
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

