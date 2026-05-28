import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";
import {
  PROFILE_AVATAR_ACTION_INSET,
  PROFILE_AVATAR_ACTION_RADIUS,
  PROFILE_AVATAR_ACTION_SIZE,
  PROFILE_AVATAR_BORDER_WIDTH,
  PROFILE_AVATAR_CONTAINER_SIZE,
  PROFILE_AVATAR_FRAME_RADIUS,
  PROFILE_AVATAR_FRAME_SIZE,
} from "../common/profileAvatar";

const styles = StyleSheet.create({
  // Kế thừa các style chung
  ...commonStyles,

  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 56,
  },

  headerSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  avatarContainer : {
    width: PROFILE_AVATAR_CONTAINER_SIZE,
    height: PROFILE_AVATAR_CONTAINER_SIZE,
  },

  avatarBorder: {
    borderWidth: PROFILE_AVATAR_BORDER_WIDTH,
    borderColor: colors.primary,
    width: PROFILE_AVATAR_FRAME_SIZE,
    height: PROFILE_AVATAR_FRAME_SIZE,
    borderRadius: PROFILE_AVATAR_FRAME_RADIUS,
    overflow: "hidden",
    position: "relative",
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: PROFILE_AVATAR_ACTION_SIZE,
    height: PROFILE_AVATAR_ACTION_SIZE,
    borderRadius: PROFILE_AVATAR_ACTION_RADIUS,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    position: "absolute",
    bottom: PROFILE_AVATAR_ACTION_INSET,
    right: PROFILE_AVATAR_ACTION_INSET,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  profileMenuContainer: {
    flexDirection: "column",
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 30,
    overflow: "hidden",
  },

  profileMenuItemContainer: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    columnGap: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    borderBottomColor: "#eae4e4",
    borderBottomWidth: 2,
    backgroundColor: "#ffffff",
  },

  profileMenuItemIcon: {
    width: 45,
    height: 45,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  profileMenuTextContainer: {
    flexDirection: "column",
    flex: 1,
  },

});

export default styles;
