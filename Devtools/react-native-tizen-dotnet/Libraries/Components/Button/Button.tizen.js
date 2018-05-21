/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Button
 * @flow
 */
'use strict';

const ColorPropType = require('ColorPropType');

const React = require('React');
const StyleSheet = require('StyleSheet');
const requireNativeComponent = require('requireNativeComponent');
const NativeMethodsMixin = require('NativeMethodsMixin');
const Text = require('Text');
const View = require('View');

const invariant = require('fbjs/lib/invariant');

/**
 * A basic button component that should render nicely on any platform. Supports
 * a minimal level of customization.
 *
 * <center><img src="img/buttonExample.png"></img></center>
 *
 * If this button doesn't look right for your app, you can build your own
 * button using [TouchableOpacity](https://facebook.github.io/react-native/docs/touchableopacity.html)
 * or [TouchableNativeFeedback](https://facebook.github.io/react-native/docs/touchablenativefeedback.html).
 * For inspiration, look at the [source code for this button component](https://github.com/facebook/react-native/blob/master/Libraries/Components/Button.js).
 * Or, take a look at the [wide variety of button components built by the community](https://js.coach/react-native?search=button).
 *
 * Example usage:
 *
 * ```
 * <Button
 *   onPress={onPressLearnMore}
 *   title="Learn More"
 *   color="#841584"
 *   accessibilityLabel="Learn more about this purple button"
 * />
 * ```
 *
 */

class Button extends React.Component {


  props: {
    title: string,
    //  opacity:number;
    onPress: () => func,
    color?: ?string,
    accessibilityLabel?: ?string,
    disabled?: ?boolean,
      testID?: ?string,
  };
  mixins: [NativeMethodsMixin];
  static propTypes = {
    ...View.propTypes,
    /**
     * Text to display inside the button
     */
    title: React.PropTypes.string.isRequired,
     // opacity: React.PropTypes.number,
    /**
     * Text to display for blindness accessibility features
     */
    accessibilityLabel: React.PropTypes.string,
    /**
     * Color of the text (iOS, Windows), or background color of the button (Android)
     */
    color: ColorPropType,
    /**
     * If true, disable all interactions for this component.
     */
    disabled: React.PropTypes.bool,
    /**
     * Handler to be called when the user taps the button
     */
    onPress: React.PropTypes.func,
  /**
   * Used to locate this view in end-to-end tests.
   */
      testID: React.PropTypes.string,
  };
/*  shouldComponentUpdate(nextProps, nextState) {
      console.log("shouldComponentUpdate............."+!(nextProps.title === this.props.title));
      return !(nextProps.title === this.props.title);
      }*/
  render() {
      const {
      color,
      onPress,
      title,
      disabled,
      testID,
      } = this.props;

    return (
      <RCTButton testID={testID} {...this.props}>

      </RCTButton>
    );
  }
}
var RCTButton = requireNativeComponent("RCTButton");
module.exports = Button;
