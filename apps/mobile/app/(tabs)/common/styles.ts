import { colors } from "./colors";

import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 40
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },

  container: {
    flex: 1,
    margin: 6,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    margin: 10
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    width: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  roundButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkText: {
    color: colors.primary,
    fontWeight: '500',
  },

  imageFrame: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
