var React = require("react-native");
var {View, StyleSheet, NavigatorIOS, TouchableOpacity, ActivityIndicatorIOS, Text, Image, Modal, TextInput, Component} = React;
var api = require("../lib/myswag-api");
var _ = require("lodash")
var UIImagePickerManager = require('NativeModules').UIImagePickerManager;
var GooglePlacesManager = require('react-native').NativeModules.GooglePlacesManager;

function autodone(fn) {
  return function () {
    fn.apply(this, arguments).done();
  }
}

export default class Sell extends Component {
  constructor(props){
    super(props)
    this.state = {
      titleText: "",
      descriptionText: "",
      priceText:"",
      images:[null, null, null, null],
      selectedImageIndex: null,
      is_uploading: false,
      placeName: "fetching current location...",
    }
  }

  onPlaceChange(place) {
    console.log(place);
    if(place) {
      this.setState({placeName: place.name, placeAddress: place.address, location:{lat:place.latitude, lon:place.longitude}})
    }
  }
  componentDidMount() {
      GooglePlacesManager.getCurrentPlace((error, place)=>{
        console.log("--------here--------")
        if(error){
          console.log("error getting place name", error)
        } else {
          this.onPlaceChange(place);
        }
      });
  }
  openImageChooser(index) {
    if(this.state.images[index]!=null && this.state.selectedImageIndex!= index){
      this.setState({selectedImageIndex:index});
      return;
    }
    var options = {
        maxHeight: 940,
        returnBase64Image: true,
        returnIsVertical: true,
        quality: 0.85,
        allowsEditing: true,
    }
    UIImagePickerManager.showImagePicker(options, (responseType, response, isVertical) => {
      console.log(`Response Type = ${responseType} isVertical: ${isVertical}`);
      var images = this.state.images

      if (responseType !== 'cancel') {
        let source;
        if (responseType === 'data') { // New photo taken OR passed returnBase64Image true -  response is the 64 bit encoded image data string
          images[index] = response
          this.setState({
            images: images,
            selectedImageIndex:index
          });
        }
        else if (responseType === 'uri') { // Selected from library - response is the URI to the local file asset
          alert("Response is a URI!")
        }

      }
    });
  }
   onSellButtonClicked() {
    if(this.state.images[0] == null) {
      alert("First image is compulsory");
      return;
    }
    var listing_data = {
              image: this.state.images[0],
              image_mime_type: "image/jpeg",
              title: this.state.titleText,
              price: this.state.priceText,
              geo_location: `${this.state.location.lat},${this.state.location.lon}`,
              description: this.state.descriptionText,
              post_OLX: false,          //TODO: impl this
              is_coins_accepted: false, //TODO: impl this
          };
    if(this.state.images[1]){
      listing_data["image_sec_1"] = this.state.images[1]
    }
    if(this.state.images[2]){
      listing_data["image_sec_2"] = this.state.images[2]
    }
    if(this.state.images[3]){
      listing_data["image_sec_3"] = this.state.images[3]
    }
    this.setState({is_uploading: true});
    autodone(async function(){
      var response = await api.listing.put_feed(listing_data)
      this.setState({is_uploading: false});
      this.props.navigator.pop()
      alert("Uploaded!")
    }.bind(this))()
  }
  pickPlace(){
      GooglePlacesManager.pickPlace(this.onPlaceChange.bind(this));
  }
  render() {
    return <View style={styles.container}>
    <Modal
      animated={false}
      transparent={true}
      visible={this.state.is_uploading}>
      <View style={styles.modalContainer}>
        <View style={styles.modalInnerContainer}>
          <ActivityIndicatorIOS style={styles.modalSpinner} />
          <Text>Uploading...</Text>
        </View>
      </View>
    </Modal>
        <View style={styles.inputBoxes}>
          <TextInput
              style={styles.inputBox}
              onChangeText={(titleText) => this.setState({titleText})}
              placeholder={"What are you selling today?"}
              value={this.state.titleText}
            />
            <TextInput
                style={styles.inputBox}
                onChangeText={(priceText) => this.setState({priceText})}
                placeholder={"Price in Rs."}
                keyboardType={"numeric"}
                value={this.state.priceText}
              />
            <TextInput
                  style={styles.inputBox}
                  placeholder={"Description, #hashtags"}
                  onChangeText={(descriptionText) => this.setState({descriptionText})}
                  value={this.state.descriptionText}
                />
              <TouchableOpacity style={[styles.inputBox, styles.placePicker]}
                onPress={this.pickPlace.bind(this)}
              >
                <Image source={require("image!location-icon")}  ></Image>
                <View style={styles.placeDetailsContainer}>
                  <Text>{this.state.placeName}</Text>
                  <Text style={styles.placeAddress}>{this.state.placeAddress}</Text>
                </View>
              </TouchableOpacity>
        </View>
        <View style={styles.imageHolderList}>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={this.openImageChooser.bind(this, 0)}
              >
                  <Image style={styles.imageHolder} resizeMode="contain" source={this.state.images[0]==null? require("image!camera-icon"): {uri: 'data:image/jpeg;base64,' + this.state.images[0]}}></Image>
              </TouchableOpacity>
              <TouchableOpacity
              activeOpacity={0.5}
                onPress={this.openImageChooser.bind(this, 1)}
              >
                  <Image style={styles.imageHolder} resizeMode="contain" source={this.state.images[1]==null? require("image!camera-icon"): {uri: 'data:image/jpeg;base64,' + this.state.images[1]}} ></Image>
              </TouchableOpacity>
              <TouchableOpacity
              activeOpacity={0.5}
                onPress={this.openImageChooser.bind(this, 2)}
              >
                  <Image style={styles.imageHolder} resizeMode="contain" source={this.state.images[2]==null? require("image!camera-icon"): {uri: 'data:image/jpeg;base64,' + this.state.images[2]}} ></Image>
              </TouchableOpacity>
              <TouchableOpacity
              activeOpacity={0.5}
                onPress={this.openImageChooser.bind(this, 3)}
              >
                  <Image style={styles.imageHolder} resizeMode="contain" source={this.state.images[3]==null? require("image!camera-icon"): {uri: 'data:image/jpeg;base64,' + this.state.images[3]}} ></Image>
              </TouchableOpacity>
        </View>
        <View style={{flex:99, backgroundColor: "#5F5182"}}>
        {this.state.selectedImageIndex!=null? <Image style={styles.selectedImage} source={{uri: 'data:image/jpeg;base64,' + this.state.images[this.state.selectedImageIndex]}}></Image> : <View/>}
        </View>
        <View>
          <TouchableOpacity
            style={styles.sellButton}
            onPress={this.onSellButtonClicked.bind(this)}>
              <Text style={styles.sellButtonText}>Sell</Text>
          </TouchableOpacity>
        </View>
    </View>
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
    marginTop: 65,
  },
  inputBoxes: {
    padding: 5,
    backgroundColor: "#f7f7f7",
  },
  selectedImage: {
    flex:1,
  },
  imageHolder: {
    width: 50,
    height: 50,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 2,
      width: 2
    },
  },
  imageHolderList: {
    backgroundColor: "#5F5182",
    flexDirection: "row",
    flexWrap:"nowrap",
    alignItems: "center",
    justifyContent:"space-around",
    padding: 5,
  },
  inputBox: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 5,
    padding: 5
  },
  sellButton: {
    backgroundColor: "#5F5182",
    padding:5,
    flex: 0.5,
    alignItems:"center"
  },
  sellButtonText: {
    fontSize: 25,
    color: "#fff",
  },
  centerText: {
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor:'rgba(0, 0, 0, 0.5)',
  },
  modalInnerContainer: {
    borderRadius: 10,
    backgroundColor: "#fff",
    padding:20,
    flexDirection: "row",
    alignItems:"center"
  },
  modalSpinner: {
    marginRight: 5,
  },
  placePicker: {
    flexDirection: "row",
    flex:1,
    alignItems: "center",
  },
  placeDetailsContainer: {
    padding:2,
    marginLeft: 5
  },
  placeAddress: {
    fontSize: 10,
    color: "#999",
  },
});
