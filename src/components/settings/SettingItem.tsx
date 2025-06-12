import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, AccessibilityRole } from 'react-native';
import theme from '../../constants/theme';
import OttrCard from '../common/OttrCard';
import OttrText from '../common/OttrText';

export type SettingItemVariant = 'info' | 'action' | 'toggle';

interface BaseProps {
  label: string;
  accessibilityLabel?: string;
  variant?: SettingItemVariant;
}

interface InfoProps extends BaseProps {
  variant?: 'info';
  value: string;
}

interface ActionProps extends BaseProps {
  variant: 'action';
  onPress: () => void;
}

interface ToggleProps extends BaseProps {
  variant: 'toggle';
  value: boolean;
  onToggle: (value: boolean) => void;
}

type SettingItemProps = InfoProps | ActionProps | ToggleProps;

const SettingItem: React.FC<SettingItemProps> = (props) => {
  const { label, accessibilityLabel } = props;

  // Render according to variant
  const renderContent = () => {
    switch (props.variant) {
      case 'action':
        return (
          <TouchableOpacity
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            onPress={props.onPress}
          >
            <OttrText style={styles.label}>{label}</OttrText>
          </TouchableOpacity>
        );
      case 'toggle':
        return (
          <View style={styles.row} accessible accessibilityLabel={accessibilityLabel || label} accessibilityRole="switch">
            <OttrText style={styles.label}>{label}</OttrText>
            <Switch
              value={props.value}
              onValueChange={props.onToggle}
              thumbColor={props.value ? theme.colors.primary : '#ccc'}
            />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={styles.row} accessible accessibilityRole="text" accessibilityLabel={accessibilityLabel || label}>
            <OttrText style={styles.label}>{label}</OttrText>
            {'value' in props && (
              <OttrText style={styles.value}>{props.value}</OttrText>
            )}
          </View>
        );
    }
  };

  return <OttrCard style={styles.card}>{renderContent()}</OttrCard>;
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  value: {
    fontSize: 16,
    color: '#8D7A6B',
  },
});

export default SettingItem;
