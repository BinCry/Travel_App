import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  ...commonStyles,

  text: {
    color: colors.textMuted,
    fontSize: 15,
  },
  checkbox: {
    marginRight: 10,
    width: 20,
    height: 20,
    borderRadius: 5,
    borderColor: colors.border,
  },

  containerGG_Apple: {
    flexDirection: 'row',
    columnGap: 20,
    marginTop: 10,
  },
  buttonGG_Apple: {
    borderRadius: 8,
    backgroundColor: colors.surface, // Sử dụng surface thay vì white
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 45,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerImageGG_Apple: {
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center'
  },
  buttonGG_AppleText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textMuted,
  },
});

export default styles;