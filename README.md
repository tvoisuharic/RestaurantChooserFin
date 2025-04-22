# 🍽️ Restaurant Chooser App

**Restaurant Chooser** is a mobile app built with **React Native** that helps a group of people decide on a restaurant, taking into account their individual preferences and allowing vetoes during the voting process.


## 🚀 Features

- 📋 Manage a list of restaurants with detailed info  
- 🧑 Add and manage participants  
- 🎛️ Set personal filters (price, cuisine, rating, delivery)  
- 🔄 Sequential voting by participants  
- ❌ Veto functionality for proposed restaurants  
- ✅ Automatically select a final restaurant that satisfies all conditions  
- 🔍 Full-featured form validation for robust UX  
- 🧠 Data persistence using **AsyncStorage**

---

## 📂 Project Structure

- `screens/RestaurantsScreen.js` — displays the list of restaurants  
- `screens/AddRestaurantScreen.js` — form to add a new restaurant  
- `screens/PeopleListScreen.js` — displays the list of people  
- `screens/AddPersonScreen.js` — form to add a person  
- `screens/WhosGoingScreen.js` — lets users select who is going  
- `screens/PreFiltersScreen.js` — screen for setting individual preferences  
- `screens/ChoiceScreen.js` — restaurant voting flow  
- `screens/PostChoiceScreen.js` — final result screen  
- `Navigation.js` — handles tab and stack navigation

---

## 🧪 Form Validation

Forms in the app follow strict UX standards:

- Each field has its own validation logic (name, phone, website, etc.)
- Validates for required values, format, and minimum length
- Displays clear and specific error messages under each field
- Invalid fields are highlighted with a red border
- Shows toast messages on submission errors
- Automatically focuses the first invalid field
- Prevents form submission until all fields are valid
- Uses appropriate keyboard types (`phone-pad`, `url`, etc.)

---

## 📦 Tech Stack

- `React Native`  
- `Expo`  
- `@react-navigation/native`  
- `@react-navigation/material-top-tabs`  
- `@react-navigation/stack`  
- `@react-native-async-storage/async-storage`  
- `@react-native-picker/picker`

---

## 📋 Prerequisites

- Node.js v18+  
- npm (v9+) or yarn (v1.22+)  
- Expo CLI (globally installed)  
- Android Studio / Xcode (for emulators) or Expo Go app (for physical devices)

## ⚙️ Installation & Setup

Clone the repository:

```bash
git clone https://github.com/Kirito200207/RestaurantChooser
cd RestaurantChooser
npm install
```

## ▶️ Running the App (Development Mode)

Start the development server:

```bash
npx expo start
```

You’ll see a QR code in your terminal. Choose one of these options:

📱 Physical Device
Install Expo Go on your phone

Scan the QR code using your camera or Expo Go app

💻 Emulator
Press i for iOS simulator

Press a for Android emulator
