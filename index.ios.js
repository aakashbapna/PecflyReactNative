/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var Login = require("./components/Login")

var PecflyReactNative = React.createClass({
  render: function() {
    return (
      <Login/>
    );
  }
});



AppRegistry.registerComponent('PecflyReactNative', () => PecflyReactNative);
