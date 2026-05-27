import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const SimpleModal = ({ visible, onClose, title, children }: Props) => {
  if (!visible) return null;

  return (
    <View style={modalStyles.container}>
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={modalStyles.modalBox}>
        <Text style={modalStyles.title}>{title}</Text>

        <View style={modalStyles.content}>
          {children}
        </View>

        <TouchableOpacity style={modalStyles.button} onPress={onClose}>
          <Text style={{ }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    marginBottom: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default SimpleModal;
