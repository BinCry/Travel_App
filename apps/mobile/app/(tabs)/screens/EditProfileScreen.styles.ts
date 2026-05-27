import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
  // Kế thừa các style chung
  ...commonStyles,

    avatarContainer : {
        width: 160,
        height: 160,
    },
  
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
  
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        //borderWidth: 5,
        //borderColor: colors.primary,
        width: 50,
        height: 50,
        borderRadius: 70,
        position: 'absolute',
        bottom: 5, // combine with position to be clear
        right: 10,
        shadowColor: colors.primary,
        shadowOpacity: 0.5, 
        shadowRadius: 10, // cang be cang net, lon thi lan trong
        shadowOffset: {width: 0, height: 4},
    },
  
      // borderAvatar: {
      //     borderWidth: 5,
      //     borderColor: colors.primary,

    containerChild: {
        margin: 10,
        marginTop: 10,
        justifyContent: 'center',
        rowGap: 10
    },
      
});

export default styles;
