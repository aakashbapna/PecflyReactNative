var React = require("react-native");
var {View, StyleSheet, NavigatorIOS, TouchableOpacity, LayoutAnimation, DeviceEventEmitter, ListView, ScrollView, TextInput, Text, Image, Component} = React;
var api = require("../lib/myswag-api");
var _ = require("lodash")
import PecflyFirebase from "../chat"

var Conversation = module.exports = React.createClass({
  getInitialState: function() {
      return {
          targetUser:null,
          text:"",
          is_first_message: true,
          messageDataSource: new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
          }),
          keyboardSpacer:0,
          messageRows:[],
      }
  },

  componentDidMount: function() {
    var self = this;
    PecflyFirebase.getConversationWithUser(this.props.target_user, function(conversation){
      self.setState({conversation});
      conversation.getMessagesRef().on("value", function(snapshot){
        var rows =  self.buildDataSource(snapshot);
        //var old_rows_length = self.state.messageRows.length;
        self.setState({messageRows: rows});
        self.bringToBottom(true);
      });
    });
    DeviceEventEmitter.addListener('keyboardWillShow', this.keyboardShown);
    DeviceEventEmitter.addListener('keyboardWillHide', this.keyboardHide);
  },
  componentWillUnmount: function() {
    if(this.state.conversation) {
      this.state.conversation.destroy();
    }
    DeviceEventEmitter.removeAllListeners('keyboardWillShow');
    DeviceEventEmitter.removeAllListeners('keyboardWillHide');
  },
  bringToBottom: function(animate=true){
    //Scroll to bottom code
    let innerScrollView = this.refs.scrollView.refs.InnerScrollView;
    let scrollView = this.refs.scrollView.refs.ScrollView;
    requestAnimationFrame(() => {
        innerScrollView.measure((innerScrollViewX, innerScrollViewY, innerScrollViewWidth, innerScrollViewHeight) => {
            scrollView.measure((scrollViewX, scrollViewY, scrollViewWidth, scrollViewHeight) => {
                var scrollTo = innerScrollViewHeight - scrollViewHeight + innerScrollViewY;

                if (innerScrollViewHeight < scrollViewHeight) {
                    return;
                }
                if(animate) {
                  this.refs.scrollView.scrollTo(scrollTo);
                } else {
                  this.refs.scrollView.scrollWithoutAnimationTo(scrollTo);
                }
            });
        });
    });
  },

  keyboardShown: function(e){
      //console.log(e)
      this.setState({keyboardSpacer:e.endCoordinates.height});
      this.bringToBottom(false)
  },
  keyboardHide: function() {
    LayoutAnimation.spring();
    this.setState({keyboardSpacer: 0});
  },
  buildDataSource: function(snapshot) {
    var rows = []
    snapshot.forEach(function(childSnapshot) {
      // key will be "fred" the first time and "barney" the second time
      var key = childSnapshot.key();
      // childData will be the actual contents of the child
      var message = childSnapshot.val();
      message.key = key;
      rows.push(message)
    });
    //console.log("rows", rows)
    return rows;
  },

  sendMessage: function(){
    if(this.state.text!= "") {
        if(this.state.is_first_message && this.props.listing) {
          this.state.conversation.sendMessage(this.state.text, this.props.listing);
        } else {
          this.state.conversation.sendMessage(this.state.text)
        }
        this.setState({is_first_message: false, text: ""})
    }
  },
  renderRow: function(message){
    return <View style={[styles.messageContainer, message.authorUid==this.props.target_user.id? null: styles.selfMessage]} key={message.key}>
        <View>
          <Text>{message.author}</Text>
          <Text>{message.message}</Text>
        </View>
    </View>
  },
  inputFocused: function (refName) {
    /*  setTimeout(() => {
        let scrollResponder = this.refs.scrollView.getScrollResponder();
        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
          React.findNodeHandle(this.refs[refName]),
          110, //additionalOffset
          true
        );
      //}, 50);*/
  },
  renderSendButton: function() {

    return <View style={[styles.sendContainer,{marginBottom: this.state.keyboardSpacer}]}>
      <TextInput
        onChangeText={(text) => this.setState({text})}
        ref="text"
        placeholder="Enter your message..."
        multiline={true}
        onFocus={this.inputFocused.bind(this, "text")}
        style={styles.textInput}
        value={this.state.text}
       />
      <TouchableOpacity
        onPress={this.sendMessage}
        style={styles.sendButtonContainer}
      >
        <Text style={styles.sendButton}> SEND </Text>
      </TouchableOpacity>
    </View>

  },
  render: function() {
      return <View style={styles.container}>
              {/*<ListView
                ref="listView"
                dataSource={this.state.messageDataSource}
                renderRow={this.renderRow}
                automaticallyAdjustContentInsets={true}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps={true}
                showsVerticalScrollIndicator={true}
                style={styles.listView}
              />*/}
              <ScrollView ref="scrollView" contentContainerStyle={styles.messageList} keyboardDismissMode="on-drag" automaticallyAdjustContentInsets={true}  showsVerticalScrollIndicator={false}>
                  {_.map(this.state.messageRows,(row)=>(this.renderRow(row)))}
              </ScrollView>
            {this.renderSendButton()}
      </View>
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  sendContainer: {
    flexDirection: "row",
    backgroundColor:"rgba(255,255,255,0.5)",
    alignItems: "center",
  },
  sendButton: {
    color: "#5F5182",
    padding:5,
  },
  sendButtonContainer: {
  },
  textInput: {
    backgroundColor: "#fff",
    padding:5,
    flex:99,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid",
    margin:5,
    borderRadius:5,
    height: 40,
    fontSize:15,
  },
  messageContainer: {
    padding: 5,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid",
  },
  selfMessage: {
    alignSelf:"flex-end",
  },
  messageList: {
    alignItems:"flex-start",
  }
});
