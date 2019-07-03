import React, { PureComponent } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';

// Lib
import PropTypes from 'prop-types';

// Mics Constants
import * as Constants from '../Helper/Constants';

class Loader extends PureComponent {
  render() {
    const { loaderColor } = this.props;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Constants.colors.blackOpacity50} translucent />
        <ActivityIndicator size="large" color={loaderColor} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Constants.colors.transparent,
  },
});

Loader.PropTypes = {
  loaderColor: PropTypes.string.isRequired,
};

export default Loader;
