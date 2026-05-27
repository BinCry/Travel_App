import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  ...commonStyles,
  
  // Nút tròn đè lên ảnh
  roundButton: {
    position: 'absolute',
    top: 15,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 5,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Thẻ thông tin ngang (Rating, Price, Feature)
  detailCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    margin: 10,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 15,
  },

  iconBadge: {
    borderRadius: 12,
    margin: 12,
    padding: 8,
  },

  badgeLabel: {
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  badgeValue: {
    fontWeight: '700', 
    fontSize: 16,
    color: colors.textPrimary,
  },

  // Review Section
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    rowGap: 10,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.borderLight,
  }
});

export default styles;