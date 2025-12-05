import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  TextInput,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// *** CRITICAL FIX APPLIED HERE: Use '/legacy' import path ***\

import { CameraView as ExpoCamera, CameraType, Camera } from 'expo-camera';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Calendar, 
  Edit3, 
  Camera as CameraIcon,
  Repeat2, 
  X
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- Interface for a Memory Entry ---
interface MemoryEntry {
    uri: string;
    title: string;
    date: Date;
    notes: string;
}

export default function MemoryLogScreen() {
  // --- Form States ---
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryNotes, setMemoryNotes] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date());

  // --- Camera States ---
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Use 'back' or 'front' string for the facing prop
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  
  // Correctly typing the camera reference
  const cameraRef = useRef<ExpoCamera | null>(null); 

  // --- Permission States ---
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);

  // --- Dummy State for List ---
  const [memoriesList, setMemoriesList] = useState<MemoryEntry[]>([]);

  // 1. Permission Requests
  useEffect(() => {
    (async () => {
      // Camera Permission
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      
      // Media Library Permission (for gallery/saving)
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  // 2. Core Function: Picking an Image from Gallery
  const pickImage = async () => {
    if (hasMediaLibraryPermission === false) {
         Alert.alert('Permission Denied', 'Media Library permission is required to pick photos.');
         return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  // 3. Core Function: Taking a Picture (Live Camera)
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.9, base64: false, exif: false };
      const data = await cameraRef.current.takePictureAsync(options);
      setSelectedImageUri(data.uri); // Set the captured URI to the main form state
      setIsCameraActive(false); // Close the camera view
    }
  };
  
  const toggleCameraType = () => {
    // Toggle between 'back' and 'front'
    setCameraType((current: string) => (current === 'back' ? 'front' : 'back'));
  };

  const openCamera = () => {
      if (hasCameraPermission === false) {
           Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
           return;
      }
      setIsCameraActive(true);
  }

  // 4. Core Function: Saving the Memory Log
  const handleSaveMemory = () => {
    if (!selectedImageUri || !memoryTitle.trim()) {
      Alert.alert('Missing Info', 'Please select a photo and enter a title before saving.');
      return;
    }

    const newMemory: MemoryEntry = {
        uri: selectedImageUri,
        title: memoryTitle.trim(),
        date: memoryDate,
        notes: memoryNotes,
    };
    
    setMemoriesList(prev => [newMemory, ...prev]);

    Alert.alert('Memory Logged! 🥳', `'${memoryTitle}' has been added to your Memory Book.`);
    
    // Reset the form
    setSelectedImageUri(null);
    setMemoryTitle('');
    setMemoryNotes('');
    setMemoryDate(new Date());
  };

  // 5. Helper Function: Displaying a saved memory
  const renderSavedMemory = (memory: MemoryEntry, index: number) => (
    <View key={index} style={styles.savedMemoryCard}>
      <Image source={{ uri: memory.uri }} style={styles.savedMemoryImage} />
      <View style={styles.savedMemoryText}>
        <Text style={styles.savedMemoryTitle}>{memory.title}</Text>
        <Text style={styles.savedMemoryDate}>{memory.date.toLocaleDateString()}</Text>
        <Text style={styles.savedMemoryNotes} numberOfLines={2}>{memory.notes || 'No extra notes.'}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => { Alert.alert('Delete', 'Delete function is not yet implemented.'); }}>
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  // --- Render the live camera overlay if active ---
  if (isCameraActive) {
    if (hasCameraPermission === false) {
        return <View style={styles.cameraOverlayContainer}><Text style={styles.errorText}>No access to camera.</Text></View>;
    }
    
    return (
        <View style={styles.cameraOverlayContainer}>
            <ExpoCamera 
                style={styles.cameraOverlay} 
                facing={cameraType} 
                ref={cameraRef}
                ratio={'4:3'}
            >
                <TouchableOpacity style={styles.cameraCloseButton} onPress={() => setIsCameraActive(false)}>
                    <X size={30} color="#fff" />
                </TouchableOpacity>

                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                        <Repeat2 size={28} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.shutterButtonOuter} onPress={takePicture}>
                        <View style={styles.shutterButtonInner} />
                    </TouchableOpacity>

                    {/* Placeholder for symmetry */}
                    <View style={styles.flipButton} /> 
                </View>
            </ExpoCamera>
        </View>
    );
  }

  // --- Main Form Render ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ImageIcon color="white" size={24} />
        <Text style={styles.headerTitle}>Log a Memory</Text>
        <Text style={styles.headerSubtitle}>Import photos, snap a picture, and add details.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- Image Selection Area --- */}
        <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {selectedImageUri ? (
                <>
                  <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                  <View style={styles.changeImageOverlay}>
                    <Edit3 color="white" size={24} />
                    <Text style={styles.overlayText}>Change Photo</Text>
                  </View>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <ImageIcon size={40} color="#3B82F6" />
                  <Text style={styles.placeholderText}>Select Photo from Gallery</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraCaptureButton} onPress={openCamera}>
                <CameraIcon size={24} color="#fff" />
                <Text style={styles.cameraCaptureButtonText}>Capture Now</Text>
            </TouchableOpacity>
        </View>
        
        {/* --- Memory Details Form --- */}
        <View style={styles.detailsContainer}>
          <Text style={styles.label}>Memory Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="E.g., First time sitting up"
            value={memoryTitle}
            onChangeText={setMemoryTitle}
          />
          
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateInput}>
            <Calendar size={20} color="#3B82F6" style={styles.iconMargin} />
            <Text style={styles.dateText}>{memoryDate.toLocaleDateString()}</Text>
          </View>
          
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add a detailed note about the moment..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={memoryNotes}
            onChangeText={setMemoryNotes}
          />
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveMemory}
            disabled={!selectedImageUri} // Disable if no image is selected
          >
            <Text style={styles.saveButtonText}>Save Memory</Text>
          </TouchableOpacity>
        </View>

        {/* --- Saved Memories List --- */}
        <View style={styles.memoriesListContainer}>
            <Text style={styles.listHeader}>Recent Memories ({memoriesList.length})</Text>
            {memoriesList.length > 0 ? (
                memoriesList.map(renderSavedMemory)
            ) : (
                <Text style={styles.noMemoriesText}>No memories logged yet! Start tracking.</Text>
            )}
        </View>

      </ScrollView>
    </View>
  );
}

