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

import React, { Component } from "react";
import {
  Picker,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform
} from "react-native";
import { Text } from "react-native-elements";
import { StackActions } from "react-navigation";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import LinkText from "../components/LinkText";
import colorStyle, { light } from "../styles/color";
import containerStyle from "../styles/container";
import { SettingActions, SettingState } from "../modules/setting";
import { ServiceActions } from "../modules/service";
import { garaponDevId, garaponEntryUrl } from "../config/constants";

type Props = {
  dispatch: Dispatch;
  setting: SettingState;
};
class Setup extends Component<Props> {
  changes: string[] = [];

  render() {
    const { dispatch, setting } = this.props;
    const {
      backend: backendSetting = {},
      comment: commentSetting = {},
      view: viewSetting = {}
    } = setting;
    const {
      type: backendType = "chinachu",
      auth: backendAuth = false,
      version: backendVersion = "3",
      url: backendUrl = "",
      user: backendUser = "",
      password: backendPassword = "",
      streamType = "m2ts",
      streamParams = "c:v=copy&c:a=copy",
      mobileStreamType = "mp4",
      mobileStreamParams = "b:v=1M&b:a=128k&s=1280x720",
      reloadIntervalSeconds = "0"
    } = backendSetting;
    const {
      email: moritapoEmail = "",
      password: moritapoPassword = ""
    } = commentSetting;
    const {
      countMode = "speed",
      hourFirst = "4",
      hourFormat = ""
    } = viewSetting;
    return (
      <View style={styles.container}>
        <View style={[containerStyle.row, colorStyle.bgDark]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              dispatch(StackActions.pop({}));
            }}
          >
            <FontAwesome5Icon
              name="chevron-circle-left"
              solid
              color={light}
              size={24}
            />
          </TouchableOpacity>
          <Text h4 style={[colorStyle.light, styles.title]}>
            MiyouTVの設定
          </Text>
        </View>
        <ScrollView style={styles.view}>
          <View style={styles.group}>
            <Text style={[colorStyle.black, styles.groupTitle]}>
              バックエンド
            </Text>
            <Text style={[colorStyle.black, styles.label]}>
              バックエンドの種類
            </Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <Picker
                style={styles.picker}
                itemStyle={styles.pickerItem}
                selectedValue={backendType}
                onValueChange={type => {
                  const { setting } = this.props;
                  const { backend = {} } = setting;
                  const { type: backendType = "chinachu" } = backend;
                  if (type !== backendType) {
                    let streamType = "";
                    let streamParams = "";
                    let mobileStreamType = "";
                    let mobileStreamParams = "";
                    if (type === "chinachu") {
                      streamType = "m2ts";
                      streamParams = "c:v=copy&c:a=copy";
                      mobileStreamType = "mp4";
                      mobileStreamParams = "b:v=1M&b:a=128k&s=1280x720";
                    } else if (type === "epgstation") {
                      streamType = Platform.OS === "web" ? "raw" : "mp4";
                      streamParams = Platform.OS === "web" ? "" : "mode=0";
                      mobileStreamType = "mp4";
                      mobileStreamParams = "mode=0";
                    }
                    this.update("backend", {
                      type,
                      auth: type === "garapon",
                      version: type === "garapon" ? "3" : "",
                      url: "",
                      user: "",
                      password: "",
                      streamType,
                      streamParams,
                      mobileStreamType,
                      mobileStreamParams
                    });
                  }
                }}
              >
                <Picker.Item label="Chinachu" value="chinachu" />
                <Picker.Item label="EPGStation" value="epgstation" />
                {garaponDevId && (
                  <Picker.Item
                    label="ガラポンTV API Ver.3 (～伍号機)"
                    value="garapon"
                  />
                )}
                {garaponDevId && (
                  <Picker.Item
                    label="ガラポンTV API Ver.4 (六号機～)"
                    value="garaponv4"
                  />
                )}
              </Picker>
            </View>
            {backendType === "chinachu" && (
              <View>
                <View style={styles.info}>
                  <LinkText url={chinachuInfoUrl} style={colorStyle.active}>
                    Chinachu β/γに対応しています。
                  </LinkText>
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ChinachuのURL
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    placeholder="http://127.0.0.1:20772/"
                    textContentType="URL"
                    value={backendUrl}
                    onChangeText={url => {
                      this.update("backend", { url });
                    }}
                  />
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ユーザー名とパスワードを使用する
                </Text>
                <View style={containerStyle.row}>
                  <Switch
                    value={backendAuth}
                    onValueChange={auth => {
                      if (auth) {
                        this.update("backend", { auth });
                      } else {
                        this.update("backend", {
                          auth,
                          user: "",
                          password: ""
                        });
                      }
                    }}
                  />
                </View>
                {backendAuth && (
                  <View>
                    <Text style={[colorStyle.black, styles.label]}>
                      Chinachuのユーザー
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        textContentType="username"
                        value={backendUser}
                        onChangeText={user => {
                          this.update("backend", { user });
                        }}
                      />
                    </View>
                    <Text style={colorStyle.black}>Chinachuのパスワード</Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        textContentType="password"
                        secureTextEntry
                        value={backendPassword}
                        onChangeText={password => {
                          this.update("backend", { password });
                        }}
                      />
                    </View>
                  </View>
                )}
                <Text style={[colorStyle.black, styles.label]}>
                  動画コンテナ
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <Picker
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    selectedValue={streamType}
                    onValueChange={streamType => {
                      if (streamType === "m2ts") {
                        this.update("backend", {
                          streamType,
                          streamParams: "c:v=copy&c:a=copy"
                        });
                      } else {
                        this.update("backend", {
                          streamType,
                          streamParams: "b:v=1M&b:a=128k&s=1280x720"
                        });
                      }
                    }}
                  >
                    <Picker.Item label="MPEG2-TS" value="m2ts" />
                    <Picker.Item label="MP4" value="mp4" />
                    <Picker.Item label="WebM" value="webm" />
                  </Picker>
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  動画オプション
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    value={streamParams}
                    onChangeText={streamParams => {
                      this.update("backend", { streamParams });
                    }}
                  />
                </View>
                {Platform.OS !== "web" && (
                  <View>
                    <Text style={[colorStyle.black, styles.label]}>
                      動画コンテナ(モバイルデータ通信)
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <Picker
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        selectedValue={mobileStreamType}
                        onValueChange={mobileStreamType => {
                          this.update("backend", {
                            mobileStreamType,
                            mobileStreamParams: "b:v=1M&b:a=128k&s=1280x720"
                          });
                        }}
                      >
                        <Picker.Item label="MP4" value="mp4" />
                        <Picker.Item label="WebM" value="webm" />
                      </Picker>
                    </View>
                    <Text style={[colorStyle.black, styles.label]}>
                      動画オプション(モバイルデータ通信)
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        value={mobileStreamParams}
                        onChangeText={mobileStreamParams => {
                          this.update("backend", { mobileStreamParams });
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
            {backendType === "epgstation" && (
              <View>
                <Text style={[colorStyle.black, styles.label]}>
                  EPGStationのURL
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    placeholder="http://127.0.0.1:8888/"
                    textContentType="URL"
                    value={backendUrl}
                    onChangeText={url => {
                      this.update("backend", { url });
                    }}
                  />
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ユーザー名とパスワードを使用する
                </Text>
                <View style={containerStyle.row}>
                  <Switch
                    value={backendAuth}
                    onValueChange={auth => {
                      if (auth) {
                        this.update("backend", { auth });
                      } else {
                        this.update("backend", {
                          auth,
                          user: "",
                          password: ""
                        });
                      }
                    }}
                  />
                </View>
                {backendAuth && (
                  <View>
                    <Text style={[colorStyle.black, styles.label]}>
                      EPGStationのユーザー
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        textContentType="username"
                        value={backendUser}
                        onChangeText={user => {
                          this.update("backend", { user });
                        }}
                      />
                    </View>
                    <Text style={colorStyle.black}>EPGStationのパスワード</Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        textContentType="password"
                        secureTextEntry
                        value={backendPassword}
                        onChangeText={password => {
                          this.update("backend", { password });
                        }}
                      />
                    </View>
                  </View>
                )}
                <Text style={[colorStyle.black, styles.label]}>
                  動画コンテナ
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  {Platform.OS === "web" ? (
                    <Picker
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                      selectedValue={streamType}
                      onValueChange={streamType => {
                        if (streamType === "raw") {
                          this.update("backend", {
                            streamType,
                            streamParams: ""
                          });
                        } else {
                          this.update("backend", {
                            streamType,
                            streamParams: "mode=0"
                          });
                        }
                      }}
                    >
                      <Picker.Item label="無変換" value="raw" />
                      <Picker.Item label="MP4" value="mp4" />
                      <Picker.Item label="WebM" value="webm" />
                      <Picker.Item label="MPEG2-TS" value="mpegts" />
                    </Picker>
                  ) : (
                    <Picker
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                      selectedValue={streamType}
                      onValueChange={streamType => {
                        this.update("backend", {
                          streamType,
                          streamParams: "mode=0"
                        });
                      }}
                    >
                      <Picker.Item label="MP4" value="mp4" />
                      <Picker.Item label="WebM" value="webm" />
                      <Picker.Item label="MPEG2-TS" value="mpegts" />
                    </Picker>
                  )}
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  動画オプション
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    value={streamParams}
                    editable={streamType !== "raw"}
                    onChangeText={streamParams => {
                      this.update("backend", { streamParams });
                    }}
                  />
                </View>
                {Platform.OS !== "web" && (
                  <View>
                    <Text style={[colorStyle.black, styles.label]}>
                      動画コンテナ(モバイルデータ通信)
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <Picker
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        selectedValue={mobileStreamType}
                        onValueChange={mobileStreamType => {
                          this.update("backend", {
                            mobileStreamType,
                            mobileStreamParams: "mode=0"
                          });
                        }}
                      >
                        <Picker.Item label="MP4" value="mp4" />
                        <Picker.Item label="WebM" value="webm" />
                      </Picker>
                    </View>
                    <Text style={[colorStyle.black, styles.label]}>
                      動画オプション(モバイルデータ通信)
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        value={mobileStreamParams}
                        onChangeText={mobileStreamParams => {
                          this.update("backend", { mobileStreamParams });
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
            {backendType === "garapon" && (
              <View>
                <View style={styles.info}>
                  <Text style={colorStyle.black}>
                    ガラポン伍/四/参号機に対応しています。
                  </Text>
                  <LinkText url={garaponEntryUrl} style={colorStyle.active}>
                    ガラポンTVレンタル申込ページ
                  </LinkText>
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ガラポンTVの接続情報をAPIから取得
                </Text>
                <View style={containerStyle.row}>
                  <Switch
                    value={backendAuth}
                    onValueChange={auth => {
                      this.update("backend", { auth });
                    }}
                  />
                </View>
                {!backendAuth && (
                  <View>
                    <Text style={[colorStyle.black, styles.label]}>
                      ガラポンTVのURL
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        keyboardType="url"
                        textContentType="URL"
                        value={backendUrl}
                        onChangeText={url => {
                          this.update("backend", { url });
                        }}
                      />
                    </View>
                    <Text style={[colorStyle.black, styles.label]}>
                      ガラポンTVのAPIバージョン
                    </Text>
                    <View
                      style={[
                        colorStyle.bgWhite,
                        colorStyle.borderGray,
                        styles.inputWrapper
                      ]}
                    >
                      <TextInput
                        style={[colorStyle.black, colorStyle.bgWhite]}
                        autoCapitalize="none"
                        keyboardType="numeric"
                        value={backendVersion}
                        onChangeText={version => {
                          this.update("backend", { version });
                        }}
                      />
                    </View>
                  </View>
                )}
                <Text style={[colorStyle.black, styles.label]}>
                  ガラポンTVのユーザー
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    textContentType="username"
                    value={backendUser}
                    onChangeText={user => {
                      this.update("backend", { user });
                    }}
                  />
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ガラポンTVのパスワード
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    textContentType="password"
                    secureTextEntry
                    value={backendPassword}
                    onChangeText={password => {
                      this.update("backend", { password });
                    }}
                  />
                </View>
              </View>
            )}
            {backendType === "garaponv4" && (
              <View>
                <View style={styles.info}>
                  <Text style={colorStyle.black}>
                    ガラポン六号機に対応しています。
                  </Text>
                  <LinkText url={garaponEntryUrl} style={colorStyle.active}>
                    ガラポンTVレンタル申込ページ
                  </LinkText>
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ガラポンTVのユーザー
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    textContentType="username"
                    value={backendUser}
                    onChangeText={user => {
                      this.update("backend", { user });
                    }}
                  />
                </View>
                <Text style={[colorStyle.black, styles.label]}>
                  ガラポンTVのパスワード
                </Text>
                <View
                  style={[
                    colorStyle.bgWhite,
                    colorStyle.borderGray,
                    styles.inputWrapper
                  ]}
                >
                  <TextInput
                    style={[colorStyle.black, colorStyle.bgWhite]}
                    autoCapitalize="none"
                    textContentType="password"
                    secureTextEntry
                    value={backendPassword}
                    onChangeText={password => {
                      this.update("backend", { password });
                    }}
                  />
                </View>
              </View>
            )}
            <Text style={[colorStyle.black, styles.label]}>
              自動更新間隔(秒)
            </Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <TextInput
                style={[colorStyle.black, colorStyle.bgWhite]}
                autoCapitalize="none"
                keyboardType="decimal-pad"
                textContentType="none"
                value={reloadIntervalSeconds}
                onChangeText={reloadIntervalSeconds => {
                  if (!isNaN(reloadIntervalSeconds as any)) {
                    this.update("backend", { reloadIntervalSeconds });
                  }
                }}
              />
            </View>
          </View>
          <View style={styles.group}>
            <Text style={[colorStyle.black, styles.groupTitle]}>
              モリタポアカウント
            </Text>
            <View style={styles.info}>
              <Text style={colorStyle.black}>
                コメントを表示するにはモリタポアカウントが必要です。
              </Text>
              <LinkText url={moritapoEntryUrl} style={colorStyle.active}>
                モリタポ新規入会ページ
              </LinkText>
            </View>
            <Text style={[colorStyle.black, styles.label]}>メールアドレス</Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <TextInput
                style={[colorStyle.black, colorStyle.bgWhite]}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={moritapoEmail}
                onChangeText={email => {
                  this.update("comment", { email });
                }}
              />
            </View>
            <Text style={[colorStyle.black, styles.label]}>パスワード</Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <TextInput
                style={[colorStyle.black, colorStyle.bgWhite]}
                autoCapitalize="none"
                textContentType="password"
                secureTextEntry
                value={moritapoPassword}
                onChangeText={password => {
                  this.update("comment", { password });
                }}
              />
            </View>
          </View>
          <View style={styles.group}>
            <Text style={[colorStyle.black, styles.groupTitle]}>表示設定</Text>
            <Text style={[colorStyle.black, styles.label]}>
              表示するカウント
            </Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <Picker
                style={styles.picker}
                itemStyle={styles.pickerItem}
                selectedValue={countMode}
                onValueChange={countMode => {
                  this.update("view", { countMode });
                }}
              >
                <Picker.Item label="コメント数" value="comment" />
                <Picker.Item label="勢い(コメント数/分)" value="speed" />
                <Picker.Item label="最大勢い(コメント数/分)" value="maxspeed" />
                <Picker.Item label="非表示" value="none" />
              </Picker>
            </View>
            <Text style={[colorStyle.black, styles.label]}>
              日付を変更する時刻
            </Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <Picker
                style={styles.picker}
                itemStyle={styles.pickerItem}
                selectedValue={hourFirst}
                onValueChange={hourFirst => {
                  this.update("view", { hourFirst });
                }}
              >
                <Picker.Item label="0時" value="0" />
                <Picker.Item label="1時" value="1" />
                <Picker.Item label="2時" value="2" />
                <Picker.Item label="3時" value="3" />
                <Picker.Item label="4時" value="4" />
                <Picker.Item label="5時" value="5" />
                <Picker.Item label="6時" value="6" />
                <Picker.Item label="7時" value="7" />
                <Picker.Item label="9時" value="8" />
                <Picker.Item label="9時" value="9" />
                <Picker.Item label="10時" value="10" />
                <Picker.Item label="11時" value="11" />
                <Picker.Item label="12時" value="12" />
                <Picker.Item label="13時" value="13" />
                <Picker.Item label="14時" value="14" />
                <Picker.Item label="15時" value="15" />
                <Picker.Item label="16時" value="16" />
                <Picker.Item label="17時" value="17" />
                <Picker.Item label="18時" value="18" />
                <Picker.Item label="19時" value="19" />
                <Picker.Item label="20時" value="20" />
                <Picker.Item label="21時" value="21" />
                <Picker.Item label="22時" value="22" />
                <Picker.Item label="23時" value="23" />
              </Picker>
            </View>
            <Text style={[colorStyle.black, styles.label]}>
              時刻フォーマット
            </Text>
            <View
              style={[
                colorStyle.bgWhite,
                colorStyle.borderGray,
                styles.inputWrapper
              ]}
            >
              <Picker
                style={styles.picker}
                itemStyle={styles.pickerItem}
                selectedValue={hourFormat}
                onValueChange={hourFormat => {
                  this.update("view", { hourFormat });
                }}
              >
                <Picker.Item label="0-11時表記" value="0:12" />
                <Picker.Item label="1-12時表記" value="1:12" />
                <Picker.Item label="0-23時表記" value="0:24" />
                <Picker.Item label="1-24時表記" value="1:24" />
                <Picker.Item
                  label={`${hourFirst}-${parseInt(hourFirst, 10) + 23}時表記`}
                  value=""
                />
              </Picker>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    this.update("isConfigured", true);
    if (this.changes.indexOf("backend") >= 0) {
      dispatch(ServiceActions.backendInit());
    }
    if (this.changes.indexOf("comment") >= 0) {
      dispatch(ServiceActions.commentInit());
    }
  }

  update(key: string, value: any) {
    const { dispatch } = this.props;
    dispatch(SettingActions.update(key, value));
    if (this.changes.indexOf(key) < 0) {
      this.changes.push(key);
    }
  }
}

export default connect(({ setting }: SettingState) => ({ setting }))(Setup);

const moritapoEntryUrl = "https://find.moritapo.jp/moritapo/subscribe.php";
const chinachuInfoUrl = "https://chinachu.moe/";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    flex: 1,
    height: 40,
    lineHeight: 40,
    marginHorizontal: 16,
    overflow: "hidden"
  },
  button: {
    alignItems: "center",
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    width: 40
  },
  view: {
    flex: 1
  },
  group: {
    margin: 16,
    marginTop: 0
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: "bold"
  },
  label: {
    fontSize: 16
  },
  info: {
    fontSize: 16,
    marginBottom: 8
  },
  inputWrapper: {
    borderWidth: 1,
    maxWidth: 320
  },
  picker: {
    borderWidth: 0,
    fontSize: 16,
    maxHeight: 96
  },
  pickerItem: {
    fontSize: 16,
    maxHeight: 96
  }
});
