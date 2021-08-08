import React, { useEffect, useState } from 'react'
import { View, UIManager, Image, FlatList, Text, StyleSheet, RefreshControl } from 'react-native'
import { Header, ListItem, Icon, Overlay } from 'react-native-elements'
import axios from "axios"
import { useSelector, useDispatch } from 'react-redux';
import { setNotice } from '../reduxConfig/actions';
import PushNotification from "react-native-push-notification";
import { windowWidth } from '../constants/Constants';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function NoticeScreen({ navigation }) {
    const { userInfo, notice } = useSelector((state) => state);
    const dispatch = useDispatch();

    const [refresh, setRefresh] = useState(false)
    const [filter, setFilter] = useState(false)
    const [tempNotice, setTempNotice] = useState(notice)
    const [text, setText] = useState('')

    const getNotice = async () => {
        console.log("Getting Notice")
        axios.get("https://backend-clg-app.herokuapp.com/notice_board?pg=1", {
            headers: { 'email': userInfo.email }
        }).
            then((data) => {
                dispatch(setNotice(data.data.messages))
                setRefresh(false)
            })
    }

    useEffect(() => {
        getNotice()
    }, [])

    useEffect(() => {
        setTempNotice(notice)
    }, [notice])

    useEffect(() => {
        if (tempNotice)
            setFilters()
    }, [text])

    //Refresh Function
    const handleRefresh = () => {
        setRefresh(true)
        getNotice()
    }


    const handleNotification = (item, index) => {

        PushNotification.cancelAllLocalNotifications();

        // PushNotification.localNotification({
        //     channelId: "Notify",
        //     title: "You clicked on " + item.Heading,
        //     message: item.Status,
        //     bigText: item.Message,
        //     subText: item.Status,
        //     priority: "high",
        //     id: index,
        //     playSound: true,
        //     soundName: 'sound.mp3',
        //     autoCancel: true,
        //     vibrate: true,
        //     vibration: 300,
        //     onlyAlertOnce: true,
        // });

        // PushNotification.localNotificationSchedule({
        //     channelId: "Notify",
        //     title: "You clicked on " + item.Heading,
        //     message: item.Message,
        //     date: new Date(Date.now() + 2 * 1000),
        //     allowWhileIdle: true,
        //     vibrate: true,
        //     vibration: 300,
        //     playSound: true,
        //     autoCancel: true,
        //     soundName: 'sound.mp3',
        // });
    }

    const setFilters = () => {
        const tempData = notice.filter((item) => {
            if (text === '')
                return 1
            return item.Status.toLowerCase() === text.toLowerCase()
        })
        setTempNotice(tempData)
    }

    const filterData = [
        {
            text: "",
            name: "All",
        },
        {
            text: "Important",
            name: "Important",
        },
        {
            text: "Very Important",
            name: "Very Important",
        },
    ]


    if (!tempNotice)
        return (
            <>
                <Header
                    barStyle={'dark-content'}
                    elevated
                    backgroundColor="white"
                    containerStyle={{ backgroundColor: "white" }}
                    centerComponent={{ text: 'NOTICES', style: { fontWeight: "600", color: 'black', fontSize: 24, letterSpacing: 1 } }}
                />
                <View style={{ paddingTop: 250, justifyContent: 'center', alignItems: "center", backgroundColor: "transparent" }}>
                    <Image source={require("../assets/load2.gif")} style={{ width: 120, height: 120 }} />
                </View>
            </>
        )

    return (
        <View style={{ flex: 1 }}>
            <Overlay overlayStyle={{ justifyContent: "center", alignItems: "center", marginVertical: 250 }} isVisible={filter} onBackdropPress={() => setFilter(false)}>
                <FlatList
                    contentContainerStyle={{
                        width: windowWidth / 1.5,
                        height: "auto",
                        flexGrow: 1,
                        justifyContent: 'center'
                    }}
                    data={filterData}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {
                        return <ListItem
                            bottomDivider={filterData.length - 1 === index ? false : true}
                            topDivider={0 === index ? false : true}
                            onPress={() => {
                                setText(item.text)
                                setFilter(false)
                            }}>
                            <ListItem.Content>
                                <ListItem.Title style={styles.filterText}>
                                    {item.name}
                                </ListItem.Title>
                            </ListItem.Content>
                        </ListItem>
                    }}
                />
            </Overlay>
            <Header
                barStyle={'dark-content'}
                elevated
                backgroundColor="white"
                containerStyle={{ backgroundColor: "white" }}
                centerComponent={{ text: 'NOTICES', style: { fontWeight: "600", color: 'black', fontSize: 24, letterSpacing: 1 } }}
                rightContainerStyle={{ paddingRight: 5, paddingTop: 5 }}
                rightComponent={<Icon
                    name='filter'
                    type='font-awesome'
                    color='black'
                    size={26}
                    onPress={() => setFilter(!filter)} />}
            />
            <FlatList
                refreshControl={
                    <RefreshControl
                        refreshing={refresh}
                        onRefresh={handleRefresh} />}
                data={tempNotice}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                    const date = new Date(item.Post_Time).toDateString()
                    return (
                        <ListItem
                            bottomDivider
                            onPress={() => {
                                navigation.navigate("NoticeDetailScreen", { item });
                                handleNotification(item, index);
                            }}
                        >
                            <ListItem.Content>
                                <ListItem.Title style={styles.heading}>{item.Heading}</ListItem.Title>
                                <ListItem.Subtitle style={styles.paraStyle1}>
                                    <Text numberOfLines={2}>{item.Message}</Text>
                                </ListItem.Subtitle>
                                <ListItem.Subtitle style={styles.paraStyle3}>Date : {date}</ListItem.Subtitle>
                                <ListItem.Subtitle style={styles.paraStyle2}>Status : {item.Status}</ListItem.Subtitle>
                            </ListItem.Content>
                            <ListItem.Chevron size={30} />
                        </ListItem>
                    )
                }
                }
                ListFooterComponent={<View style={{ paddingBottom: 70, backgroundColor: "white" }}></View>}
            />

        </View>
    )
}


const styles = StyleSheet.create({
    filterText: {
        fontSize: 18,
    },
    paraStyle1: {
        fontSize: 16,
        fontFamily: "sans-serif",
        letterSpacing: 1,
        fontWeight: '600',
        color: "grey"
    },
    paraStyle2: {
        fontSize: 16,
        fontFamily: "sans-serif",
        letterSpacing: 1,
        fontWeight: '600',
        color: "#598fa0"
    },
    paraStyle3: {
        fontSize: 16,
        fontFamily: "sans-serif",
        letterSpacing: 1,
        fontWeight: '600',
        color: "#67778C"
    },
    heading: {
        fontSize: 18,
        fontFamily: "sans-serif",
        letterSpacing: 1,
        fontWeight: '600',
        color: "black"
    },
})