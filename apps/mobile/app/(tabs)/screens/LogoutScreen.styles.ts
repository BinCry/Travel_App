import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  // Kế thừa style từ commonStyles (chứa container, imageFrame, button, buttonText...)
  ...commonStyles,

  containerChild: {
    margin: 10,
    justifyContent: 'center',
    rowGap: 10
  },

  // Style riêng cho nút Logout (màu đỏ nhạt)
  buttonLogOut: {
    backgroundColor: colors.dangerSoft,
    paddingVertical: 15,
    width: 350, // Hoặc dùng '100%' tùy layout của bạn
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  // Text màu đỏ cho nút Logout
  buttonLogOutText: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: 'bold',
  },

  titleText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  descriptionText: {
    color: colors.textMuted,
    fontSize: 17,
    textAlign: 'center',
  }
});

export default styles;