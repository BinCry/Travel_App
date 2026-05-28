import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  ...commonStyles,

  // Search bar override
  searchContainer: {
    ...commonStyles.inputContainer,
    marginHorizontal: 0,
    borderWidth: 2,
    marginTop: 10,
    paddingHorizontal: 10,
  },

  headerSection: {
    rowGap: 12,
  },

  categoryRow: {
    flexDirection: 'row',
    columnGap: 8,
  },

  categoryButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  categoryButtonActive: {
    backgroundColor: colors.primary,
  },

  containerCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryIconSlot: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },

  categoryIconImage: {
    width: 20,
    height: 20,
  },

  categoryButtonText: {
    color: 'black',
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  aiCard: {
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiCardIcon: {
    width: 25,
    height: 25,
    marginRight: 12,
  },

  aiCardTextBlock: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },

  aiCardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },

  aiCardSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  aiCardArrow: {
    width: 25,
    height: 25,
    tintColor: colors.primary,
  },

  // List Container
  listWrapper: {
    marginTop: 10,
    backgroundColor: colors.surfaceMuted,
    flex: 1,
    borderRadius: 15,
  },

  // Place Card Style
  card: {
    backgroundColor: colors.surface,
    flexDirection: 'column',
    margin: 10,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: colors.borderLight,
    padding: 12,
  },

  contentContainer : {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5 
  },

  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    columnGap: 4,
  },

  TagContainer:  {
    height: 1, 
    backgroundColor: colors.surface, 
    width: '100%', 
    marginVertical: 10 
  },

  listContent: {
    paddingBottom: 32,
  },

});

export default styles;
