import React, { PureComponent } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  ImageStyle,
  ImageURISource,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProperties,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { ClearButtonMode } from '../types/Store';
import { style as S } from '../styles/SearchBar';
import { tr, trKeys } from '../lib/translations';

const kCancelButtonWidthDefault = 75; // In pts
const kCancelButtonAnimationDuration = 200; // In ms

const clearIcon = require('../../assets/images/clear.png');
const isAndroid = Platform.OS === 'android';

export interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  onFocus?: (input: any, container: any) => void;
  onBlur?: (input: any, container: any) => void;
  onCancel?: () => void;
  renderCancelButton?: () => React.ReactNode;

  // accessibility
  accessibilityLabel?: string;
  rightBtnAccessibilityLabel?: string;

  // visibility
  showSearchIcon?: boolean;
  showLocator?: boolean;
  showCancel?: boolean;
  clearButtonMode?: ClearButtonMode;

  // button
  searchTitle?: string;
  cancelTitle?: string;
  searchIcon?: ImageURISource;
  locateIcon?: ImageURISource;
  cancelImage?: ImageURISource;
  onLocateButtonPress?: () => void;

  // input
  inputProps?: TextInputProperties;
  shouldClearOnSubmit?: boolean;

  // style
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  searchTitleStyle?: StyleProp<TextStyle>;
  cancelTitleStyle?: StyleProp<TextStyle>;
  searchIconStyle?: StyleProp<ImageStyle>;
  locateIconStyle?: StyleProp<ImageStyle>;
  inputTextStyle?: StyleProp<TextStyle>;
  cancelImageStyle?: StyleProp<ImageStyle>;
  cancelImageBoxStyle?: StyleProp<ViewStyle>;
  cancelContainerStyle?: StyleProp<ViewStyle>;

  cancelButtonWidth?: number;
  cancelButtonAlwaysVisible?: boolean;

  showRightBtnIcon?: boolean;
  rightBtnIcon?: ImageSourcePropType;
  onRightBtnPress?: () => void;
  rightBtnStyle?: StyleProp<ViewStyle>;
  rightBtnIconStyle?: StyleProp<ImageStyle>;
}

export interface SearchBarState {
  value: string;
  cancelButtonWidth: Animated.Value;
  isFocused: boolean;
}

const styles = StyleSheet.create({
  rightIcon: {
    width: 25
  }
});

export class SearchBar extends PureComponent<SearchBarProps, SearchBarState> {
  static defaultProps: Partial<SearchBarProps> = {
    shouldClearOnSubmit: true
  };
  input: any;
  container: any;

  constructor(props: SearchBarProps) {
    super(props);

    let cancelButtonWidth;

    if (props.cancelButtonAlwaysVisible) {
      cancelButtonWidth = new Animated.Value(props.cancelButtonWidth || kCancelButtonWidthDefault);
    } else {
      cancelButtonWidth = new Animated.Value(0);
    }

    this.state = {
      value: props.initialValue || '',
      cancelButtonWidth,
      isFocused: false
    };
  }

  render(): any {
    const {
      showCancel,
      style,
      showLocator
    } = this.props;

    return (
      <View ref={this.saveContainerRef} style={[S.container, style]}>
        <View style={S.searchBarContainer}>
          {showLocator && this.renderLocateButton()}
          {this.renderInput()}
          {showCancel && this.renderCancelButton()}
        </View>
      </View>
    );
  }

  saveContainerRef = (container: any) => (this.container = container);
  saveInputRef = (input: any) => (this.input = input);

  renderInput = () => {
    const {
      accessibilityLabel,
      placeholder,
      clearButtonMode,
      searchIcon,
      inputProps,
      inputTextStyle,
      searchIconStyle,
      containerStyle,
      showSearchIcon
    } = this.props;

    const { isFocused } = this.state;
    const imageStyle: StyleProp<ImageStyle> = [
      S.searchIcon,
      isFocused && S.searchIconFocused,
      searchIconStyle
    ];

    return (
      <View style={[S.inputContainer, containerStyle]}>
        {showSearchIcon && searchIcon &&
          <Image source={searchIcon} style={imageStyle} resizeMode='contain' />
        }
        <TextInput
          style={[S.input, inputTextStyle]}
          ref={this.saveInputRef}
          onChangeText={this.handleChangeText}
          value={this.state.value}
          onSubmitEditing={this.handleSubmit}
          placeholder={placeholder}
          clearButtonMode={clearButtonMode || 'never'}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          returnKeyType='search'
          accessibilityLabel={accessibilityLabel || 'search bar'}
          underlineColorAndroid='transparent'
          {...inputProps}
        />
        {this.renderAndroidClearButton()}
        {this.renderRightBtnIcon()}
      </View>
    );
  }

