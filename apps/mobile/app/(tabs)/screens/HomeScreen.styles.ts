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

  containerCategoryButton: {
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center'
  },

  categoryButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
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
  }

});

export default styles;