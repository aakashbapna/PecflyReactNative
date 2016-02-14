//
//  GooglePlacesManager.m
//  PecflyReactNative
//
//  Created by Aakash Bapna on 09/10/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "GooglePlacesManager.h"
@import GoogleMaps;




@implementation GooglePlacesManager{
   GMSPlacePicker *_placePicker;
}

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (NSString*) convertObjectToJson:(NSObject*) object
{
  NSError *writeError = nil;
  
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object options:NSJSONWritingPrettyPrinted error:&writeError];
  NSString *result = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
  
  return result;
}

RCT_EXPORT_METHOD(getCurrentPlace:(RCTResponseSenderBlock)callback)
{
  GMSPlacesClient *_placesClient = [[GMSPlacesClient alloc] init];
  [_placesClient currentPlaceWithCallback:^(GMSPlaceLikelihoodList *placeLikelihoodList, NSError *error){
    if (error != nil) {
      NSLog(@"Pick Place error: %@", [error localizedDescription]);
      callback(@[[error localizedDescription], [NSNull null]]);
      return;
    }
    
    if (placeLikelihoodList != nil) {
      GMSPlace *place = [[[placeLikelihoodList likelihoods] firstObject] place];
      if (place != nil) {
        callback(@[[NSNull null], [self placeToJson:place] ]);
        return;
      }
    }
  }];
}

- (NSDictionary*)placeToJson:(GMSPlace*) place{
  NSMutableDictionary *dictionary = [[NSMutableDictionary alloc] init];
  [dictionary setValue:place.formattedAddress forKey:@"address"];
  [dictionary setValue:place.name forKey:@"name"];
  [dictionary setValue:[NSNumber numberWithDouble:place.coordinate.latitude] forKey:@"latitude"];
  [dictionary setValue:[NSNumber numberWithDouble: place.coordinate.longitude] forKey:@"longitude"];
  return dictionary;
}

RCT_EXPORT_METHOD(pickPlace:(RCTResponseSenderBlock)callback)
{
  
  GMSPlacePickerConfig *config = [[GMSPlacePickerConfig alloc] initWithViewport:nil];
   _placePicker = [[GMSPlacePicker alloc] initWithConfig:config];
  
  [_placePicker pickPlaceWithCallback:^(GMSPlace *place, NSError *error) {
    if (error != nil) {
      NSLog(@"Pick Place error %@", [error localizedDescription]);
      return;
    }
    
    if (place != nil) {
      callback(@[[self placeToJson:place]]);
    }
  }];
}

@end