// --- StyleSheet Definitions ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  errorText: {
      fontSize: 18,
      color: 'white',
      padding: 20,
      textAlign: 'center',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#DBEAFE',
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
  },
  
  // Image Picker Styles
  imagePickerContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 10,
  },
  imagePicker: {
    flex: 2,
    height: 150, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cameraCaptureButton: {
      flex: 1,
      height: 150,
      backgroundColor: '#3B82F6',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  cameraCaptureButtonText: {
      color: 'white',
      marginTop: 8,
      fontWeight: '600',
      fontSize: 15,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },

  // Form Details
  detailsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  iconMargin: {
    marginRight: 4,
  },
  saveButton: {
    backgroundColor: '#10B981', // Emerald Green
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Saved Memories List Styles 
  memoriesListContainer: {
      marginTop: 10,
  },
  listHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: '#374151',
      marginBottom: 10,
      marginLeft: 4,
  },
  savedMemoryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  savedMemoryImage: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  savedMemoryText: {
    flex: 1,
    padding: 10,
  },
  savedMemoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  savedMemoryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  savedMemoryNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2', // Red-50
  },
  noMemoriesText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#6B7280',
      fontStyle: 'italic',
  },
  
  // --- Live Camera Overlay Styles ---
  cameraOverlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: width,
      height: height,
      backgroundColor: '#000',
      zIndex: 100,
      justifyContent: 'center',
      alignItems: 'center',
  },
  cameraOverlay: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-end',
  },
  cameraCloseButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      padding: 10,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
  },
  cameraControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 20,
      paddingBottom: 40,
      backgroundColor: 'rgba(0,0,0,0.6)',
  },
  flipButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  shutterButtonOuter: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#fff',
      borderWidth: 4,
      borderColor: '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
  },
  shutterButtonInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#fff',
  },
});