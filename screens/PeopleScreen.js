import React from "react";
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import {
    Alert,
    BackHandler,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native';
import { Picker } from "@react-native-picker/picker";
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';
import { GluestackUIProvider  } from "@gluestack-ui/themed-native-base";
import Toast from "react-native-toast-message";

const styles = StyleSheet.create({
    listScreenContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? Constants.statusBarHeight : 0,
    },
    personList : {
        width: '94%',
    },
    personContainer : {
        flexDirection: 'row',
        marginTop: 4,
        marginBottom: 4,
        borderColor: '#e0e0e0',
        borderBottomWidth: 2,
        alignItems: 'center',
    },
    personName : {
        flex: 1,
        
    },
    addScreenContainer: {
        marginTop: Constants.statusBarHeight,
    },
    addScreenInnerContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        width: '100%',
    },
    addScreenFormContainer: {
        width: '96%',
    },
    fieldLabel: {
        marginLeft: 10,
    },
    pickerContainer: {
        borderRadius: 8,
        borderColor: '#c0c0c0',
        borderWidth: 2,
        width: '96%',
        marginLeft: 10,
        marginBottom: 20,
        marginTop: 4,
    },
    picker: {
        width: '96%',
    },
    addScreenButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});

class ListScreen extends React.Component {
    constructor(inProps) {
        super(inProps);
        this.state = {
            listData: [],
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => true);

        this.loadPeople();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    loadPeople = async () => {
        try {
            const people = await AsyncStorage.getItem('people');
            const listData = people ? JSON.parse(people) : [];
            this.setState({listData});
        } catch(error) {
            console.error('Failed to load people: ', error);
        }
    };

    deletePerson = async (item) => {
        try {
            const people = await AsyncStorage.getItem('people');
            let listData = people ? JSON.parse(people) : [];
            listData = listData.filter((person) => person.key !== item.key);
            await AsyncStorage.setItem('people', JSON.stringify(listData));
            this.setState({listData});

            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Person deleted',
                visibilityTime: 2000,
            });
        } catch (error) {
            console.error('Failed to delete person: ', error);
        }
    };

    render() {
        return(
            <GluestackUIProvider>
            <View style = {styles.listScreenContainer}>
                <CustomButton
                    text = 'Add Person'
                    width = '94%'
                    onPress = {() => this.props.navigation.navigate("AddScreen")}
                />
                <FlatList style = {styles.personList} data = {this.state.listData} keyExtractor={(item) => item.key}
                    renderItem={({item}) => (
                        <View style = {styles.personContainer}>
                            <Text style = {styles.personName}>{item.firstName} {item.lastName} ({item.relationship})
                            </Text>
                            <CustomButton
                                text = 'Delete'
                                onPress = {() =>
                                    Alert.alert(
                                        "Please confirm",
                                        "Are you sure you want to delete this person?",
                                        [
                                            {text: 'Yes', onPress: () => this.deletePerson(item)},
                                            {text: 'No'},
                                            {text: 'Cancel', style: 'cancel'},
                                        ],
                                        {cancelable: true}
                                    )
                                }
                            />
                        </View>
                    )}
                />
            </View>
        </GluestackUIProvider>
        );
    }
}

class AddScreen extends React.Component {
    constructor(inProps) {
        super(inProps);
        this.state = {
            firstName: '',
            lastName: '',
            relationship: '',
            key : `r_${new Date().getTime()}`,
            errors : {}
        };
    }

