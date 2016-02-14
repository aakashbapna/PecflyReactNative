var React = require("react-native");
var {View, StyleSheet, NavigatorIOS} = React;
var FBSDKCore =  require('react-native-fbsdkcore');
var FBSDKLogin = require('react-native-fbsdklogin');
var {
  FBSDKLoginButton,
  FBSDKAccessToken,
} = FBSDKLogin;
var {FBSDKAccessToken} = FBSDKCore;
var api = require("../lib/myswag-api");
var Home = require("./Home")
var Sell = require("./Sell");
import PecflyFirebase from "../chat"



var Login = module.exports =  React.createClass({
  componentDidMount: function() {
      this.loginAndContinue();
  },
  getInitialState: function() {
    return {
      is_logged_in: false,
      is_navigatorBarHidden:false
    }
  },
  toggleNavBar: function() {
    this.setState({is_navigatorBarHidden: !this.state.is_navigatorBarHidden})
  },
  loginAndContinue: function(token) {
    FBSDKAccessToken.getCurrentAccessToken((token) => {
      // token will be null if no user is logged in,
      // or will contain the data associated with the logged in user
      console.log("got FB token", token)
      if (token && token.tokenString) {
        api.user.auth_token_fb({token:token.tokenString}).then((response)=>{
          console.log("got server token:", response.token.token)
          api.setAuthToken(response.token.token);
          setTimeout(()=>{
            this.setState({is_logged_in: true, initData: response})
          }, 50);
          PecflyFirebase.init(response.firebase_token, response.user_obj)
        }).catch((e)=>{
          console.log(e)
        })
      }
    });
  },
  render: function() {
    if (this.state.is_logged_in){
      console.log("logged in")
      return <NavigatorIOS
         ref="nav"
         navigationBarHidden={this.state.is_navigatorBarHidden}
         style={{flex:1}}
         translucent={true}
         tintColor={"#5F5182"}
         initialRoute={{
           component: Home,
           title: 'Pecfly',
           passProps: { toggleNavBar:this.toggleNavBar, ...this.state.initData },
           rightButtonTitle: "Sell",
           onRightButtonPress:()=>{
              console.log(arguments)
              this.refs.nav.push({
                title: "Sell an item",
                component: Sell
              })
           }
         }}
       />
    }
    return (
      <View style={styles.container}>
        <FBSDKLoginButton
          onLoginFinished={(error, result) => {
            if (error) {
              alert('Error logging in.');
            } else {
              if (result.isCanceled) {
                alert('Login cancelled.');
              } else {
                alert('Logged in.');
                console.log(result);
                this.loginAndContinue()
              }
            }
          }}
          onLogoutFinished={() => alert('Logged out.')}
          readPermissions={['email','user_friends']}
          />
      </View>
    );
  }
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
