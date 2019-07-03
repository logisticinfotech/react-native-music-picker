// Type definitions for react-native-modal-dropdown 0.6
// Project: https://github.com/sohobloo/react-native-modal-dropdown
// Definitions by: Carlos Li <https://github.com/echoulen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

import * as React from 'react';

import RNMusicPicker = RNMusicPicker.RNMusicPicker;
import RNMusicPicker from '.';
export = RNMusicPicker;

declare namespace RNMusicPickerModule {
  interface RNMusicPickerProps {
    sectionContainerStyle?: any;
    sectionTextStyle?: any;
    itemContainerStyle?: any;
    songTitleStyle?: any;
    songDescriptionStyle?: any;
    fastScrollTextStyle?: any;
    buttonContainerStyle?: any;
    buttonTextStyle?: any;
    defaultSongIcon?: any;
    defaultAddIcon?: any;
    defaultTickIcon?: any;
    loaderColor?: string;
  }

  class RNMusicPicker extends React.Component<RNMusicPickerProps> {
    static default: typeof RNMusicPicker;
  }
}
