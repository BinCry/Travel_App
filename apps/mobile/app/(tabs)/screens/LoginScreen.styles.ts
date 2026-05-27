import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  ...commonStyles,

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  containerChild: {
    margin: 10,
    marginTop: 10,
    justifyContent: 'center',
    rowGap: 10
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textMuted,
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    marginHorizontal: 10,
  },
  containerGG_Apple: {
    flexDirection: 'row',
    columnGap: 20,
  },
  buttonGG_Apple: {
    borderRadius: 8,
    backgroundColor: colors.surface,
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
});

export default styles;