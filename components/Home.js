var React = require("react-native");
var {View, StyleSheet, NavigatorIOS, ScrollView,Image, ActivityIndicatorIOS, TouchableOpacity, Text, ListView} = React;
var api = require("../lib/myswag-api");
var Listing = require("./Listing_alternate");
var _ =  require("lodash");
var Sell = require("./Sell");
import PecflyFirebase from "../chat";

function autodone(fn) {
  return function () {
    fn.apply(this, arguments).done();
  }
}



var feedItems = []
var Home = module.exports =  React.createClass({
  getInitialState: function() {
    return {
      is_feed_loading: true,
      feedDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      cursor:null,
      conversations:[]
    }
  },
  componentDidMount: function(){
    this.fetchFeed();
    this.getCurrentLocation();
    this.fetchConversations();
  },
  getCurrentLocation: function(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let geo_point = position.coords;
        console.info("got location", position)
        this.setState({currentLocation:{lat:geo_point.latitude, lon:geo_point.longitude}});
        if(this.props.user_locations){
          api.user.update_location({key: this.props.user_locations[0].entityKey, geo_point:`${geo_point.latitude},${geo_point.longitude}`})
        }
      },
      (error) => {
          console.log(error);
          if(this.props.user_locations){
            console.info("Falling back to serverside location");
            var geo_point = this.props.user_locations[0].geo_point;
            this.setState({currentLocation:{lat:geo_point.lat, lon:geo_point.lon}});
          }
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 3600000}
    )
  },
  fetchFeed: autodone(async function(){
    var cursor = this.state.cursor;
    console.log("fetching feed from cursor:", cursor)
    if(cursor === false) {
      console.log("nothing more to fetch");
      return;
    }
    this.setState({is_feed_loading: true})

    var feedResponse = await api.feed.fetch({cursor:cursor})

    if(feedResponse.nextPageToken) {
      cursor = feedResponse.nextPageToken
    } else {
      cursor = false;
    }
    if(feedResponse.items == null || feedResponse.items.length == 0) {
      console.log("end of feed fetch");
      this.setState({is_feed_loading: false, cursor: false});
      return;
    }
    console.log("fetched "+feedResponse.items.length+" items")

    this.setState({feedDataSource: this.getFeedDataSource(feedResponse), is_feed_loading: false, cursor: cursor})
  }),
  fetchConversations: function(){
    PecflyFirebase.getUserActiveConversations((ref)=>{
      ref.on("value", function(snapshot){
        var rows = []
        snapshot.forEach(function(childSnapshot) {
          // key will be "fred" the first time and "barney" the second time
          var key = childSnapshot.key();
          // childData will be the actual contents of the child
          var childData = childSnapshot.val();
          childData.key = key;
          rows.push(childData)
        });
        console.log("conversation rows", rows);

        this.setState({conversations: rows});
      }.bind(this));
    });
  },
  renderFooter: function(){
    if( this.state.is_feed_loading )
     return <ActivityIndicatorIOS style={styles.scrollSpinner} />

    return  <View style={styles.scrollSpinner} />;
  },
  renderRow: function(feedItem){
    var listing = feedItem.item_listing;
    return <Listing currentUser={this.props.user_obj} currentLocation={this.state.currentLocation}  navigator={this.props.navigator} listing={listing} />
  },
  renderSeparator:  function(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
          var style = styles.rowSeparator;
          if (adjacentRowHighlighted) {
              style = [style, styles.rowSeparatorHide];
          }
          return (
            <View key={"SEP_" + sectionID + "_" + rowID}  style={style}/>
          );
  },
  onEndReached: function() {
      console.log("Reached end");
      this.fetchFeed()
  },

  getFeedDataSource: function(feedResponse): ListView.DataSource {


    var items = _.map(feedResponse.items, function(item){
				item.item_listing.id = item.item_id;
				item.item_listing.seller.id = item.item_listing.seller_id
				return item;
			})

    feedItems = _.unique(feedItems.concat(items), "entityKey")


    return this.state.feedDataSource.cloneWithRows(feedItems);
  },
  openConversation:function(){

  },
  renderHeader: function() {
    return <View style={styles.conversationBar}>
            {_.map(this.state.conversations, (conversation)=>{
              return <TouchableOpacity
                    key={conversation.key}
                    onPress={this.openConversation(conversation.key)}
                >
                  <Image style={styles.chatBubbleImage} source={{uri:conversation.targetUser.pictureUrl}}></Image>
              </TouchableOpacity>
            })}
    </View>
  },

  render: function() {
    var content = this.state.feedDataSource.getRowCount() === 0 ?
          <NoFeedItems
            isLoading={this.state.is_feed_loading}
          /> :
          <ListView
            ref="listview"
            renderSeparator={this.renderSeparator}
            dataSource={this.state.feedDataSource}
            renderHeader={this.renderHeader}
            renderFooter={this.renderFooter}
            renderRow={this.renderRow}
            onEndReached={this.onEndReached}
            automaticallyAdjustContentInsets={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps={true}
            showsVerticalScrollIndicator={false}
          />;


    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }
});

var NoFeedItems = React.createClass({
  render: function() {
    var text = '';

    if (!this.props.isLoading) {
      // If we're looking at the latest movies, aren't currently loading, and
      // still have no results, show a message
      text = 'No items in your feed';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noFeedItemsText}>{text}</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5F5182',
    marginTop: 65
  },
  conversationBar: {
    backgroundColor: "#f7f7f7",
    padding: 5,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap"
  },
  logoText: {
    fontSize: 25,
    color: "#fff",
  },
  centerText: {
    alignItems: 'center',
  },
  noFeedItemsText: {
    marginTop: 80,
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    height: 1,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
  chatBubbleImage: {
    width:50,
    height:50,
    borderRadius: 25,
    marginRight: 4,
  }
});
