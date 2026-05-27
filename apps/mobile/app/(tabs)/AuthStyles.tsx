import { StyleSheet } from "react-native";

export const MAIN_COLOR = '#00AEEF';
export const BACKGROUND_COLOR = '';

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },

    container: {
        margin: 10,
        flex: 1,
        //  justifyContent: 'center',
        //backgroundColor: 'pink'
    },
    
    overlay: {
        ...StyleSheet.absoluteFillObject, // absolute, top/right/bottom/left = 0
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu đen với độ trong suốt 50%
    },

    overlayReview: {
        ...StyleSheet.absoluteFillObject, // absolute, top/right/bottom/left = 0
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Màu đen với độ trong suốt 50%
    },
    containerChild: {
        margin: 10,
        marginTop: 10,
        justifyContent: 'center',
        rowGap: 10
    },
    imageFrame: {
        width: '100%',
        height: 180,
        borderWidth: 2,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 50,
        margin: 10,
    },

    containerGG_Apple: {
        flexDirection: 'row',
        columnGap: 30,
    },
    checkbox: {
        marginRight: 10,
        width: 20,
        height: 20,
        borderRadius: 5,
        borderColor: '#ddd',
    },
    linkText: {
        color: MAIN_COLOR,
        fontWeight: '500',
    },
    containerImageGG_Apple: {
        flexDirection: 'row',
        columnGap: 10,
        alignItems: 'center'
    },
    buttonGG_Apple: {
        borderRadius: 8,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 40,

    },
    buttonGG_AppleText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: MAIN_COLOR,
        paddingVertical: 15,
        width: '100%',
        borderRadius: 50, // Bo tròn hoàn toàn hai đầu
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#020413',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },

    buttonLogOut: {
        backgroundColor: '#efdbdb',
        paddingVertical: 15,
        width: 350,
        borderRadius: 50, // Bo tròn hoàn toàn hai đầu
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        //shadowColor: '#000',
        //shadowOffset: { width: 0, height: 4 },
        //shadowOpacity: 0.2,
        //shadowRadius: 5,
        //elevation: 5,
    },
    
    avatarContainer : {
        width: 160,
        height: 160,
    },

    avatarBorder: {
        borderWidth: 3,
        borderColor: MAIN_COLOR,
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
        //borderColor: MAIN_COLOR,
        width: 50,
        height: 50,
        borderRadius: 70,
        position: 'absolute',
        bottom: 5, // combine with position to be clear
        right: 10,
        shadowColor: MAIN_COLOR,
        shadowOpacity: 0.5, 
        shadowRadius: 10, // cang be cang net, lon thi lan trong
        shadowOffset: {width: 0, height: 4},
    },

    // borderAvatar: {
    //     borderWidth: 5,
    //     borderColor: MAIN_COLOR,
    

    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    text: {
        color: '#7e7e7e',
        fontSize: 15,
        //  fontWeight: 'bold',
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#7e7e7e',
    },

    profileMenuContainer: {
        //flex: 1,
        flexDirection: 'column',
        marginHorizontal: 20,
        marginTop: 30,
        borderRadius: 30,
        overflow: 'hidden',
        //backgroundColor:'black'
    },

    profileMenuItemContainer: {
        //flex: 1,
        flexDirection: 'row',
        //position: 'relative',
        padding: 10,
        //margin: 10,
        borderRadius: 10,
        //height: 80,
        columnGap: 15,
        alignItems:'center',
        justifyContent: 'flex-start',
        borderBottomColor: '#eae4e4',
        borderBottomWidth: 2,
        backgroundColor: "#ffffff"
    },

    profileMenuItemIcon: {
        //position: 'relative',
        width: 45,
        height: 45,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },

    profileMenuTextContainer: {
        flexDirection: 'column',
        flex: 1, // làm đầy phần text thì đẩy được phần > ra ngoài cùng
        //marginRight: 70,
        //backgroundColor: 'blue'
    },
    
    roundButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    detailCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 10,
        marginTop: 20,
        borderRadius: 20,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 15,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 10,
    },

    bottomInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        fontSize: 15,
        maxHeight: 100, // giới hạn chiều cao khi nhập nhiều dòng
    },
    addPhotoIcon: {
        padding: 5,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: MAIN_COLOR
    },
})

export default styles;