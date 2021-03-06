/*!
Copyright 2016-2019 Brazil Ltd.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MenuProvider } from "react-native-popup-menu";

import AppNavigator from "../navigators";
import Titlebar from "./Titlebar";
import Viewer from "./Viewer";
import colorStyle from "../styles/color";
import { RootState } from "../modules";
import { SettingState } from "../modules/setting";
import { ViewerActions } from "../modules/viewer";
import { toastOptions } from "../config/constants";

type Setting = SettingState & {
  docking?: boolean;
};
type State = RootState & {
  setting: Setting;
};

const Main = () => {
  const mode = useSelector<State, string>(({ viewer: { mode } }) => mode);
  switch (mode) {
    case "view": {
      return <ChildView />;
    }
    case "child": {
      return <ChildWindow />;
    }
    case "stack":
    default: {
      return <MainWindow />;
    }
  }
};

const ChildView = () => (
  <MenuProvider backHandler>
    <Viewer />
  </MenuProvider>
);

const ChildWindow = () => (
  <View style={styles.container}>
    <Titlebar />
    <MenuProvider backHandler>
      <Viewer />
    </MenuProvider>
  </View>
);

const MainWindow = () => {
  const layoutCallbackId = useRef<number>();

  const dispatch = useDispatch();
  const docking = useSelector<State, boolean>(
    ({ setting }) => setting.docking == null || setting.docking
  );
  const isOpened = useSelector<State, boolean>(({ viewer }) => viewer.isOpened);
  const stacking = useSelector<State, boolean>(({ viewer }) => viewer.stacking);
  const fullScreen = useSelector<State, boolean>(
    ({ window }) => window.fullScreen
  );

  const [viewerLayout, setViewerLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const right = docking && isOpened && !stacking ? viewerLayout.width : 0;
  const covered = docking && isOpened && stacking;

  useEffect(
    () => () => {
      clearTimeout(layoutCallbackId.current);
    },
    []
  );
  useEffect(() => {
    if (docking && isOpened && !stacking) {
      toastOptions.containerStyle = {
        marginLeft: 0,
        marginRight: viewerLayout.width
      };
    } else {
      toastOptions.containerStyle = {};
    }
  }, [docking, isOpened, stacking]);

  const onLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      if (layoutCallbackId.current != null) {
        clearTimeout(layoutCallbackId.current);
      }
      const { layout } = nativeEvent;
      const { x, y, width, height } = layout;
      layoutCallbackId.current = setTimeout(() => {
        const viewerLayout = {
          x: Math.floor(x),
          y: Math.floor(y),
          width: Math.ceil(width),
          height: Math.ceil(height)
        };
        let stacking = true;
        if (!fullScreen) {
          stacking = false;
          if (width > 1920) {
            viewerLayout.width = Math.ceil((width * 2) / 5);
          } else if (width > 1280) {
            viewerLayout.width = Math.ceil(width / 2);
          } else if (width > 768) {
            viewerLayout.width = Math.ceil((width * 3) / 5);
          } else if (width > 540) {
            viewerLayout.width = 320;
          } else {
            stacking = true;
          }
          viewerLayout.x = Math.floor(width - viewerLayout.width);
          viewerLayout.x += 2;
          viewerLayout.y += 2;
          viewerLayout.height += 1;
        }
        setViewerLayout(viewerLayout);
        dispatch(ViewerActions.update({ stacking }));
        dispatch(ViewerActions.resize(viewerLayout));
      }, 200);
    },
    [fullScreen]
  );

  return (
    <View style={styles.container}>
      <Titlebar />
      <View style={[colorStyle.bgDark, styles.view]} onLayout={onLayout}>
        <View style={[StyleSheet.absoluteFill, { right }]}>
          <MenuProvider backHandler>
            <AppNavigator />
          </MenuProvider>
        </View>
        {covered && (
          <View style={[StyleSheet.absoluteFill, colorStyle.bgDark]} />
        )}
      </View>
    </View>
  );
};
export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  view: {
    flex: 1
  }
});
