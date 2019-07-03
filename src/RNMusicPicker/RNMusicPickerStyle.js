import { StyleSheet } from 'react-native';
import * as Constants from '../Helper/Constants';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  fastScrollFlatList: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
  fastScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sectionContainer: {
    backgroundColor: Constants.colors.grayShadeF5,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sectionText: {
    fontSize: 17,
    fontWeight: '600',
    color: Constants.colors.black,
  },
  listItemStyle: {
    flexDirection: 'row',
    paddingLeft: 5,
    paddingRight: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  songIcon: {
    height: 20,
    width: 20,
    margin: 3,
  },
  songInnerItem: {
    flex: 1,
    paddingHorizontal: 10,
  },
  songTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Constants.colors.black,
  },
  songDescription: {
    fontSize: 15,
    color: Constants.colors.black,
    marginTop: 2,
  },
  rightIconContainer: {
    width: 30,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRightIcon: {
    width: 24,
    height: 24,
  },
  listRightSmallIcon: {
    width: 18,
    height: 18,
  },
  fastScrollText: {
    fontSize: 17,
    fontWeight: '600',
    color: Constants.colors.redShadeF9,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  buttonTextStyle: {
    fontSize: 17,
    fontWeight: '800',
    color: Constants.colors.redShadeF9,
  },
});

export default { styles };
