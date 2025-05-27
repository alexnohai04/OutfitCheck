import React, { useRef, useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    PanResponder,
    Dimensions,
    FlatList
} from "react-native";
import { SYMBOL_ICONS } from "../constants/symbolIcons";
import apiClient from "../apiClient";
import API_URLS from "../apiConfig";
import OutfitPreview from "../reusable/OutfitPreview";
import { processClothingItems } from "../utils/imageUtils";
import {useNavigation} from "@react-navigation/native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;
const CLOSED_OFFSET = SCREEN_HEIGHT * 0.4;
const DRAG_THRESHOLD = 50;

const ClothingItemDetailsScreen = ({ route }) => {
    const { item } = route.params;
    const [isOpen, setIsOpen] = useState(false);
    const [outfits, setOutfits] = useState([]);
    const navigation = useNavigation();

    // Image scale and position animation values
    const initialImageHeight = SCREEN_HEIGHT * 0.35;
    const minimizedScale = (SCREEN_HEIGHT * 0.22) / initialImageHeight;
    const imageScale = useRef(new Animated.Value(1)).current;
    const imageTranslateY = useRef(new Animated.Value(0)).current;

    // Bottom sheet animation value
    const translateY = useRef(new Animated.Value(CLOSED_OFFSET)).current;

    // Open/close functions
    const openSheet = () => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 0,
                tension: 60,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(imageScale, {
                toValue: minimizedScale,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(imageTranslateY, {
                toValue: -(initialImageHeight * (1 - minimizedScale) / 2) - 200,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setIsOpen(true));
    };

    const closeSheet = () => {
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: CLOSED_OFFSET,
                tension: 60,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(imageScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(imageTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setIsOpen(false));
    };

    const handlePanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
            onPanResponderMove: (_, gesture) => {
                const offset = isOpen ? gesture.dy : CLOSED_OFFSET + gesture.dy;
                if (offset >= 0 && offset <= CLOSED_OFFSET) translateY.setValue(offset);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy < -DRAG_THRESHOLD) openSheet();
                else if (gesture.dy > DRAG_THRESHOLD) closeSheet();
                else (isOpen ? openSheet() : closeSheet());
            },
        })
    ).current;

    useEffect(() => {
        translateY.setValue(CLOSED_OFFSET);
        // fetch outfits
        (async () => {
            try {
                const res = await apiClient.get(
                    API_URLS.GET_OUTFITS_CONTAINING_CLOTHING_ITEM(item.id)
                );
                const processed = await Promise.all(
                    res.data.map(async (o) => ({
                        ...o,
                        clothingItems: await processClothingItems(o.clothingItems)
                    }))
                );
                setOutfits(processed.sort((a,b)=>b.id-a.id));
            } catch(e) { console.error(e); }
        })();
    }, []);

    const renderOutfits = () => (
        <FlatList
            data={outfits}
            keyExtractor={(it,idx)=>it.id?.toString()||`add-${idx}`}
            renderItem={({item})=>(
                <TouchableOpacity
                    style={styles.horizontalItem}
                    onPress={()=>navigation.navigate('OutfitDetails',{outfitId:item.id})}
                >
                    <OutfitPreview clothingItems={item.clothingItems} compact />
                </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Keep title at top */}
            <View style={styles.screenHeaderWrapper}>
                <Text style={styles.screenHeader}>{item.brand} {item.articleType}</Text>
            </View>
            {/* Centered image */}
            <View style={styles.imageContainerWrapper}>
                <Animated.View style={[
                    styles.imageWrapper,
                    { transform:[{translateY:imageTranslateY},{scale:imageScale}] }
                ]}>
                    <Animated.Image
                        source={{uri:item.base64Image}}
                        style={styles.imageFull}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>
            <Animated.View style={[styles.panelContainer,{transform:[{translateY}]}]}>
                <View {...handlePanResponder.panHandlers}>
                    <TouchableOpacity
                        style={styles.panelHandle}
                        activeOpacity={0.7}
                        onPress={()=>isOpen?closeSheet():openSheet()}
                    />
                </View>
                <Text style={styles.title}>Item Details</Text>
                <ScrollView contentContainerStyle={styles.detailsContainer}>
                    {/* details... */}
                    <Text style={styles.detailLabel}>Base Color:</Text>
                    <Text style={styles.detailValue}>{item.baseColor}</Text>
                    <Text style={styles.detailLabel}>Brand:</Text>
                    <Text style={styles.detailValue}>
                        {item.brand || 'Unknown'}
                    </Text>
                    <Text style={styles.detailLabel}>Style:</Text>
                    <Text style={styles.detailValue}>{item.usage}</Text>
                    <Text style={styles.detailLabel}>Season:</Text>
                    <Text style={styles.detailValue}>{item.season}</Text>
                    {item.careSymbols?.length>0&&(
                        <View style={styles.instructionsSection}>
                            <Text style={styles.sectionTitle}>Care Instructions</Text>
                            {item.careSymbols.map(sym=>{
                                const icon=SYMBOL_ICONS[sym];
                                return <View key={sym} style={styles.careInstructionItem}>
                                    {icon&&<Animated.Image source={icon} style={styles.careIcon} resizeMode="contain" />}
                                    <Text style={styles.careText}>{sym}</Text>
                                </View>;
                            })}
                        </View>
                    )}
                    <View style={styles.instructionsSection}>
                        <Text style={styles.sectionTitle}>Used in the following outfits</Text>
                        {outfits.length===0?<Text style={styles.detailValue}>This item is not used in any outfits yet.</Text>:renderOutfits()}
                    </View>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles=StyleSheet.create({
    container:{flex:1,backgroundColor:"#1E1E1E"},
    screenHeaderWrapper:{padding:16,alignItems:'center'},
    screenHeader:{fontSize:24,fontWeight:'700',color:'#fff'},
    imageContainerWrapper:{flex:1,justifyContent:'center',alignItems:'center'},
    imageWrapper:{height:SCREEN_HEIGHT*0.35,width:SCREEN_WIDTH*0.8,overflow:'hidden',borderRadius:12},
    imageFull:{width:'100%',height:'100%'},
    panelContainer:{position:'absolute',bottom:0,width:'100%',height:BOTTOM_SHEET_HEIGHT,backgroundColor:'#1E1E1E',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,shadowColor:'#000',shadowOffset:{width:0,height:-4},shadowOpacity:0.3,shadowRadius:6,elevation:10},
    panelHandle:{width:60,height:6,backgroundColor:'#888',borderRadius:3,alignSelf:'center',marginBottom:10},
    title:{fontSize:20,fontWeight:'700',color:'#FFF',textAlign:'center',marginBottom:16},
    detailsContainer:{paddingBottom:24},
    detailLabel:{fontSize:14,color:'#AAA',fontWeight:'600'},
    detailValue:{fontSize:16,color:'#EEE',marginBottom:12},
    instructionsSection:{marginTop:20},
    sectionTitle:{fontSize:16,fontWeight:'700',color:'#FF6B6B',marginBottom:10},
    careInstructionItem:{flexDirection:'row',alignItems:'center',marginBottom:8,gap:8},
    careIcon:{width:28,height:28},
    careText:{fontSize:14,color:'#CCC',flexShrink:1},
    horizontalItem:{marginRight:12,width:SCREEN_WIDTH/3.5,maxHeight:250}
});

export default ClothingItemDetailsScreen;
