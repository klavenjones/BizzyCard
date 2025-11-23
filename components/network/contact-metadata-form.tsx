import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useContacts } from '@/hooks/use-contacts';
import { Id } from '@/convex/_generated/dataModel';
import { Calendar, MapPin, Tag, Save } from 'lucide-react-native';

interface ContactMetadataFormProps {
  contactId: Id<'contacts'>;
  currentTags?: string[];
  currentMeetingMetadata?: {
    date: number;
    location?: string;
    notes?: string;
  };
  onSave?: () => void;
}

/**
 * Contact metadata form for editing tags and meeting metadata.
 * Allows users to add/update tags and meeting information for contacts.
 */
export function ContactMetadataForm({
  contactId,
  currentTags = [],
  currentMeetingMetadata,
  onSave,
}: ContactMetadataFormProps) {
  const { updateTags, addMeetingMetadata } = useContacts();
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState('');
  const [meetingDate, setMeetingDate] = useState<string>(
    currentMeetingMetadata?.date
      ? new Date(currentMeetingMetadata.date).toISOString().split('T')[0]
      : ''
  );
  const [meetingLocation, setMeetingLocation] = useState(
    currentMeetingMetadata?.location || ''
  );
  const [meetingNotes, setMeetingNotes] = useState(
    currentMeetingMetadata?.notes || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) {
      Alert.alert('Error', 'This tag already exists.');
      return;
    }
    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update tags
      await updateTags({ contactId, tags });

      // Update meeting metadata if date is provided
      if (meetingDate) {
        const dateTimestamp = new Date(meetingDate).getTime();
        await addMeetingMetadata({
          contactId,
          date: dateTimestamp,
          location: meetingLocation.trim() || undefined,
          notes: meetingNotes.trim() || undefined,
        });
      }

      Alert.alert('Success', 'Contact updated successfully!');
      onSave?.();
    } catch (error) {
      console.error('Error updating contact metadata:', error);
      Alert.alert('Error', 'Failed to update contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Text variant="h3">Edit Contact Information</Text>
      </CardHeader>
      <CardContent className="gap-4">
        {/* Tags Section */}
        <View className="gap-2">
          <Text variant="small" className="font-semibold text-muted-foreground flex-row items-center gap-1">
            <Tag className="size-4" />
            Tags
          </Text>
          <View className="flex-row gap-2">
            <Input
              placeholder="Add tag"
              value={newTag}
              onChangeText={setNewTag}
              className="flex-1"
              onSubmitEditing={handleAddTag}
            />
            <Button onPress={handleAddTag} variant="outline">
              <Text>Add</Text>
            </Button>
          </View>
          {tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag) => (
                <View
                  key={tag}
                  className="flex-row items-center gap-1 rounded-md bg-muted px-2 py-1">
                  <Text variant="small">{tag}</Text>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => handleRemoveTag(tag)}>
                    <Text>×</Text>
                  </Button>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Meeting Metadata Section */}
        <View className="gap-2">
          <Text variant="small" className="font-semibold text-muted-foreground flex-row items-center gap-1">
            <Calendar className="size-4" />
            Meeting Information
          </Text>
          <Input
            placeholder="Date (YYYY-MM-DD)"
            value={meetingDate}
            onChangeText={setMeetingDate}
            keyboardType="default"
          />
          <View className="flex-row items-center gap-2">
            <MapPin className="size-4" />
            <Input
              placeholder="Location"
              value={meetingLocation}
              onChangeText={setMeetingLocation}
              className="flex-1"
            />
          </View>
          <Input
            placeholder="Notes"
            value={meetingNotes}
            onChangeText={setMeetingNotes}
            multiline
            numberOfLines={3}
            className="min-h-[80px]"
          />
        </View>

        {/* Save Button */}
        <Button onPress={handleSave} disabled={isSaving}>
          <Save className="size-4" />
          <Text>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

