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

import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  LayoutChangeEvent
} from "react-native";
import { ButtonGroup, Image, Text } from "react-native-elements";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import CommentPlayer from "./CommentPlayer";
import Controller from "./Controller";
import Player from "./Player";
import PlayerContainer from "./PlayerContainer";
import Seekbar from "./Seekbar";
import ViewerInfo from "./ViewerInfo";
import colorStyle, { dark, grayDark, light } from "../styles/color";
import containerStyle from "../styles/container";
import { RootState } from "../modules";
import { SettingState } from "../modules/setting";
import { ViewerActions, ViewerProgram } from "../modules/viewer";
import CommentInfo from "./CommentInfo";

type Setting = SettingState & {
  commentPlayer?: {
    enabled?: boolean;
  };
  viewer?: {
    expand?: boolean;
  };
};
type State = RootState & {
  setting: Setting;
};

const Viewer = memo(() => {
  const layoutCallbackId = useRef<number>();

  const dispatch = useDispatch();
  const expand = useSelector<State, boolean>(
    ({ setting }) => setting.viewer?.expand
  );
  const commentEnabled = useSelector<State, boolean>(
    ({ setting }) =>
      setting.commentPlayer?.enabled == null || setting.commentPlayer?.enabled
  );
  const programs = useSelector<State, ViewerProgram[]>(
    ({ viewer }) => viewer.programs,
    shallowEqual
  );
  const index = useSelector<State, number>(({ viewer }) => viewer.index);
  const mode = useSelector<State, string>(({ viewer }) => viewer.mode);
  const playing = useSelector<State, boolean>(({ viewer }) => viewer.playing);
  const peakPlayEnabled = useSelector<State, boolean>(
    ({ viewer }) => viewer.peakPlay
  );
  const controlEnabled = useSelector<State, boolean>(
    ({ viewer }) => viewer.control
  );

  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isLandscape, setLandscape] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(
    Platform.OS === "web" ? 1 : 0
  );

  const program = programs[index];
  const tabIndex = playing ? selectedIndex : 0;

  const screenHeight = useMemo(() => {
    let screenHeight = containerHeight;
    if (!expand) {
      screenHeight = (containerWidth / 16) * 9;
      const maxScreenHeight = containerHeight / 2 - 40;
      if (screenHeight > maxScreenHeight) {
        screenHeight = maxScreenHeight;
      }
    }
    return screenHeight;
  }, [expand, containerWidth, containerHeight]);
  const tabButtons = useMemo(
    () => [
      {
        element: () => <Text style={colorStyle.light}>情報</Text>
      },
      {
        element: () => <Text style={colorStyle.light}>コメント</Text>
      }
    ],
    []
  );

  useEffect(
    () => () => {
      clearTimeout(layoutCallbackId.current);
    },
    []
  );

  const onLayout = useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    if (layoutCallbackId.current != null) {
      clearTimeout(layoutCallbackId.current);
    }
    const { layout } = nativeEvent;
    const containerWidth = layout.width;
    const containerHeight = layout.height;
    const isLandscape =
      Platform.OS === "web"
        ? layout.width > breakpoint
        : layout.width > layout.height;
    layoutCallbackId.current = setTimeout(() => {
      setContainerWidth(containerWidth);
      setContainerHeight(containerHeight);
      setLandscape(isLandscape);
    }, 200);
  }, []);
  const selectedIndexChange = useCallback((selectedIndex: number) => {
    setSelectedIndex(selectedIndex);
  }, []);
  const play = useCallback(() => {
    dispatch(ViewerActions.update({ playing: true, peakPlay: false }));
  }, []);
  const peakPlay = useCallback(() => {
    let extraIndex = 0;
    if (program.recorded && program.commentMaxSpeedTime) {
      const peakTime = new Date(program.commentMaxSpeedTime).getTime();
      extraIndex = program.recorded.findIndex(
        ({ start, end }) =>
          new Date(start).getTime() < peakTime &&
          new Date(end).getTime() > peakTime
      );
      if (extraIndex < 0) {
        extraIndex = 0;
      }
    }
    dispatch(
      ViewerActions.update({
        playing: true,
        peakPlay: true,
        extraIndex
      })
    );
  }, [program]);
  const close = useCallback(() => {
    dispatch(ViewerActions.close());
  }, []);
  const dock = useCallback(() => {
    dispatch(ViewerActions.dock());
  }, []);
  const undock = useCallback(() => {
    dispatch(ViewerActions.undock());
  }, []);
  const previous = useCallback(() => {
    const previousIndex = index - 1;
    const program = programs[previousIndex];
    if (program) {
      let extraIndex = 0;
      if (peakPlayEnabled && program.recorded && program.commentMaxSpeedTime) {
        const peakTime = new Date(program.commentMaxSpeedTime).getTime();
        extraIndex = program.recorded.findIndex(
          ({ start, end }) =>
            new Date(start).getTime() < peakTime &&
            new Date(end).getTime() > peakTime
        );
        if (extraIndex < 0) {
          extraIndex = 0;
        }
      }
      dispatch(ViewerActions.update({ index: previousIndex, extraIndex }));
    }
  }, [programs, index, peakPlayEnabled]);
  const next = useCallback(() => {
    const nextIndex = index + 1;
    const program = programs[nextIndex];
    if (program) {
      let extraIndex = 0;
      if (peakPlayEnabled && program.recorded && program.commentMaxSpeedTime) {
        const peakTime = new Date(program.commentMaxSpeedTime).getTime();
        extraIndex = programs.findIndex(
          ({ start, end }) =>
            new Date(start).getTime() < peakTime &&
            new Date(end).getTime() > peakTime
        );
        if (extraIndex < 0) {
          extraIndex = 0;
        }
      }
      dispatch(ViewerActions.update({ index: nextIndex, extraIndex }));
    }
  }, [programs, index, peakPlayEnabled]);

  return (
    <View style={[colorStyle.bgLight, styles.container]} onLayout={onLayout}>
      {program && containerWidth > 0 && (
        <View
          style={isLandscape ? [containerStyle.row, styles.view] : styles.view}
        >
          <View
            style={[isLandscape ? styles.primaryColumn : styles.primaryRow]}
          >
            <View
              style={[isLandscape ? { flex: 1 } : { height: screenHeight }]}
            >
              <Image
                containerStyle={[styles.screenContent, styles.imageContainer]}
                style={styles.image}
                source={{ uri: program.preview }}
                resizeMode="contain"
              />
              <View
                style={[
                  containerStyle.row,
                  containerStyle.center,
                  styles.screenContent
                ]}
              >
                <TouchableOpacity style={styles.button} onPress={play}>
                  <FontAwesome5Icon name="play" solid color={light} size={24} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={peakPlay}>
                  <FontAwesome5Icon name="star" solid color={light} size={24} />
                </TouchableOpacity>
              </View>
              {playing && (
                <PlayerContainer style={styles.screenContent}>
                  <Player />
                  {commentEnabled && (
                    <View style={styles.screenContent}>
                      <CommentPlayer />
                    </View>
                  )}
                </PlayerContainer>
              )}
              {playing && controlEnabled && (
                <View style={styles.control}>
                  <Seekbar />
                  <Controller />
                </View>
              )}
            </View>
            {(!playing || controlEnabled || (!expand && !isLandscape)) && (
              <View
                style={[
                  containerStyle.row,
                  containerStyle.nowrap,
                  colorStyle.bgDark,
                  (expand || isLandscape) && styles.primaryHeaderExpand
                ]}
              >
                {mode === "stack" && (
                  <TouchableOpacity style={styles.button} onPress={close}>
                    <FontAwesome5Icon
                      name="chevron-circle-left"
                      solid
                      color={light}
                      size={24}
                    />
                  </TouchableOpacity>
                )}
                {mode === "view" && (
                  <TouchableOpacity style={styles.button} onPress={undock}>
                    <FontAwesome5Icon
                      name="external-link-alt"
                      solid
                      color={light}
                      size={24}
                    />
                  </TouchableOpacity>
                )}
                {mode === "child" && (
                  <TouchableOpacity style={styles.button} onPress={dock}>
                    <FontAwesome5Icon
                      name="columns"
                      solid
                      color={light}
                      size={24}
                    />
                  </TouchableOpacity>
                )}
                <Text h4 style={[colorStyle.light, styles.title]}>
                  {program.rank ? `${program.rank}. ` : ""}
                  {program.fullTitle}
                </Text>
                {mode === "view" && (
                  <TouchableOpacity style={styles.button} onPress={close}>
                    <FontAwesome5Icon
                      name="times"
                      solid
                      color={light}
                      size={24}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {(!playing || controlEnabled) && programs[index - 1] && (
              <TouchableOpacity
                style={[styles.button, styles.buttonPrevious]}
                onPress={previous}
              >
                <FontAwesome5Icon
                  name="chevron-left"
                  solid
                  style={styles.iconShadow}
                  size={24}
                  color={light}
                />
              </TouchableOpacity>
            )}
            {(!playing || controlEnabled) && programs[index + 1] && (
              <TouchableOpacity
                style={[styles.button, styles.buttonNext]}
                onPress={next}
              >
                <FontAwesome5Icon
                  name="chevron-right"
                  solid
                  style={styles.iconShadow}
                  color={light}
                  size={24}
                />
              </TouchableOpacity>
            )}
          </View>
          {!expand && (
            <View
              style={[
                colorStyle.bgDark,
                isLandscape ? styles.secondaryColumn : styles.secondaryRow
              ]}
            >
              <ButtonGroup
                containerStyle={[colorStyle.bgDark, colorStyle.borderGrayDark]}
                containerBorderRadius={0}
                selectedButtonStyle={colorStyle.bgBlack}
                innerBorderStyle={{ color: grayDark }}
                buttons={tabButtons}
                selectedIndex={tabIndex}
                onPress={selectedIndexChange}
              />
              {tabIndex === 0 && <ViewerInfo />}
              {tabIndex === 1 && <CommentInfo />}
            </View>
          )}
        </View>
      )}
    </View>
  );
});
export default Viewer;

const breakpoint = 640;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    flex: 1,
    marginHorizontal: 16,
    height: 30,
    overflow: "hidden"
  },
  view: {
    flex: 1,
    alignItems: "stretch"
  },
  primaryRow: {
    flexDirection: "column-reverse"
  },
  secondaryRow: {
    flex: 1
  },
  primaryColumn: {
    flex: 5
  },
  secondaryColumn: {
    flex: 4,
    maxWidth: 480
  },
  primaryHeaderExpand: {
    backgroundColor: "#3a3a3aa8",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  screenContent: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  control: {
    backgroundColor: "#3a3a3aa8",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0
  },
  imageContainer: {
    backgroundColor: "#000000"
  },
  image: {
    flex: 1
  },
  iconShadow: {
    opacity: 0.6,
    textShadowColor: dark,
    textShadowOffset: {
      height: 1,
      width: 1
    },
    textShadowRadius: 5
  },
  button: {
    alignItems: "center",
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    width: 40
  },
  buttonPrevious: {
    left: 0,
    position: "absolute",
    top: 40
  },
  buttonNext: {
    position: "absolute",
    right: 0,
    top: 40
  }
});
