import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Word } from '../data/mockWords';
import { palette, radius, spacing } from '../theme';

interface WordDetailModalProps {
  visible: boolean;
  word: Word | null;
  onClose: () => void;
  onToggleFavorite?: (word: Word) => void;
}

export default function WordDetailModal({ visible, word, onClose, onToggleFavorite }: WordDetailModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Reset state when modal opens/closes or word changes
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, [word, visible]);

  if (!word) return null;

  const playSound = async () => {
    try {
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      Speech.speak(word.word, {
        language: 'en-US',
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.tagContainer}>
              <Text style={styles.levelTag}>{word.level}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {onToggleFavorite && (
                <TouchableOpacity onPress={() => onToggleFavorite(word)}>
                  <Ionicons 
                    name={word.isFavorite ? "star" : "star-outline"} 
                    size={24} 
                    color={word.isFavorite ? palette.accent : palette.textLight} 
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={palette.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Word & Phonetic */}
            <View style={styles.titleRow}>
              <Text style={styles.wordText}>{word.word}</Text>
              <TouchableOpacity onPress={playSound} style={styles.speakerBtn}>
                <Ionicons 
                  name={isSpeaking ? "volume-high" : "volume-medium"} 
                  size={28} 
                  color={palette.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.phoneticRow}>
              <Text style={styles.phonetic}>UK {word.phonetic_uk}</Text>
              <Text style={styles.phonetic}>US {word.phonetic_us}</Text>
            </View>

            {/* Meaning */}
            <View style={styles.section}>
              <Text style={styles.partOfSpeech}>{word.part_of_speech}</Text>
              <Text style={styles.meaning}>{word.meaning}</Text>
            </View>

            <View style={styles.divider} />

            {/* Roots */}
            {word.roots && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>词根词缀</Text>
                <Text style={styles.rootsText}>{word.roots}</Text>
              </View>
            )}

            {/* Examples */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>例句</Text>
              {word.examples.map((ex, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.enExample}>{index + 1}. {ex.en}</Text>
                  <Text style={styles.cnExample}>{ex.cn}</Text>
                </View>
              ))}
            </View>

            {/* Synonyms & Antonyms */}
            {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
              <View style={styles.rowSection}>
                {word.synonyms.length > 0 && (
                  <View style={styles.halfCol}>
                    <Text style={styles.miniTitle}>同义词</Text>
                    <View style={styles.chipContainer}>
                      {word.synonyms.map(s => (
                        <View key={s} style={styles.chip}>
                          <Text style={styles.chipText}>{s}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                {word.antonyms.length > 0 && (
                  <View style={styles.halfCol}>
                    <Text style={styles.miniTitle}>反义词</Text>
                    <View style={styles.chipContainer}>
                      {word.antonyms.map(a => (
                        <View key={a} style={[styles.chip, styles.antonymChip]}>
                          <Text style={[styles.chipText, styles.antonymText]}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '85%',
    padding: spacing.l,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 10 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  tagContainer: {
    backgroundColor: palette.lightBlue,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.s,
  },
  levelTag: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  wordText: {
    fontSize: 32,
    fontWeight: '800',
    color: palette.text,
  },
  speakerBtn: {
    padding: spacing.s,
    backgroundColor: palette.lightBlue,
    borderRadius: radius.l,
  },
  phoneticRow: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  phonetic: {
    fontSize: 14,
    color: palette.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  section: {
    marginBottom: spacing.l,
  },
  partOfSpeech: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  meaning: {
    fontSize: 18,
    color: palette.text,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: palette.secondary,
    paddingLeft: spacing.s,
  },
  rootsText: {
    fontSize: 15,
    color: palette.textLight,
    lineHeight: 22,
    backgroundColor: palette.inputBg,
    padding: spacing.m,
    borderRadius: radius.m,
  },
  exampleItem: {
    marginBottom: spacing.m,
  },
  enExample: {
    fontSize: 16,
    color: palette.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  cnExample: {
    fontSize: 14,
    color: palette.textLight,
  },
  rowSection: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  halfCol: {
    flex: 1,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textLight,
    marginBottom: spacing.s,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: palette.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.s,
  },
  antonymChip: {
    backgroundColor: '#FFF1F2', // light red
  },
  chipText: {
    fontSize: 13,
    color: palette.text,
  },
  antonymText: {
    color: palette.danger,
  },
});
