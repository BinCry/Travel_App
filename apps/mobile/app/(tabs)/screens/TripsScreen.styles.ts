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
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  heroCard: {
    marginTop: 14,
    marginBottom: 18,
    borderRadius: 28,
    backgroundColor: '#eefbff',
    padding: 20,
    borderWidth: 1,
    borderColor: '#cfeffc',
    rowGap: 10,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d7f3fb',
  },
  heroTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heroBody: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
  card: {
    marginBottom: 14,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e7eef3',
    rowGap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#e7f8ef',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  destination: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: '#f3f7fb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  noteText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    columnGap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d8e8f0',
    backgroundColor: '#f8fcff',
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonDanger: {
    borderColor: '#f7c9c7',
    backgroundColor: '#fff6f5',
  },
  actionButtonText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionButtonTextPrimary: {
    color: colors.white,
  },
  actionButtonTextDanger: {
    color: colors.danger,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 26,
    rowGap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  errorCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f7c9c7',
    backgroundColor: '#fff7f7',
    padding: 18,
    rowGap: 8,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
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
