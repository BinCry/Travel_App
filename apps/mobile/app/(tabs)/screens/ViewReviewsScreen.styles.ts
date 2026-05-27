import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  ...commonStyles,

  avatarBorder: {
          borderWidth: 3,
          borderColor: colors.primary,
          width: 150,
          height: 150,
          //backgroundColor: "#fff",
      //     //backgroundColor: "#fff",
      //     borderRadius: 70,
      //     overflow: "hidden",
          borderRadius: 70,
          overflow: "hidden",
          position: 'relative',
  },

  // Bottom Input Bar (Dưới cùng màn hình)
  bottomInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  addPhotoIcon: {
    padding: 10,
    marginBottom: 2,
  },

  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginHorizontal: 10,
    fontSize: 15,
    maxHeight: 100, // Giới hạn chiều cao khi gõ nhiều dòng
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  }
});

export default styles;