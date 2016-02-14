var React = require("react-native");
var {View, StyleSheet, NavigatorIOS, Text, TextInput, ActivityIndicatorIOS, Animated, Image,TouchableOpacity, Component} = React;
var api = require("../lib/myswag-api");
var _ = require("lodash");
var Dialog = require("./Dialog");
var utils = require("../lib/utils")


var OfferDialog = module.exports = React.createClass({
  getInitialState: function() {
    return {
      is_visible: false,
      is_loading: false,
      is_done: false,
      error: null,
    };
  },
  sendOfferToServer: utils.autodone( async function() {
    //this.refs.offerModal.show();
    var offer_price = this.state.offer_price;
    this.setState({is_loading: true, is_done:false, error: null});
    try{
      var response = await api.listing.makeOffer({id:this.props.listing.id, price: this.state.offer_price});
      this.setState({is_loading: false, is_done: true});
    } catch(e) {
      this.setState({is_loading: false, is_done: false, error: e})
    }
  }),
  toggleOfferDialog: function(){
      //this.setState({is_visible: !this.state.is_visible});
      this.props.toggleOfferDialog();
  },
  componentWillReceiveProps(nextProps){
      if(nextProps.is_visible !== this.state.is_visible) {
        this.setState({is_visible: nextProps.is_visible, is_done:false, is_loading: false})
        //this.state.is_visible && this.refs.text.focus()
      }
  },

  render: function(){
    var listing = this.props.listing;
    if(this.state.is_visible == false){
      return <View/>
    }

    if(this.state.is_loading)
    {  return <Dialog is_visible={this.state.is_visible}>
          <View style={styles.row}>
            <ActivityIndicatorIOS style={styles.modalSpinner} />
            <Text>Sending...</Text>
          </View>
      </Dialog>
    }

    if(this.state.is_done) {
      return <Dialog is_visible={this.state.is_visible}>
                <Text>Your offer is sent successfully to {listing.seller.first_name}! Listing saved in My Listings.</Text>
                <TouchableOpacity
                   style={styles.marginTop}
                  onPress={this.toggleOfferDialog}
                >
                  <Text style={styles.sendButton}>DONE</Text>
                </TouchableOpacity>
        </Dialog>
    }

    return  <Dialog is_visible={this.state.is_visible}>
                      <View style={[styles.row]}>
                        <Text>Original Price: </Text>
                        <Text>Rs.{listing.price}</Text>
                      </View>
                      <View style={[styles.row, styles.marginTop]}>
                        <Text style={{flex:1}}>Rs.</Text>
                        <TextInput autoFocus={true} ref="text" style={styles.inputBoxes} keyboardType={"numeric"} value={this.state.offer_price} onChangeText={(offer_price)=>this.setState({offer_price})} placeholder="Price you want to pay"/>
                      </View>
                      <View style={[styles.row, styles.marginTop]}>
                        <TouchableOpacity
                          onPress={this.toggleOfferDialog}
                          >
                          <Text style={styles.cancelButton}>cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.sendOfferToServer}
                          >
                          <Text style={styles.sendButton}>SEND OFFER</Text>
                        </TouchableOpacity>
                      </View>
                      {this.state.error? <Text style={styles.error}>Something went wrong, please try again.</Text>: <View/>}
          </Dialog>
  }
});


var styles = StyleSheet.create({
  row: {
    flex:1,
    flexDirection: "row",
    alignItems: "center",
  },
  marginTop:{
    marginTop: 10,
  },
  inputBoxes: {
      padding: 5,
      backgroundColor: "#f7f7f7",
      flex:1,
      width:200,
      height:40
    },
  sendButton: {
      backgroundColor:"#5F5182",
      padding: 5,
      color:"#fff",
  },
  cancelButton: {
    backgroundColor: "#fff",
    color: "#5F5182",
    marginRight: 10
  },
  modalSpinner: {
    marginRight: 5,
  },
  error:{
    color: "red",
    fontSize: 10,
  }
});