  renderAndroidClearButton = () => {
    if (
      this.props.clearButtonMode === 'never' ||
      !isAndroid ||
      !this.state.value ||
      this.state.value.length === 0 ||
      !this.props.clearButtonMode
    ) {
      return null;
    }

    const icon = <Image source={clearIcon} style={styles.rightIcon} resizeMode='contain' />;

    return (
      <TouchableOpacity onPress={this.handleClear} accessibilityRole='button'>
        {icon}
      </TouchableOpacity>
    );
  }

  renderRightBtnIcon = () => {
    const {
      showRightBtnIcon,
      rightBtnIcon,
      onRightBtnPress,
      onSubmit,
      rightBtnIconStyle,
      rightBtnStyle
    } = this.props;

    if (!showRightBtnIcon || !rightBtnIcon) {
      return null;
    }

    const icon = <Image source={rightBtnIcon} style={rightBtnIconStyle} resizeMode='contain' />;

    if (!onRightBtnPress && !onSubmit) {
      return icon;
    }

    return (
      <TouchableOpacity
        style={rightBtnStyle}
        onPress={onRightBtnPress || this.handleSubmit}
        accessibilityLabel={this.props.rightBtnAccessibilityLabel ||
          tr.string(
            trKeys.flagship.search.actions.search.accessibilityLabel, {value: this.state.value}
          )}
        accessibilityRole='button'
      >
        {icon}
      </TouchableOpacity>
    );
  }

  handleChangeText = (value: string) => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  handleSubmit = () => {
    const { onSubmit, shouldClearOnSubmit } = this.props;

    if (onSubmit) {
      onSubmit(this.state.value);
    }

    this.input.blur();
    if (shouldClearOnSubmit) {
      this.setState({ value: '' });
    }
  }

  handleCancel = () => {
    this.setState({ value: '' });
    this.input.blur();
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  handleClear = () => {
    this.input.blur();
    this.setState({ value: '' });

    if (this.props.onChange) {
      this.props.onChange('');
    }
  }

  handleFocus = () => {
    const { cancelButtonAlwaysVisible, cancelButtonWidth, onFocus } = this.props;

    this.setState({ isFocused: true });

    if (onFocus) {
      onFocus(this.input, this.container);
    }

    if (!cancelButtonAlwaysVisible) {
      // The cancel button may not be visible. Animate it to full width.
      Animated.timing(this.state.cancelButtonWidth, {
        toValue: cancelButtonWidth || kCancelButtonWidthDefault,
        duration: kCancelButtonAnimationDuration
      }).start();
    }
  }

  handleBlur = () => {
    const { cancelButtonAlwaysVisible, onBlur } = this.props;

    this.setState({ isFocused: false });

    if (onBlur) {
      onBlur(this.input, this.container);
    }

    if (!cancelButtonAlwaysVisible) {
      // Cancel button is not supposed to be visible on blur. Animate it away.
      Animated.timing(this.state.cancelButtonWidth, {
        toValue: 0,
        duration: kCancelButtonAnimationDuration
      }).start();
    }
  }

  handleLocate = () => {
    const { onLocateButtonPress } = this.props;
    if (onLocateButtonPress) {
      onLocateButtonPress();
    }
  }

  focusInput = () => {
    this.input.focus();
  }

  renderCancelButton = () => {
    const {
      cancelContainerStyle,
      cancelImage,
      cancelImageBoxStyle,
      cancelImageStyle,
      cancelTitle,
      cancelTitleStyle,
      renderCancelButton
    } = this.props;

    const { cancelButtonWidth } = this.state;

    if (renderCancelButton) {
      return renderCancelButton();
    }

    const viewStyle = cancelButtonWidth ? { width: cancelButtonWidth } : null;
    // if cancelButtonWidth is defined, parent width is defined, so just fill all the space
    const cancelStyle = cancelButtonWidth ? { flex: 1 } : { width: kCancelButtonWidthDefault };
    const cancelImageBoxStyleInput = cancelImageBoxStyle ? cancelImageBoxStyle : null;
    const touchableStyle = [S.rightButton, cancelStyle, cancelImageBoxStyleInput];

    return (
      <Animated.View style={[viewStyle, cancelContainerStyle]}>
        <TouchableOpacity
          style={touchableStyle}
          onPress={this.handleCancel}
          accessibilityLabel='Cancel search'
          accessibilityRole='button'
        >
          {cancelImage ? (
            <Image
              source={cancelImage}
              style={cancelImageStyle}
            />
          ) : (
            <Text style={cancelTitleStyle}>
              {cancelTitle || 'Cancel'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  renderLocateButton = () => {
    const { locateIcon, locateIconStyle } = this.props;

    if (!locateIcon) {
      console.warn('locateIcon is required to show locator');
      return null;
    }

    return (
      <TouchableOpacity
        style={S.locateButton}
        onPress={this.handleLocate}
        accessibilityLabel='Locate me'
        accessibilityRole='button'
      >
        <Image source={locateIcon} style={[S.locateIcon, locateIconStyle]} resizeMode='contain' />
      </TouchableOpacity>
    );
  }
}
