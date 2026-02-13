import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { palette, radius, spacing } from '../theme';
import { mockWords, Word, WordLevel } from '../data/mockWords';
import WordDetailModal from '../components/WordDetailModal';
import { WordStorage } from '../utils/storage';
import { RabbitBackground } from '../components/RabbitBackground';
import { ImportHelper, ImportResult } from '../utils/importHelper';
import ImportResultModal from '../components/ImportResultModal';
import * as Speech from 'expo-speech';

const LEVELS: WordLevel[] = ['专升本', 'CET4', 'CET6', 'IELTS'];

export default function WordsScreen() {
  const [selectedLevels, setSelectedLevels] = useState<WordLevel[]>(['CET4']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  // New state for grouping
  const [groupMode, setGroupMode] = useState<'default' | 'az' | 'progress'>('default');

  // Load words on focus to sync with ReadingScreen updates
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    const storedWords = await WordStorage.loadWords();
    if (storedWords && storedWords.length > 0) {
      setWords(storedWords);
    } else {
      setWords(mockWords);
      await WordStorage.saveWords(mockWords);
    }
    setLoading(false);
  };

  const handleWordPress = (word: Word) => {
    setSelectedWord(word);
    setModalVisible(true);
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setImporting(true);
      const file = result.assets[0];

      // 1. Parse & Validate
      const parsedResult = await ImportHelper.parseFile(file.uri, file.mimeType || '');

      // 2. Batch Save (if there are valid words)
      if (parsedResult.words.length > 0) {
        await WordStorage.addWords(parsedResult.words);
        await loadData();
      }

      // 3. Show Result
      setImportResult(parsedResult);
      setResultModalVisible(true);

    } catch (error: any) {
      console.error(error);
      Alert.alert('Import Failed', error.message || 'Unknown error occurred');
    } finally {
      setImporting(false);
    }
  };

  const toggleFavorite = async (word: Word, e: any) => {
    e.stopPropagation();
    const updated = { ...word, isFavorite: !word.isFavorite };
    await WordStorage.updateWord(updated);
    setWords(prev => prev.map(w => w.id === word.id ? updated : w));
  };

  const toggleMastered = async (word: Word, e: any) => {
    e.stopPropagation();
    const updated = { ...word, isMastered: !word.isMastered };
    await WordStorage.updateWord(updated);
    setWords(prev => prev.map(w => w.id === word.id ? updated : w));
  };

  const playPronunciation = async (text: string, e: any) => {
    e.stopPropagation();
    try {
      // Check status to avoid overlapping
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }
      Speech.speak(text, { language: 'en-US' });
    } catch (error) {
      console.warn('Speech error:', error);
    }
  };

  const [showFavorites, setShowFavorites] = useState(false);

  const toggleLevel = (level: WordLevel | 'Favorites') => {
    if (level === 'Favorites') {
      setShowFavorites(prev => !prev);
      return;
    }

    setSelectedLevels(prev => {
      if (prev.includes(level as WordLevel)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level as WordLevel];
      }
    });
  };

  const filteredWords = useMemo(() => {
    let result = words.filter(word => {
      // Favorites Filter
      if (showFavorites && !word.isFavorite) return false;

      // Level filter (Multi-select)
      if (selectedLevels.length > 0) {
        // If word has flags (new data), check flags
        if (word.cet4_flag !== undefined) {
          const matches = (
            (selectedLevels.includes('专升本') && word.upgrade_flag) ||
            (selectedLevels.includes('CET4') && word.cet4_flag) ||
            (selectedLevels.includes('CET6') && word.cet6_flag) ||
            (selectedLevels.includes('IELTS') && word.ielts_flag)
          );
          if (!matches) return false;
        } else {
          // Fallback to legacy single level
          if (!selectedLevels.includes(word.level)) return false;
        }
      } else {
        // If nothing selected, maybe show nothing or all? 
        // User requirement says "Support filtering", implies if none selected, show none or all.
        // Let's assume show all if none selected, OR show none. 
        // Usually filters reduce. If no filter, show all.
        // But "selectedLevel" default was 'CET4'.
        // Let's stick to: if selectedLevels is empty, show all.
      }

      // Search filter
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        word.word.toLowerCase().includes(q) ||
        word.meaning.includes(q) ||
        word.part_of_speech.toLowerCase().includes(q) ||
        word.word.toLowerCase().startsWith(q)
      );
    });

    // Grouping Logic (for SectionList if we implemented it, but FlatList for now with sort)
    if (groupMode === 'az') {
      result.sort((a, b) => a.word.localeCompare(b.word));
    } else if (groupMode === 'progress') {
      result.sort((a, b) => (Number(b.isFavorite) - Number(a.isFavorite)) || (Number(b.isMastered) - Number(a.isMastered)));
    }

    return result;
  }, [selectedLevels, searchQuery, words, groupMode]);

  const renderItem = ({ item }: { item: Word }) => (
    <TouchableOpacity
      style={[styles.wordCard, item.isMastered && styles.masteredCard]}
      onPress={() => handleWordPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardInner}>
        <View style={styles.wordHeader}>
          <Text style={[styles.wordText, item.isMastered && styles.masteredText]}>{item.word}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={(e) => playPronunciation(item.word, e)} style={styles.iconBtn}>
              <Ionicons name="volume-high-outline" size={20} color={palette.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => toggleFavorite(item, e)} style={styles.iconBtn}>
              <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={20} color={item.isFavorite ? palette.danger : palette.textLight} />
            </TouchableOpacity>
            <TouchableOpacity onPress={(e) => toggleMastered(item, e)} style={styles.iconBtn}>
              <Ionicons name={item.isMastered ? "checkmark-circle" : "checkmark-circle-outline"} size={20} color={item.isMastered ? palette.success : palette.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.phoneticRow}>
          <View style={styles.phoneticContainer}>
            <Text style={styles.phonetic}>US {item.phonetic_us}</Text>
          </View>
          <View style={styles.posTag}>
            <Text style={styles.posText}>{item.part_of_speech}</Text>
          </View>
        </View>

        <Text style={[styles.meaning, item.isMastered && styles.masteredText]} numberOfLines={2}>{item.meaning}</Text>

        {item.examples && item.examples.length > 0 && (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleText} numberOfLines={1}>
              {item.examples[0].en}
            </Text>
            <Text style={styles.exampleCn} numberOfLines={1}>
              {item.examples[0].cn}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <RabbitBackground>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Vocabulary</Text>
              <Text style={styles.subtitle}>
                {filteredWords.length} words • {selectedLevels.length > 0 ? selectedLevels.join(', ') : 'All'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.groupBtn}
                onPress={() => setGroupMode(prev => prev === 'default' ? 'az' : prev === 'az' ? 'progress' : 'default')}
              >
                <Ionicons
                  name={groupMode === 'az' ? 'text' : groupMode === 'progress' ? 'star' : 'list'}
                  size={24}
                  color={palette.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImport} style={styles.importBtn} disabled={importing}>
                {importing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.importBtnInner}>
                    <Ionicons name="add" size={28} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={palette.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by word, meaning, tag..."
              placeholderTextColor={palette.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Book Tabs (Swipe-like UI) */}
          <View style={styles.bookTabsWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['Favorites', ...LEVELS]}
              keyExtractor={item => item}
              contentContainerStyle={styles.tabsContainer}
              renderItem={({ item }: { item: any }) => {
                const isFav = item === 'Favorites';
                const isActive = isFav ? showFavorites : selectedLevels.includes(item);

                return (
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      isActive && styles.activeTab,
                      isFav && styles.favTab
                    ]}
                    onPress={() => toggleLevel(item)}
                  >
                    {isFav && <Ionicons name="heart" size={14} color={isActive ? palette.danger : palette.textLight} style={{ marginRight: 4 }} />}
                    <Text style={[
                      styles.tabText,
                      isActive && styles.activeTabText,
                      isFav && isActive && { color: palette.danger }
                    ]}>
                      {item}
                    </Text>
                    {isActive && <View style={[styles.activeDot, isFav && { backgroundColor: palette.danger }]} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Word List */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={palette.primary} />
            </View>
          ) : (
            <FlashList
              data={filteredWords}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={200}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconBg}>
                    <Ionicons name="sparkles" size={40} color={palette.primary} />
                  </View>
                  <Text style={styles.emptyText}>No words found here~</Text>
                  <Text style={styles.emptySubText}>Try importing or changing filters</Text>
                </View>
              }
            />
          )}

          {/* Modals */}
          <WordDetailModal
            visible={modalVisible}
            word={selectedWord}
            onClose={() => setModalVisible(false)}
          />
          <ImportResultModal
            visible={resultModalVisible}
            result={importResult}
            onClose={() => setResultModalVisible(false)}
          />
        </View>
      </SafeAreaView>
    </RabbitBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: palette.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  groupBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  importBtn: {
    // Container
  },
  importBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    marginHorizontal: spacing.l,
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.m,
    height: 50,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.text,
    height: '100%',
    fontWeight: '600',
  },
  bookTabsWrapper: {
    height: 50,
    marginBottom: spacing.m,
  },
  tabsContainer: {
    paddingHorizontal: spacing.l,
    gap: spacing.s,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  favTab: {
    backgroundColor: '#FFF0F5',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textLight,
  },
  activeTabText: {
    color: palette.primary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.primary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl * 2,
  },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: radius.l,
    marginBottom: spacing.m,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  masteredCard: {
    opacity: 0.8,
    backgroundColor: '#F8F9FA',
    borderColor: palette.border,
  },
  cardInner: {
    padding: spacing.m,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: 0.5,
  },
  masteredText: {
    color: palette.textLight,
    textDecorationLine: 'line-through',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    backgroundColor: palette.background,
    borderRadius: 12,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneticContainer: {
    backgroundColor: palette.lightBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  phonetic: {
    fontSize: 12,
    color: palette.secondary,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  posTag: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  posText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.textLight,
    fontStyle: 'italic',
  },
  meaning: {
    fontSize: 16,
    color: palette.text,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 12,
  },
  exampleBox: {
    backgroundColor: palette.background,
    padding: 10,
    borderRadius: radius.s,
    marginTop: 4,
  },
  exampleText: {
    fontSize: 14,
    color: palette.text,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  exampleCn: {
    fontSize: 12,
    color: palette.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  emptyText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubText: {
    color: palette.textLight,
    fontSize: 14,
  },
});
