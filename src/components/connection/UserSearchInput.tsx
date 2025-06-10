/**
 * UserSearchInput Component
 * 
 * A debounced search input component for searching users in the Ottr app.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import OttrInput from '../common/OttrInput';
import theme from '../../constants/theme';
import { TIMEOUTS } from '../../constants/config';

interface UserSearchInputProps {
  onSearch: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * UserSearchInput Component
 */
const UserSearchInput: React.FC<UserSearchInputProps> = ({
  onSearch,
  isLoading = false,
  placeholder = 'Search by username...',
}) => {
  // State for search text
  const [searchText, setSearchText] = useState('');

  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      onSearch(text);
    }, TIMEOUTS.DEBOUNCE.SEARCH),
    [onSearch]
  );

  // Update search when text changes
  useEffect(() => {
    debouncedSearch(searchText);
    
    // Cancel debounced search on cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, debouncedSearch]);

  // Handle text change
  const handleTextChange = (text: string) => {
    setSearchText(text);
  };

  // Handle clear button press
  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  // Render right icon based on state
  const renderRightIcon = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={theme.colors.primary} />;
    }
    
    if (searchText) {
      return (
        <Ionicons
          name="close-circle"
          size={20}
          color={theme.colors.textSecondary}
          onPress={handleClear}
        />
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <OttrInput
        value={searchText}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        leftIcon={
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
        }
        rightIcon={renderRightIcon()}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  input: {
    marginBottom: 0,
  },
});

export default UserSearchInput;
