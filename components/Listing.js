var React = require("react-native");
var {View, StyleSheet, NavigatorIOS, Text, TextInput, Image,TouchableOpacity, Component} = React;
var api = require("../lib/myswag-api");
var _ = require("lodash");
var Conversation = require("./Conversation");
var OfferDialog = require("./OfferDialog");
var Dialog = require("./Dialog")

var utils = require("../lib/utils");


var Listing= module.exports = React.createClass({
    getInitialState: function() {
      return {
        is_sending_offer: false,
        extrasBox_scaleY: 0,
        extrasBox_rotateX: 60,
        is_offer_dialog_visible: false,
      };
    },
    openChat: function(){
      var target_user = this.props.listing.seller;
      var listing = this.props.listing;
      this.props.navigator.push({
        title: "Chat with "+target_user.name,
        component: Conversation,
        passProps: {target_user, listing}
      })
    },
    openExtras: function(){
      //LayoutAnimation.spring();

      if(this.state.extrasBox_scaleY.__getValue() <= 0){
        //this.setState({extrasBox_scaleY: 0, extrasBox_rotateX: "30deg" });
        Animated.parallel([
          Animated.timing(this.state.extrasBox_rotateX, {toValue:0, duration: 1000}),
          Animated.timing(
            this.state.extrasBox_scaleY,
            {
              toValue: 1,
              duration: 1000,
            }
          )
        ]).start();
      } else {
        Animated.timing(
          this.state.extrasBox_scaleY,
          {
            toValue: 0,
            duration: 100,
          }
        ).start();
      }

    },
    toggleOfferDialog: function(){
        this.setState({is_offer_dialog_visible: !this.state.is_offer_dialog_visible});
        //this.setState({is_offer_dialog_visible: true});

    },
    render: function() {
      var user_mutual_friends = [];
      var is_own_listing = false;
      if(this.props.currentUser != null) {
        user_mutual_friends =  _.intersection(this.props.currentUser.fb_friend_ids, this.props.listing.seller.fb_friend_ids);
        is_own_listing = this.props.currentUser.id == this.props.listing.seller_id
      }

      var distance = "N/A";
      var listing = this.props.listing;
      if(this.props.currentLocation) {
        distance = utils.distanceKM(listing.geo_location.lat, listing.geo_location.lon, this.props.currentLocation.lat, this.props.currentLocation.lon)+"km"
      }

      //let image_width =  window.screen.availWidth< 700? window.screen.availWidth-22 : 678;
      //var image_params = "w"+image_width +"-h500-c";

      return (<View style={styles.container}>
          <Text style={styles.titleStyle}>{listing.title}</Text>
          <View style={styles.userBar}>
            <Image source={{uri:listing.seller.picture_url}} style={styles.userThumb}></Image>
            <View style={{flex:99}}>
              <Text>{listing.seller.name}</Text>
              <Text style={styles.unimpText}>{user_mutual_friends.length} mutual friends</Text>
            </View>
            <View style={styles.distanceBox}>
                <Text>{listing.geo_location_area} - {distance}</Text>
                {listing.is_deliverable? <Text>deliverable</Text>: <View/>}
            </View>
          </View>

            {<Image style={styles.listingImg} source={{uri:listing.image_url}}></Image>}
          <View style={styles.extrasBox}>
            <View style={styles.descriptionBox}>
                <Text>{listing.description}</Text>
            </View>
            <View style={styles.priceBox}>
                <Text style={styles.priceText}>Rs. {listing.price}</Text>
                {listing.is_coins_accepted? <View style={{alignItems: 'center', flexDirection:"row"}}>
                    <Image style={styles.coinIcon} source={require('image!pecfly-coin')}></Image>
                    <Text style={styles.unimpText}>Pay with coins available</Text>
                </View>: <View/>}
            </View>
            <OfferDialog toggleOfferDialog={this.toggleOfferDialog} is_visible={this.state.is_offer_dialog_visible} listing={listing}/>
            {<View style={[styles.row, styles.actionButtons]}>
              <Text style={styles.actionButton}>BUY NOW</Text>
                <TouchableOpacity
                    onPress={this.toggleOfferDialog}
                  >
                  <Text style={styles.actionButton}>SEND OFFER </Text>
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={this.openChat}
                >
                <Text style={styles.actionButton}>MESSAGE</Text>
              </TouchableOpacity>
            </View>}
          </View>
      </View>);
    }
});

var styles = StyleSheet.create({
  row: {
    flex:1,
    flexDirection: "row",
    alignItems: "center",
  },
  unimpText: {
    color: "#666"
  },
  spaceBetween:{
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    margin: 10,
    shadowColor: "#cccccc",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1
    },
  },
  titleStyle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 4,
    paddingBottom:0,
  },
  userBar: {
    flex:1,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 4
  },
  userThumb: {
    width:50,
    height:50,
    borderRadius: 25,
    marginRight: 4,
  },
  distanceBox: {
    padding: 2,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid"
  },
  listingImg: {
    flex:1,
    height: 300,
  },
  descriptionBox: {
    padding: 4,
  },
  priceBox: {
    flex:1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
  },
  priceText: {
    fontWeight: "bold",
    fontSize: 15
  },
  coinIcon: {
    width: 15,
    height: 15,
    marginRight: 2,
  },
  actionButtons:{
    justifyContent: "space-between",
    paddingTop: 5,
    paddingBottom:5,
    backgroundColor:"#fff",
  },
  actionButton: {
    padding: 5,
    color:"#5F5182"
  },
  extrasBox:{
    flex:1,
  },

});
