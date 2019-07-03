
#import "RNMusicPicker.h"

@implementation RNMusicPicker

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(getList:(NSString *)type:(NSDictionary *)param callback:(RCTResponseSenderBlock)callback ) {
    [MPMediaLibrary requestAuthorization:^(MPMediaLibraryAuthorizationStatus status){
        switch (status) {
            case MPMediaLibraryAuthorizationStatusRestricted: {
                callback(@[@"Permission Restricted"]);
                // restricted
                break;
            }
            case MPMediaLibraryAuthorizationStatusDenied: {
                callback(@[@"Permission Denied"]);
                // Denied
                break;
            }
            case MPMediaLibraryAuthorizationStatusAuthorized: {
                BOOL saveToLocal = false;
                if([param objectForKey:@"saveToLocal"] != nil) {
                    BOOL value = [[param objectForKey:@"saveToLocal"] boolValue];
                    saveToLocal = value;
                }
                [self GetAllTrackList:^(NSArray *trackList) {
                    callback(@[[NSNull null], trackList]);
                }];
                break;
            }
            default: {
                break;
            }
        }
    }];
}

RCT_EXPORT_METHOD(saveList:(NSArray *)trackList callback:(RCTResponseSenderBlock)callback ) {
    [self saveTracksToDocucmentDirectory:trackList exporting:^(int progress) {
        if(progress == trackList.count) {
            callback(@[[NSNull null], @"Save Successfully"]);
        }
    }];
}

//MARK:- GET ALL SONG/Track List

-(void)GetAllTrackList: (void (^) (NSArray *trackList))exportCompleted  {
    MPMediaQuery *query = [MPMediaQuery songsQuery];
    NSArray *tracksArray = [query items];
    NSMutableArray *trackListData = [[NSMutableArray alloc]init];
    for(MPMediaItem *item in tracksArray) {
        NSMutableDictionary *trackData = [self getMediaItemDetail:item];
        [trackListData addObject:trackData];
    }
    exportCompleted(trackListData);
}


//MARK:- Set Track List Raw Data

-(NSMutableDictionary *)getMediaItemDetail:(MPMediaItem *)item  {
    NSMutableDictionary *dict = [[NSMutableDictionary alloc]init];
    NSString *title = [item valueForProperty: MPMediaItemPropertyTitle];
    NSString *albumTitle = [item valueForProperty: MPMediaItemPropertyAlbumTitle];
    NSString *albumArtist = [item valueForProperty: MPMediaItemPropertyAlbumArtist];
    NSString *genre = [item valueForProperty: MPMediaItemPropertyGenre];
    NSString *duration = [item valueForProperty: MPMediaItemPropertyPlaybackDuration];
    NSString *playCount = [item valueForProperty: MPMediaItemPropertyPlayCount];
    NSString *trackCount = [item valueForProperty:MPMediaItemPropertyAlbumTrackCount];
    NSString *trackNumber = [item valueForProperty:MPMediaItemPropertyAlbumTrackNumber];
    NSString *isCloudItem = [item valueForProperty:MPMediaItemPropertyIsCloudItem];
    NSString *rating = [item valueForProperty:MPMediaItemPropertyRating];
    NSString *lyrics = [item valueForProperty:MPMediaItemPropertyLyrics];
    NSString *url = [item valueForProperty:MPMediaItemPropertyAssetURL];
    //  MPMediaItemArtwork *albumArtWork = [item valueForProperty:MPMediaItemPropertyArtwork];
    if(title != nil || [title isKindOfClass:[NSNull class]]) {
        [dict setObject:title forKey:@"title"];
    }
    if(albumTitle != nil || [albumTitle isKindOfClass:[NSNull class]]) {
        [dict setObject:albumTitle forKey:@"albumTitle"];
    }
    if(albumArtist != nil || [albumArtist isKindOfClass:[NSNull class]]) {
        [dict setObject:albumArtist forKey:@"albumArtist"];
    }
    if(genre != nil || [genre isKindOfClass:[NSNull class]]) {
        [dict setObject:genre forKey:@"genre"];
    }
    if(duration != nil || [duration isKindOfClass:[NSNull class]]) {
        [dict setObject:duration forKey:@"duration"];
    }
    if(playCount != nil || [playCount isKindOfClass:[NSNull class]]) {
        [dict setObject:playCount forKey:@"playCount"];
    }
    //    if(albumArtWork != nil || [albumArtWork isKindOfClass:[NSNull class]]) {
    //        UIImage *artWorkImage = [albumArtWork imageWithSize:CGSizeMake(150, 150)];
    //        NSData *artWorkData = UIImagePNGRepresentation(artWorkImage);
    //        [dict setObject:[artWorkData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength] forKey:@"albumArtWork"];
    //    }
    if(trackCount != nil || [trackCount isKindOfClass:[NSNull class]]) {
        [dict setObject:trackCount forKey:@"trackCount"];
    }
    if(trackNumber != nil || [trackNumber isKindOfClass:[NSNull class]]) {
        [dict setObject:trackNumber forKey:@"trackNumber"];
    }
    if(isCloudItem != nil || [isCloudItem isKindOfClass:[NSNull class]]) {
        [dict setObject:isCloudItem forKey:@"isCloudItem"];
    }
    if(rating != nil || [rating isKindOfClass:[NSNull class]]) {
        [dict setObject:rating forKey:@"rating"];
    }
    if(lyrics != nil || [lyrics isKindOfClass:[NSNull class]]) {
        [dict setObject:lyrics forKey:@"lyrics"];
    }
    if(url != nil || [url isKindOfClass:[NSNull class]]) {
        NSString *urlStr = [NSString stringWithFormat:@"%@",url];
        [dict setObject:urlStr forKey:@"url"];
        NSArray *idArray = [urlStr componentsSeparatedByString:@"id="];
        if(idArray.count > 1) {
            [dict setObject:idArray[1] forKey:@"trackID"];
        }
        
    }
    return dict;
}

