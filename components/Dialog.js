var React = require("react-native");
var {View, StyleSheet, NavigatorIOS, TouchableOpacity, ActivityIndicatorIOS, Text, Modal, Image, TextInput, Component} = React;


export default class Dialog extends Component {
  constructor(props){
    super(props)
    //console.log("initing with props:", props)
    this.state = {
        is_visible: props.is_visible
    }
  }

  componentWillReceiveProps(nextProps){
    //console.log(nextProps)
    if(this.state.is_visible !== nextProps.is_visible ) {
      this.setState({is_visible: nextProps.is_visible})
    }
  }


  render() {
    return <Modal
      transparent={true}
      visible={this.state.is_visible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalInnerContainer}>
          {this.props.children}
        </View>
      </View>
    </Modal>
  }
}

var styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor:'rgba(0, 0, 0, 0.7)',
  },
  modalInnerContainer: {
    borderRadius: 2,
    backgroundColor: "#fff",
    padding:20,
    alignItems:"center"
  },
});