    validateFirstName = (firstName) => {
        if (!firstName.trim()) {
            return "First Name is required";
        }
        if (firstName.length < 2) {
            return "First Name must be at least 2 characters";
        }
        if (!/^[a-zA-Z0-9\s,'-]*$/.test(firstName)) {
            return "First Name contains invalid characters";
        } 
        return null;
    };

    validateLastName = (lastName) => {
        if (!lastName.trim()) {
            return "Last Name is required";
        }
        if (lastName.length < 2) {
            return "Last Name must be at least 2 characters";
        }
        if (!/^[a-zA-Z0-9\s,'-]*$/.test(lastName)) {
            return "Last Name contains invalid characters";
        } 
        return null;
    };

    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            [field] : value,
            errors: {
                ...prevState.errors,
                [field] : null
            }
        }));
    };

    validateAllFields = () => {
        const { firstName, lastName, relationship } = this.state;

        const errors = {
            firstName: this.validateFirstName(firstName),
            lastName: this.validateLastName(lastName),
            relationship: !relationship ? "Relationship is required" : null,
        };

        this.setState({ errors });
        return !Object.values(errors).some(error => error !== null);
    };

    savePerson = async () => {
        if (!this.validateAllFields()) {
            const firstErrorField = Object.keys(this.state.errors).find(
                key => this.state.errors[key]
            );
            if (firstErrorField) {
                Toast.show({
                    type: 'error',
                    position: 'bottom',
                    text1: 'Validation Error',
                    text2: this.state.errors[firstErrorField],
                    visibilityTime: 3000
                });
            }
            return;
        }

        try {
            const people = await AsyncStorage.getItem('people');
            const listData = people ? JSON.parse(people) : [];
            listData.push(this.state);
            await AsyncStorage.setItem('people', JSON.stringify(listData));

            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Person saved successfully',
                visibilityTime: 2000,
            });

            this.props.navigation.navigate('ListScreen')
        } catch (error) {
            console.error('Failed to save person: ', error);

            Toast.show({
                type: 'error',
                position: 'bottom',
                text1: 'Error saving person',
                text2: 'Please try again',
                visibilityTime: 3000,
            });
        }
    };

    render() {
        const { errors } = this.state;
        return(
            <GluestackUIProvider>
                <ScrollView style = {styles.addScreenContainer}>
                    <View style = {styles.addScreenInnerContainer}>
                        <View style = {styles.addScreenFormContainer}>
                        <CustomTextInput
                            label = 'First name'
                            maxLength = {50}
                            stateHolder = {this}
                            stateFieldName = 'firstName'
                            onChangeText = { (text) => this.handleInputChange('firstName', text)}
                            error = { errors.firstName }
                        />
                        <CustomTextInput
                            label = 'Last name'
                            maxLength = {20}
                            stateHolder = {this}
                            stateFieldName = 'lastName'
                            onChangeText = { (text) => this.handleInputChange('lastName', text) }
                            error = { errors.lastName }
                        />
                        <Text style = {styles.fieldLabel}>Relationship</Text>
                        <View style = {[
                            styles.pickerContainer,
                            errors.relationship ? {borderColor : 'red'} : {}
                        ]}>
                            <Picker
                                style = {styles.picker}
                                selectedValue = {this.state.relationship}
                                onValueChange = {(itemValue) =>
                                    this.handleInputChange('relationship', itemValue)
                                }
                            >
                                <Picker.Item label = 'Select a relationship...' value = ''/>
                                <Picker.Item label = 'Me' value = 'me'/>
                                <Picker.Item label = 'Family' value = 'family'/>
                                <Picker.Item label = 'Friend' value = 'friend'/>
                                <Picker.Item label = 'Coworker' value = 'coworker'/>
                                <Picker.Item label = 'Other' value = 'other'/>
                            </Picker>
                        </View>
                            {errors.relationship && (
                                <Text style = {{ color: 'red', marginLeft: 10, marginBottom: 10 }}>
                                    {errors.relationship}
                                </Text>
                            )}
                        </View>
                        <View style = {styles.addScreenButtonsContainer}>
                            <CustomButton
                                text = 'Cancel'
                                width = '44%'
                                onPress = {() => this.props.navigation.navigate('ListScreen')}
                            />
                            <CustomButton
                                text = 'Save'
                                width = '44%'
                                onPress = {this.savePerson}
                            />
                        </View>
                    </View>
                </ScrollView>
            </GluestackUIProvider>
        );
    }
}

const Stack = createStackNavigator();

const PeopleScreen = () => {
    return(
        <Stack.Navigator
            screenOptions = {{headerShown: false}}
            initialRouteName = 'ListScreen'
        >
            <Stack.Screen name="ListScreen" component={ListScreen}/>
            <Stack.Screen name="AddScreen" component={AddScreen}/>
        </Stack.Navigator>
    );
};

export default PeopleScreen;