//MARK:- Create Music Folder

-(void)CreateMusicFolder{
    NSError *error;
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0]; // Get documents folder
    NSString *dataPath = [documentsDirectory stringByAppendingPathComponent:@"/Music"];
    
    if (![[NSFileManager defaultManager] fileExistsAtPath:dataPath])
        [[NSFileManager defaultManager] createDirectoryAtPath:dataPath withIntermediateDirectories:NO attributes:nil error:&error]; //Create folder
}

//MARK:- Save Track To Document Directory

-(void)saveTracksToDocucmentDirectory:(NSArray *)items exporting:(void (^) (int progress))handler {
    [self CreateMusicFolder];
    __block int progress = 0;
    int i = 0;
    for(i=0;i<=items.count;i++){
        if(items.count > i) {
            NSDictionary *item = items[i];
            NSURL *url = [NSURL URLWithString:[item objectForKey:@"url"]];
            if(url != nil || [url isKindOfClass:[NSNull class]]) {
                NSString *urlStr = [NSString stringWithFormat:@"%@",url];
                NSArray *idArray = [urlStr componentsSeparatedByString:@"id="];
                if(idArray.count > 1) {
                    NSString *trackID = idArray[1];
                    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
                    NSString *documentURL = [paths objectAtIndex:0];
                    NSString *outputUrl = [documentURL stringByAppendingString:[NSString stringWithFormat:@"/Music/%@.m4a",trackID]];
                    if ([[NSFileManager defaultManager] fileExistsAtPath:outputUrl]){
                        progress++;
                        NSLog(@"%@", [NSString stringWithFormat:@"File Exist : %d",progress]);
                        handler(progress);
                        continue;
                    }
                    AVAssetExportSession *exportSession = [[AVAssetExportSession alloc]initWithAsset:[AVAsset assetWithURL:url] presetName:AVAssetExportPresetAppleM4A];
                    exportSession.shouldOptimizeForNetworkUse = true;
                    exportSession.outputFileType = AVFileTypeAppleM4A;
                    exportSession.outputURL = [NSURL fileURLWithPath:outputUrl];
                    [exportSession exportAsynchronouslyWithCompletionHandler:^{
                        if (exportSession.status == AVAssetExportSessionStatusCompleted)  {
                            progress++;
                            NSLog(@"%@", [NSString stringWithFormat:@"Export Successfull : %d",progress]);
                            handler(progress);
                        } else if(exportSession.status == AVAssetExportSessionStatusFailed) {
                            progress++;
                            NSLog(@"%@", [NSString stringWithFormat:@"Export failed : %d",progress]);
                            NSLog(@"%@", exportSession.error);
                            handler(progress);
                        }else if (exportSession.status == AVAssetExportSessionStatusExporting) {
                            NSLog(@"Progress : %f",exportSession.progress);
                        }
                    }];
                }
            }
        }
    }
}

@end
  
