import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '../theme';
import { articleApi } from '../services/api';
import { WordStorage } from '../utils/storage';
import WordDetailModal from '../components/WordDetailModal';
import { Word } from '../data/mockWords';

export default function ReadingScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userWords, setUserWords] = useState<Word[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesData, wordsData] = await Promise.all([
        articleApi.getArticles(),
        WordStorage.loadWords()
      ]);

      if (Array.isArray(articlesData)) {
        setArticles(articlesData);
      }

      if (wordsData) {
        setUserWords(wordsData);
      }
    } catch (err) {
      console.log('Failed to load reading data', err);
    } finally {
      setLoading(false);
    }
  };

  const findWord = (text: string) => {
    const cleanText = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanText) return null;

    // 1. Check local storage
    const found = userWords.find(w => w.word.toLowerCase() === cleanText);
    if (found) return found;

    // 2. Return temp object
    return {
      id: Date.now().toString(),
      word: cleanText,
      phonetic_uk: '/.../',
      phonetic_us: '/.../',
      part_of_speech: 'unknown',
      meaning: '点击了单词: ' + cleanText + ' (未在本地词库中找到)',
      level: 'CET4' as any,
      tags: [],
      examples: [],
      synonyms: [],
      antonyms: [],
      roots: ''
    };
  };

  const handleWordClick = (text: string) => {
    const wordData = findWord(text);
    if (wordData) {
      setSelectedWord(wordData);
      setModalVisible(true);
    }
  };

  const handleToggleFavorite = async (word: Word) => {
    if (word.id === -1 || !word.id) return; // Cannot toggle for temp words

    const updatedWord = { ...word, isFavorite: !word.isFavorite };
    const success = await WordStorage.updateWord(updatedWord);
    if (success) {
      // Update local state
      setUserWords(prev => prev.map(w => w.id === word.id ? updatedWord : w));
      setSelectedWord(updatedWord);
    }
  };

  const renderArticleList = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reading</Text>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Today's Pick</Text>
        <Text style={styles.heroValue}>{articles[0]?.title || 'Loading...'}</Text>
        <Text style={styles.heroDesc}>{articles[0]?.readTime || '5 min'} • {articles[0]?.level || 'General'}</Text>
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => setSelectedArticle(articles[0])}
          disabled={!articles.length}
        >
          <Text style={styles.readBtnText}>Read Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>All Articles</Text>
      {loading ? (
        <ActivityIndicator size="large" color={palette.primary} />
      ) : (
        articles.map(article => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => setSelectedArticle(article)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{article.category || 'General'}</Text>
              </View>
              <Text style={styles.levelText}>{article.level}</Text>
            </View>
            <Text style={styles.articleTitle}>{article.title}</Text>
            <View style={styles.cardFooter}>
              <Ionicons name="time-outline" size={14} color={palette.textLight} />
              <Text style={styles.timeText}>{article.readTime || '5 min'}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderReader = () => {
    if (!selectedArticle) return null;

    // Split content into paragraphs and words for interaction
    const paragraphs = selectedArticle.content.split('\n');

    return (
      <View style={styles.readerContainer}>
        {/* Reader Header */}
        <View style={styles.readerHeader}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={palette.text} />
          </TouchableOpacity>
          <View style={styles.readerTitleContainer}>
            <Text style={styles.readerHeaderTitle} numberOfLines={1}>{selectedArticle.title}</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="bookmark-outline" size={24} color={palette.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.readerContent}>
          <Text style={styles.readerTitle}>{selectedArticle.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{selectedArticle.category} • {selectedArticle.level}</Text>
          </View>

          {paragraphs.map((para, pIndex) => (
            <Text key={pIndex} style={styles.paragraph}>
              {para.split(' ').map((word, wIndex) => (
                <Text
                  key={`${pIndex}-${wIndex}`}
                  onPress={() => handleWordClick(word)}
                  style={styles.word}
                >
                  {word}{' '}
                </Text>
              ))}
            </Text>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {selectedArticle ? renderReader() : renderArticleList()}

      <WordDetailModal
        visible={modalVisible}
        word={selectedWord}
        onClose={() => setModalVisible(false)}
        onToggleFavorite={handleToggleFavorite}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.m, paddingBottom: spacing.xl },
  title: { fontSize: 28, fontWeight: '800', color: palette.text, marginBottom: spacing.m },

  // Hero
  hero: { backgroundColor: palette.primary, borderRadius: radius.l, padding: spacing.l, marginBottom: spacing.l },
  heroTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8 },
  heroDesc: { color: 'rgba(255,255,255,0.9)', marginTop: 8, fontSize: 14 },
  readBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', marginTop: 16 },
  readBtnText: { color: palette.primary, fontWeight: '700' },

  // List
  sectionTitle: { fontSize: 20, fontWeight: '700', color: palette.text, marginBottom: spacing.m },
  articleCard: { backgroundColor: palette.card, borderRadius: radius.m, padding: spacing.m, marginBottom: spacing.m, borderWidth: 1, borderColor: palette.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryTag: { backgroundColor: palette.inputBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, color: palette.textLight, fontWeight: '600' },
  levelText: { fontSize: 12, color: palette.primary, fontWeight: '600' },
  articleTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12, color: palette.textLight, marginLeft: 4 },

  // Reader
  readerContainer: { flex: 1, backgroundColor: palette.background },
  readerHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, borderBottomWidth: 1, borderBottomColor: palette.border, backgroundColor: palette.card },
  backBtn: { marginRight: 16 },
  readerTitleContainer: { flex: 1 },
  readerHeaderTitle: { fontSize: 16, fontWeight: '600', color: palette.text },
  actionBtn: { marginLeft: 16 },
  readerContent: { padding: spacing.l },
  readerTitle: { fontSize: 24, fontWeight: '800', color: palette.text, marginBottom: 8 },
  metaRow: { marginBottom: 24 },
  metaText: { color: palette.textLight, fontWeight: '600' },
  paragraph: { fontSize: 18, lineHeight: 30, color: palette.text, marginBottom: 20, textAlign: 'left' },
  word: { fontSize: 18, lineHeight: 30, color: palette.text },
});
