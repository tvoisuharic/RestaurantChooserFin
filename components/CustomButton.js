import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

class CustomButton extends Component {
  render() {
    const { text, onPress, buttonStyle, textStyle, width, disabled } = this.props;
    return (
      <TouchableOpacity
        style={[
          styles.button,
          buttonStyle,
          { width: width, backgroundColor: disabled !== null && disabled === 'true' ? '#e0e0e0' : '#303656' },
        ]}
        onPress={() => {
          if (disabled == null || disabled === 'false') {
            onPress();
          }
        }}
      >
        <Text style={[styles.text, textStyle]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
} 

CustomButton.propTypes = {
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  width: PropTypes.string,
  disabled: PropTypes.string,
}; /* End propTypes. */

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    height: 60,
    borderRadius: 8,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    paddingTop: 8,
  },
});