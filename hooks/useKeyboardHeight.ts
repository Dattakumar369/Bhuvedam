import { useEffect, useState } from 'react';
import { Keyboard, Platform, type KeyboardEventListener } from 'react-native';

/** Live keyboard height — 0 when closed. Works on iOS + Android. */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const onShow: KeyboardEventListener = (event) => {
      setHeight(event.endCoordinates.height);
    };
    const onHide: KeyboardEventListener = () => {
      setHeight(0);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
