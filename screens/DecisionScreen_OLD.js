import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, ScrollView, Picker, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';

class DecisionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      restaurants: [],
      selectedPeople: [],
      filteredRestaurants: [],
      selectedRestaurant: null,
      vetoCount: 0,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    this.loadPeople();
    this.loadRestaurants();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
    return true; // Prevents the default back behavior
  };

  loadPeople = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@people');
      if (jsonValue != null) {
        this.setState({ people: JSON.parse(jsonValue) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  loadRestaurants = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@restaurants');
      if (jsonValue != null) {
        this.setState({ restaurants: JSON.parse(jsonValue), filteredRestaurants: JSON.parse(jsonValue) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  filterRestaurants = (filter) => {
    const { restaurants } = this.state;
    let filtered = restaurants;

    if (filter.cuisine) {
      filtered = filtered.filter((restaurant) => restaurant.cuisine === filter.cuisine);
    }

    if (filter.price) {
      filtered = filtered.filter((restaurant) => restaurant.price === filter.price);
    }

    if (filter.rating) {
      filtered = filtered.filter((restaurant) => restaurant.rating === filter.rating);
    }

    if (filter.delivery) {
      filtered = filtered.filter((restaurant) => restaurant.delivery === filter.delivery);
    }

    this.setState({ filteredRestaurants: filtered });
  };

  randomlyChooseRestaurant = () => {
    const { filteredRestaurants } = this.state;
    if (filteredRestaurants.length === 0) {
      Alert.alert('No Restaurants', 'No restaurants match the selected filters.');
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
    const selectedRestaurant = filteredRestaurants[randomIndex];
    this.setState({ selectedRestaurant });
  };

  vetoRestaurant = () => {
    const { selectedRestaurant, filteredRestaurants, vetoCount, selectedPeople } = this.state;
    if (!selectedRestaurant) {
      Alert.alert('No Restaurant Selected', 'Please select a restaurant first.');
      return;
    }

    const remainingPeople = selectedPeople.filter((person) => !person.vetoed);

    if (remainingPeople.length === 0) {
      Alert.alert('No Veto Left', 'All people have already vetoed.');
      return;
    }

    Alert.alert(
      'Veto Restaurant',
      `Which person would you like to use their veto on ${selectedRestaurant.name}?`,
      remainingPeople.map((person) => ({
        text: person.name,
        onPress: () => {
          this.setState((prevState) => ({
            selectedPeople: prevState.selectedPeople.map((p) =>
              p.key === person.key ? { ...p, vetoed: true } : p
            ),
            vetoCount: prevState.vetoCount + 1,
          }));
          this.randomlyChooseRestaurant();
        },
      })),
      { cancelable: true }
    );
  };

  resetSelection = () => {
    this.setState({
      selectedRestaurant: null,
      vetoCount: 0,
      selectedPeople: this.state.selectedPeople.map((person) => ({ ...person, vetoed: false })),
    });
  };

  render() {
    const { selectedRestaurant, selectedPeople, vetoCount } = this.state;

    return (
      <ScrollView style={styles.decisionScreenContainer}>
        <View style={styles.decisionScreenInnerContainer}>
          <CustomButton
            text="Who's Going"
            onPress={() => this.props.navigation.navigate('WhoGoingScreen', { people: this.state.people })}
          />
          <CustomButton
            text="Filter Restaurants"
            onPress={() => this.props.navigation.navigate('FilterScreen', { filterRestaurants: this.filterRestaurants })}
          />
          <CustomButton
            text="Randomly Choose"
            onPress={this.randomlyChooseRestaurant}
            disabled={!selectedPeople || selectedPeople.length === 0}
          />
          {selectedRestaurant && (
            <View style={styles.selectedRestaurantContainer}>
              <Text style={styles.selectedRestaurantName}>{selectedRestaurant.name}</Text>
              <Text style={styles.selectedRestaurantDetails}>
                Cuisine: {selectedRestaurant.cuisine}, Price: {selectedRestaurant.price}, Rating: {selectedRestaurant.rating}
              </Text>
              <Text style={styles.selectedRestaurantDetails}>
                Phone: {selectedRestaurant.phone}, Address: {selectedRestaurant.address}
              </Text>
              <Text style={styles.selectedRestaurantDetails}>
                Website: {selectedRestaurant.webSite}, Delivery: {selectedRestaurant.delivery}
              </Text>
              <CustomButton
                text="Veto"
                onPress={this.vetoRestaurant}
                disabled={vetoCount >= selectedPeople.length}
              />
              <CustomButton
                text="Accept"
                onPress={this.resetSelection}
                disabled={!selectedRestaurant}
              />
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

class WhoGoingScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPeople: [],
    };
  }

  togglePerson = (key) => {
    this.setState((prevState) => ({
      selectedPeople: prevState.selectedPeople.includes(key)
        ? prevState.selectedPeople.filter((k) => k !== key)
        : [...prevState.selectedPeople, key],
    }));
  };

  saveSelection = () => {
    const { selectedPeople } = this.state;
    if (selectedPeople.length === 0) {
      Alert.alert('No People Selected', 'Please select at least one person.');
      return;
    }
    const people = this.props.route.params.people;
    const selectedPeopleWithKeys = people.filter((person) => selectedPeople.includes(person.key)).map((person) => ({
      ...person,
      vetoed: false,
    }));
    this.props.navigation.goBack();
    this.props.route.params.onSelectPeople(selectedPeopleWithKeys);
  };

  render() {
    const { people } = this.props.route.params;
    const { selectedPeople } = this.state;

    return (
      <ScrollView style={styles.whoGoingScreenContainer}>
        <View style={styles.whoGoingScreenInnerContainer}>
          <FlatList
            style={styles.peopleList}
            data={people}
            renderItem={({ item }) => (
              <View style={styles.personContainer}>
                <Text style={styles.personName}>{item.name}</Text>
                <CustomButton
                  text={selectedPeople.includes(item.key) ? 'Selected' : 'Select'}
                  onPress={() => this.togglePerson(item.key)}
                  buttonStyle={{ width: 80 }}
                />
              </View>
            )}
          />
          <CustomButton
            text="Save"
            onPress={this.saveSelection}
            buttonStyle={{ width: '44%' }}
          />
          <CustomButton
            text="Cancel"
            onPress={() => this.props.navigation.goBack()}
            buttonStyle={{ width: '44%' }}
          />
        </View>
      </ScrollView>
    );
  }
}

class FilterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cuisine: '',
      price: '',
      rating: '',
      delivery: '',
    };
  }

  applyFilters = () => {
    const { cuisine, price, rating, delivery } = this.state;
    this.props.route.params.filterRestaurants({ cuisine, price, rating, delivery });
    this.props.navigation.goBack();
  };

  render() {
    return (
      <ScrollView style={styles.filterScreenContainer}>
        <View style={styles.filterScreenInnerContainer}>
          <Text style={styles.fieldLabel}>Cuisine</Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={this.state.cuisine}
              onValueChange={(itemValue) => this.setState({ cuisine: itemValue })}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="Algerian" value="Algerian" />
              <Picker.Item label="American" value="American" />
              <Picker.Item label="Chinese" value="Chinese" />
              <Picker.Item label="Italian" value="Italian" />
              <Picker.Item label="Japanese" value="Japanese" />
              <Picker.Item label="Mexican" value="Mexican" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <Text style={styles.fieldLabel}>Price</Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={this.state.price}
              onValueChange={(itemValue) => this.setState({ price: itemValue })}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
            </Picker>
          </View>
          <Text style={styles.fieldLabel}>Rating</Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={this.state.rating}
              onValueChange={(itemValue) => this.setState({ rating: itemValue })}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
            </Picker>
          </View>
          <Text style={styles.fieldLabel}>Delivery?</Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={this.state.delivery}
              onValueChange={(itemValue) => this.setState({ delivery: itemValue })}
            >
              <Picker.Item label="" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
          <View style={styles.filterScreenButtonsContainer}>
            <CustomButton
              text="Apply Filters"
              onPress={this.applyFilters}
              buttonStyle={{ width: '44%' }}
            />
            <CustomButton
              text="Cancel"
              onPress={() => this.props.navigation.goBack()}
              buttonStyle={{ width: '44%' }}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const DecisionScreenNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="DecisionScreen"
    >
      <Stack.Screen name="DecisionScreen" component={DecisionScreen} />
      <Stack.Screen name="WhoGoingScreen">
        {(props) => (
          <WhoGoingScreen
            {...props}
            onSelectPeople={(selectedPeople) => props.navigation.setParams({ selectedPeople })}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="FilterScreen" component={FilterScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  decisionScreenContainer: {
    marginTop: 20,
  },
  decisionScreenInnerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  selectedRestaurantContainer: {
    width: '96%',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  selectedRestaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedRestaurantDetails: {
    fontSize: 16,
    marginBottom: 4,
  },
  whoGoingScreenContainer: {
    marginTop: 20,
  },
  whoGoingScreenInnerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  peopleList: {
    width: '94%',
  },
  personContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
    borderColor: '#e0e0e0',
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  personName: {
    flex: 1,
  },
  filterScreenContainer: {
    marginTop: 20,
  },
  filterScreenInnerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
  },
  fieldLabel: {
    marginLeft: 10,
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  pickerContainer: {
    ...Platform.select({
      ios: {},
      android: {
        width: '96%',
        borderRadius: 8,
        borderColor: '#c0c0c0',
        borderWidth: 2,
        marginLeft: 10,
        marginBottom: 20,
        marginTop: 4,
      },
    }),
  },
  picker: {
    ...Platform.select({
      ios: {
        width: '96%',
        borderRadius: 8,
        borderColor: '#c0c0c0',
        borderWidth: 2,
        marginLeft: 10,
        marginBottom: 20,
        marginTop: 4,
      },
      android: {},
    }),
  },
  filterScreenButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default DecisionScreenNavigator;