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

import React, { useCallback, useMemo, CSSProperties, ChangeEvent } from "react";
import { View, ViewStyle, StyleSheet, StyleProp } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import moment from "../utils/moment-with-locale";

type Props = {
  value?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (value: Date) => void;
  containerStyle?: StyleProp<ViewStyle>;
  color?: string;
  backgroundColor?: string;
};
const DatePicker = ({
  containerStyle,
  color = "#000000",
  backgroundColor = "#ffffff",
  value = new Date(),
  minDate,
  maxDate,
  onChange
}: Props) => {
  const inputValue = useMemo(() => moment(value).format("YYYY-MM-DD"), [value]);
  const inputMin = useMemo(
    () => minDate && moment(minDate).format("YYYY-MM-DD"),
    [minDate]
  );
  const inputMax = useMemo(
    () => maxDate && moment(maxDate).format("YYYY-MM-DD"),
    [maxDate]
  );
  const onInputChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        const [Y = "0", M = "0", D = "0"] = target.value.split("-");
        value.setFullYear(parseInt(Y, 10));
        value.setMonth(parseInt(M, 10) - 1);
        value.setDate(parseInt(D, 10));
        onChange(new Date(value));
      }
    },
    [onChange]
  );

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor
        }
      ]}
    >
      <View style={styles.iconWrapper}>
        <FontAwesome5Icon name="calendar" solid color={color} />
      </View>
      <input
        style={{
          ...inputStyle,
          color
        }}
        type="date"
        value={inputValue}
        min={inputMin}
        max={inputMax}
        required
        onChange={onInputChange}
      />
    </View>
  );
};

export default DatePicker;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row"
  },
  iconWrapper: {
    alignItems: "center",
    width: 32
  }
});

const inputStyle: CSSProperties = {
  backgroundColor: "transparent",
  border: "none",
  flex: 1,
  fontFamily: "inherit",
  fontSize: 16,
  height: 32,
  paddingLeft: 4,
  textAlign: "left"
};
