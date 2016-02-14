//
//  GooglePlacesManager.h
//  PecflyReactNative
//
//  Created by Aakash Bapna on 09/10/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#ifndef PecflyReactNative_GooglePlacesManager_h
#define PecflyReactNative_GooglePlacesManager_h
#import "RCTBridgeModule.h"

@interface GooglePlacesManager : NSObject <RCTBridgeModule>

-(NSString*) convertObjectToJson:(NSObject*) object;

@end

#endif
