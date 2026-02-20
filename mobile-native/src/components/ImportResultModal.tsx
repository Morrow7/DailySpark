import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '../theme';
import { ImportResult } from '../utils/importHelper';

interface ImportResultModalProps {
  visible: boolean;
  result: ImportResult | null;
  onClose: () => void;
}

export default function ImportResultModal({ visible, result, onClose }: ImportResultModalProps) {
  if (!result) return null;

  const hasFailures = result.failureCount > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Import Report</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={palette.textLight} />
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={32} color={palette.success} />
              <Text style={styles.summaryValue}>{result.successCount}</Text>
              <Text style={styles.summaryLabel}>Success</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="alert-circle" size={32} color={palette.danger} />
              <Text style={[styles.summaryValue, { color: palette.danger }]}>{result.failureCount}</Text>
              <Text style={styles.summaryLabel}>Failed</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Details</Text>
            {hasFailures ? (
              <ScrollView style={styles.failureList} showsVerticalScrollIndicator={false}>
                {result.failures.map((fail, index) => (
                  <View key={index} style={styles.failureItem}>
                    <View style={styles.failureHeader}>
                      <Text style={styles.rowBadge}>Row {fail.row}</Text>
                      <Text style={styles.reasonText}>{fail.reason}</Text>
                    </View>
                    <Text style={styles.rawData} numberOfLines={1}>
                      {JSON.stringify(fail.data)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="happy-outline" size={48} color={palette.success} />
                <Text style={styles.successMsg}>All words imported perfectly!</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.l,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.success,
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textLight,
  },
  detailsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
    marginBottom: spacing.m,
  },
  failureList: {
    flex: 1,
  },
  failureItem: {
    backgroundColor: palette.background,
    padding: spacing.m,
    borderRadius: radius.s,
    marginBottom: spacing.s,
  },
  failureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
    backgroundColor: palette.lightBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reasonText: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: 13,
    color: palette.danger,
    fontWeight: '600',
  },
  rawData: {
    fontSize: 11,
    color: palette.textLight,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successMsg: {
    marginTop: spacing.m,
    fontSize: 16,
    color: palette.success,
    fontWeight: '600',
  },
  doneBtn: {
    marginTop: spacing.l,
    backgroundColor: palette.primary,
    paddingVertical: 14,
    borderRadius: radius.l,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
