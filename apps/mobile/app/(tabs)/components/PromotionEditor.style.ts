import { StyleSheet } from "react-native";
import { colors } from "../common/colors";

export const PromotionEditorStyles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  dateInputBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  timeToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeToggleButtonActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  }
});