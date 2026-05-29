import { StyleSheet } from 'react-native';
import { colors } from '../common/colors';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 44,
    rowGap: 16,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6edf2',
    rowGap: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroText: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  sectionCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6edf2',
    rowGap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9e3eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fbfdff',
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    columnGap: 12,
  },
  column: {
    flex: 1,
    rowGap: 8,
  },
  budgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  budgetButton: {
    flex: 1,
    minWidth: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9e3eb',
    backgroundColor: '#fbfdff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  budgetButtonActive: {
    backgroundColor: '#dff6fc',
    borderColor: colors.primary,
  },
  budgetText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  budgetTextActive: {
    color: colors.primary,
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 14,
    backgroundColor: '#f0f7fb',
    borderWidth: 1,
    borderColor: '#d9e3eb',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  helperText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stopCard: {
    borderRadius: 18,
    backgroundColor: '#fbfdff',
    borderWidth: 1,
    borderColor: '#dbe8ef',
    padding: 14,
    rowGap: 10,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  dayBadge: {
    borderRadius: 999,
    backgroundColor: '#dff6fc',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  stopTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stopMeta: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stopActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stopActionButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f8fb',
    borderWidth: 1,
    borderColor: '#d9e3eb',
  },
  stopActionDanger: {
    backgroundColor: '#fff5f5',
    borderColor: '#f7c9c7',
  },
  stopActionText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stopActionTextDanger: {
    color: colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    rowGap: 8,
    paddingVertical: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f7c9c7',
    backgroundColor: '#fff7f7',
    padding: 18,
    rowGap: 8,
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 16,
  },
  errorText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default styles;
