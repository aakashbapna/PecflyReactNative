var firebase = require("firebase");
var api = require("../lib/myswag-api");
import {Buffer} from  "buffer"

var btoa =  function(str) {
  return Buffer(str).toString('base64')
}

var getBaseUrl = function() {
  var api_base_url = api.getBaseUrl().replace("myswag/v1","")
  if (!__DEV__ || api_base_url.indexOf("786")>0 ){
    return "https://myswag-prod.firebaseio.com/";
  }
  var url =  "https://myswag-staging.firebaseio.com/";
  return url+btoa(api_base_url).replace(/[=|]/, "")+"/"
}


export default class PecflyFirebase {

  static init(firebase_token, user){
    var ref = PecflyFirebase.ref = new Firebase(getBaseUrl());
    console.log("logging in with "+firebase_token);
    ref.authWithCustomToken(firebase_token, (error, authData)=>{
      if(error) {
        console.error("error logging in to firebase", error)
      } else {
        if( authData.uid == user.id) {
          console.info("Logged in successfully to firebase")
          PecflyFirebase.user = user
        } else {
          console.warn(`FIREBASE: expected ${user.id} found ${authData.uid} , logging out.`)
          ref.unauth()
        }
      }
    })
  }

  static getConversationWithUser(target_user, cb) {
    if(PecflyFirebase.user == null){
      console.log("Chat not yet initialized, checking again in 1 second");
      setTimeout(PecflyFirebase.getConversationWithUser.bind(null, target_user, cb), 1000)
      return;
    }
    cb(new Conversation(PecflyFirebase.ref).getFromUserObj(PecflyFirebase.user, target_user))
  }
  static getUserActiveConversations(cb) {
    if(PecflyFirebase.user == null){
      console.log("Chat not yet initialized, checking again in 1 second");
      setTimeout(PecflyFirebase.getUserActiveConversations.bind(null, cb), 1000)
      return;
    }
    cb(PecflyFirebase.ref.child("users").child(PecflyFirebase.user.id).child("conversations"))
  }
}

export class Conversation {

    constructor(ref) {
      this.ref = ref
    }

    getFromUserObj(user, target_user) {
      console.log("getting convo for", user.id, target_user.id)
      this.user = {name:user.name, pictureUrl: user.picture_url, id: user.id};
      this.target_user = {name:target_user.name, pictureUrl: target_user.picture_url, id: target_user.id};
      this.conversation_id = Conversation.getConversationId(this.user.id, this.target_user.id);
      this.conversationRef = this.ref.child("conversations").child(this.conversation_id);
      this.userConversationRef = Conversation.getUserConversationRef(this.ref, this.user.id, this.conversation_id)
      this.targetUserConversationRef = Conversation.getUserConversationRef(this.ref, this.target_user.id, this.conversation_id)
      this.messagesRef = this.conversationRef.child("messages");
      return this
    }

    static getUserConversationRef(ref, uid, conversation_id){
       return ref.child("users").child(uid).child("conversations").child(conversation_id);
     }

    static getConversationId(...participants) {
      participants.sort();
      return participants.join("_");
    }

    onMessage(){
      this.conversationRef.child("participants").set({
        [this.user.id]: this.user,
        [this.target_user.id]: this.target_user
      });

      this.targetUserConversationRef.child("targetUser").set(this.user);
      this.userConversationRef.child("targetUser").set(this.target_user)
      let now = new Date().getTime()
      this.targetUserConversationRef.setPriority(-1 * now);
      this.userConversationRef.setPriority(-1 * now);
    }

    sendMessage(text, listing) {
        if(text != null && text.trim() != "") {
          let message = this.buildNewMessage(text, listing);
          let messageRef = this.messagesRef.push(message);
          this.targetUserConversationRef.child("lastMessage").set(message)
          this.userConversationRef.child("lastMessage").set(message)
          this.sendNotification(messageRef.key(), message)
          this.onMessage()
        }
    }

    sendNotification(id, message) {

    }


    buildNewMessage(text, listing) {

        let message = {
          message: text,
          author: this.user.name,
          authorUid: this.user.id,
          timeSent: new Date().getTime()
        }

        if (listing){
          message.sendContext = true;
          message.msgContextTitle = listing.title;
          message.msgContextPrice = listing.price;
          message.msgContextImgUrl = listing.image_url;
          message.msgContextListingID = listing.id;
        }
        return message;
    }

    getMessagesRef(limit) {
      limit = limit==null? 50: limit;
      return this.messagesRef.limitToLast(50)
    }

    destroy() {
      this.getMessagesRef().off();
    }



}
