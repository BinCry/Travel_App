import { StyleSheet } from "react-native";
import { colors } from "../common/colors";
import { commonStyles } from "../common/styles";

const styles = StyleSheet.create({
    ...commonStyles,

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    containerEdit: {
        flexDirection: 'row',
        columnGap: 20,
    },
    buttonEdit: {
        borderRadius: 8,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 45,
        borderWidth: 1,
        borderColor: colors.border,
    },
    containerImageEdit: {
        flexDirection: 'row',
        columnGap: 10,
        alignItems: 'center'
    },
    buttonEditText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 15,
        marginHorizontal: 10,
        // Tạo bóng đổ cho Card
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    imageWrapper: {
        width: 110,
        height: 110,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
        flex: 1,
        marginRight: 5,
    },
    statusTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 11,
        color: '#856404',
        fontWeight: '600',
        marginLeft: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#90a4ae',
        marginTop: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 10,
    },
    btnEdit: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f3f5',
        paddingVertical: 8,
        borderRadius: 8,
    },
    btnEditText: {
        marginLeft: 5,
        fontSize: 13,
        fontWeight: '600',
        color: '#212121',
    },
    btnOffers: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00abff',
        paddingVertical: 8,
        borderRadius: 8,
    },
    btnOffersText: {
        marginLeft: 5,
        fontSize: 13,
        fontWeight: '600',
        color: '#00abff',
    },
});

export default styles;