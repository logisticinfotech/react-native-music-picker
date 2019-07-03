import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  SectionList,
  FlatList,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import PropTypes from 'prop-types';
import RNNativeMusicPicker from '../Components/RNNativeMusicPicker';
import { styles } from './RNMusicPickerStyle';
import { images } from '../Theme';

// Components
import Loader from '../Components/Loader';
import * as Constants from '../Helper/Constants';

class RNMusicPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrayMusic: [],
      arraySelected: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'android') {
      const response = await this.requestStoragePermission();
      if (response) this.getSongFromLibrary();
      else {
        Alert.alert('Storage Permission not granted');
        this.setState({ isLoading: false });
      }
    } else {
      this.getSongFromLibrary();
    }
  }

  // Mics Method

  requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE],
        {}
      );
      if (
        granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  getSongFromLibrary = () => {
    RNNativeMusicPicker.getTracks()
      .then(response => {
        const arrayMusicResponse = this.getSectionList(response);
        this.setState({ arrayMusic: arrayMusicResponse, isLoading: false });
      })
      .catch(error => {
        Alert.alert(error);
        this.setState({ isLoading: false });
      });
  };

  getSectionList = response => {
    const arrMusicListSection = [];
    let index = 0;
    response
      .sort((a, b) => (a.title > b.title ? 1 : b.title > a.title ? -1 : 0))
      .map(item => {
        let firstLetter = item.title.charAt(0).toUpperCase();
        if (!Number.isNaN(Number(firstLetter))) {
          firstLetter = '#';
        }

        const objData = arrMusicListSection.find(objItem => objItem.name === firstLetter);
        if (!objData) {
          const objCountryData = {
            name: firstLetter,
            index,
            data: response
              .filter(
                objResponse =>
                  objResponse.title.charAt(0).toUpperCase() ===
                  (firstLetter === '#'
                    ? '0' || '1' || '2' || '3' || '4' || '5' || '6' || '7' || '8' || '9'
                    : firstLetter)
              )
              .map(element => {
                element.isAdded = false;
                return element;
              }),
          };
          arrMusicListSection.push(objCountryData);
          index += 1;
        }
      });
    return arrMusicListSection;
  };

  setSectionListRef = element => {
    this.sectionList = element;
  };

  // onPress Method

  onPressDone = () => {
    const { arraySelected } = this.state;
    let saveArr = [...arraySelected];
    this.setState({
      isLoading: true,
    });
    RNNativeMusicPicker.saveSong(saveArr)
      .then(response => {
        Alert.alert('Song Save Successfully');
        this.setState({
          isLoading: false,
        });
      })
      .catch(error => {
        Alert.alert('Song Save Failed');
        this.setState({
          isLoading: false,
        });
      });
  };

  onPressSectionSong = index => {
    this.sectionList.scrollToLocation({
      animated: true,
      sectionIndex: index,
      itemIndex: 0,
      viewOffset: 0,
    });
  };

  onPressAddSong = (item, section, index) => {
    const { arrayMusic, arraySelected } = this.state;

    let newArraySelected = [];
    if (item.isAdded) {
      newArraySelected = arraySelected.filter(element => element.title !== item.title);
    } else {
      arraySelected.push(item);
      newArraySelected = arraySelected;
    }
    let newMusicArray = [...arrayMusic];
    const indexSection = newMusicArray.indexOf(section);
    let newSection = Object.assign({}, newMusicArray[indexSection]);
    let newItem = Object.assign({}, newSection.data[index]);
    newItem.isAdded = !newItem.isAdded;
    newSection.data[index] = newItem;
    newMusicArray[indexSection] = newSection;

    this.setState({
      arrayMusic: newMusicArray,
      arraySelected: newArraySelected,
    });
  };

  // Render Method
  keyExtractorSection = (item, index) => item.title + index;

  renderSectionHeaderItem = ({ section }) => {
    const { sectionContainerStyle, sectionTextStyle } = this.props;
    return (
      <View style={[styles.sectionContainer, sectionContainerStyle]}>
        <Text style={[styles.sectionText, sectionTextStyle]}>{section.name}</Text>
      </View>
    );
  };

  renderSectionItem = ({ item, section, index }) => {
    const {
      itemContainerStyle,
      songTitleStyle,
      songDescriptionStyle,
      defaultSongIcon,
      defaultAddIcon,
      defaultTickIcon,
    } = this.props;
    return (
      <View style={[styles.listItemStyle, itemContainerStyle]}>
        <Image style={styles.songIcon} source={defaultSongIcon || images.iconSong} />
        <View style={styles.songInnerItem}>
          <Text style={[styles.songTitle, songTitleStyle]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.albumArtist && (
            <Text style={[styles.songDescription, songDescriptionStyle]} numberOfLines={1}>
              {item.albumArtist}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.rightIconContainer}
          activeOpacity={Constants.commonConstants.buttonActiveOpacity}
          onPress={() => this.onPressAddSong(item, section, index)}>
          <Image
            style={item.isAdded ? styles.listRightSmallIcon : styles.listRightIcon}
            source={item.isAdded ? defaultTickIcon || images.iconTick : defaultAddIcon || images.iconAdd}
          />
        </TouchableOpacity>
      </View>
    );
  };

  keyExtractorFast = (item, index) => item.name + index;

  renderFastScrollItem = ({ item, index }) => {
    const { fastScrollTextStyle } = this.props;
    return (
      <TouchableOpacity
        activeOpacity={Constants.commonConstants.buttonActiveOpacity}
        onPress={() => this.onPressSectionSong(index)}>
        <Text style={[styles.fastScrollText, fastScrollTextStyle]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { isLoading, arrayMusic, arraySelected } = this.state;
    const { loaderColor, buttonContainerStyle, buttonTextStyle } = this.props;
    return (
      <View style={styles.mainContainer}>
        <SectionList
          ref={this.setSectionListRef}
          keyboardShouldPersistTaps="handled"
          sections={arrayMusic}
          renderSectionHeader={this.renderSectionHeaderItem}
          renderItem={this.renderSectionItem}
          keyExtractor={this.keyExtractorSection}
          stickySectionHeadersEnabled
          maxToRenderPerBatch={160}
          updateCellsBatchingPeriod={160}
          initialNumToRender={40}
          windowSize={120}
          showsVerticalScrollIndicator={false}
          extraData={this.state}
        />
        <FlatList
          style={styles.fastScrollFlatList}
          contentContainerStyle={styles.fastScrollContainer}
          data={arrayMusic}
          renderItem={this.renderFastScrollItem}
          keyExtractor={this.keyExtractorFast}
          scrollEnabled={false}
        />
        <TouchableOpacity activeOpacity={Constants.commonConstants.buttonActiveOpacity} onPress={this.onPressDone}>
          <View style={[styles.buttonContainer, buttonContainerStyle]}>
            <Text style={[styles.buttonTextStyle, buttonTextStyle]}>{`Done (${arraySelected.length})`}</Text>
          </View>
        </TouchableOpacity>
        {isLoading && <Loader loaderColor={loaderColor} />}
      </View>
    );
  }
}

RNMusicPicker.PropTypes = {
  sectionContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  sectionTextStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  itemContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  songTitleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  songDescriptionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  fastScrollTextStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  buttonContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  buttonTextStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  defaultSongIcon: Image.propTypes.source,
  defaultAddIcon: Image.propTypes.source,
  defaultTickIcon: Image.propTypes.source,
  loaderColor: PropTypes.string,
};

RNMusicPicker.defaultProps = {
  sectionContainerStyle: {},
  sectionTextStyle: {},
  itemContainerStyle: {},
  songTitleStyle: {},
  songDescriptionStyle: {},
  fastScrollTextStyle: {},
  buttonContainerStyle: {},
  buttonTextStyle: {},
  defaultSongIcon: images.iconSong,
  defaultAddIcon: images.iconAdd,
  defaultTickIcon: images.iconTick,
  loaderColor: Constants.colors.redShadeF9,
};

export default RNMusicPicker;
