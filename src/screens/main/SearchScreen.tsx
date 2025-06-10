/**
 * SearchScreen
 * 
 * Search screen for finding and connecting with other Ottr users.
 * Features debounced search input, user cards with connection status,
 * and appropriate empty states.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/navigationTypes';
import UserSearchInput from '../../components/connection/UserSearchInput';
import UserCard from '../../components/connection/UserCard';
import OttrText from '../../components/common/OttrText';
import theme from '../../constants/theme';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useConnectionStore } from '../../store/connectionStore';
import { User, ConnectionRequest } from '../../types/database';
import ConnectionRequestModal from '../modals/ConnectionRequestModal';
import { CONNECTION_STATES } from '../../constants/config';

type SearchScreenProps = {
  navigation: StackNavigationProp<MainStackParamList, 'Search'>;
};

/**
 * SearchScreen Component
 */
const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  // Get state from stores
  const { searchUsers, searchResults, isLoading, error, clearSearchResults } = useUserStore();
  const { user } = useAuthStore();
  const { 
    connectionStatus, 
    pendingRequests, 
    sendRequest, 
    getConnectionRequests,
    setupRealtimeSubscription,
    removeRealtimeSubscription
  } = useConnectionStore();
  
  // Local state for connection requests
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const [connectLoading, setConnectLoading] = useState<{[key: string]: boolean}>({});
  
  // Local state for search query
  const [searchQuery, setSearchQuery] = useState('');

  // Setup real-time subscriptions and fetch connection requests when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        setupRealtimeSubscription(user.id);
        getConnectionRequests(user.id);
      }
      
      return () => {
        clearSearchResults();
        removeRealtimeSubscription();
      };
    }, [user?.id, clearSearchResults, setupRealtimeSubscription, getConnectionRequests, removeRealtimeSubscription])
  );

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchUsers(query);
    } else {
      clearSearchResults();
    }
  };

  // Handle connect button press
  const handleConnect = async (userId: string) => {
    if (!user?.id) return;
    
    setConnectLoading(prev => ({ ...prev, [userId]: true }));
    
    const success = await sendRequest(userId);
    
    setConnectLoading(prev => ({ ...prev, [userId]: false }));
    
    if (success) {
      // Refresh search results to show updated status
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }
  };
  
  // Handle showing connection request modal
  const handleShowRequestModal = (request: ConnectionRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };
  
  // Check if there's a pending request between users
  const getPendingRequestStatus = (otherUserId: string): 'incoming' | 'outgoing' | null => {
    if (!pendingRequests || pendingRequests.length === 0) return null;
    
    const request = pendingRequests.find(req => 
      (req.from_user === user?.id && req.to_user === otherUserId) || 
      (req.from_user === otherUserId && req.to_user === user?.id)
    );
    
    if (!request) return null;
    
    return request.from_user === user?.id ? 'outgoing' : 'incoming';
  };

  // Handle view chat button press
  const handleViewChat = (userId: string) => {
    navigation.navigate('Chat', { userId, username: 'User' });
    // Note: In a real implementation, we would get the username from the user object
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (searchQuery && !isLoading && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../../assets/images/no-results.png')} 
            style={styles.emptyImage}
          />
          <OttrText variant="h3" style={styles.emptyText}>
            No users found
          </OttrText>
          <OttrText variant="bodySmall" color={theme.colors.textSecondary} style={styles.emptySubtext}>
            Try a different username
          </OttrText>
        </View>
      );
    }

    if (!searchQuery) {
      return (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../../assets/images/search.png')} 
            style={styles.emptyImage}
          />
          <OttrText variant="h3" style={styles.emptyText}>
            Find your friends
          </OttrText>
          <OttrText variant="bodySmall" color={theme.colors.textSecondary} style={styles.emptySubtext}>
            Start typing to search by username
          </OttrText>
        </View>
      );
    }

    return null;
  };

  // Render user item
  const renderUserItem = ({ item }: { item: User }) => {
    // Check if there's a pending request
    const requestStatus = getPendingRequestStatus(item.id);
    
    return (
      <UserCard
        user={item}
        currentUserId={user?.id || ''}
        onConnect={handleConnect}
        onViewChat={handleViewChat}
        requestStatus={requestStatus}
        isConnectLoading={!!connectLoading[item.id]}
        connectionStatus={connectionStatus}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <OttrText variant="h1">Search</OttrText>
      </View>
      
      {/* Search Input */}
      <UserSearchInput
        onSearch={handleSearch}
        isLoading={isLoading}
        placeholder="Search by username..."
      />
      
      {/* Error Message */}
      {error && (
        <OttrText
          variant="caption"
          color={theme.colors.error}
          style={styles.errorText}
        >
          {error}
        </OttrText>
      )}
      
      {/* Results List */}
      <FlatList
        data={searchResults}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
      
      {/* Connection Request Modal */}
      <ConnectionRequestModal
        visible={showRequestModal}
        request={selectedRequest}
        onClose={() => setShowRequestModal(false)}
        onRequestHandled={() => {
          setShowRequestModal(false);
          if (user?.id) {
            getConnectionRequests(user.id);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.l,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.l,
    tintColor: theme.colors.primary,
    opacity: 0.8,
  },
  emptyText: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
  errorText: {
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
});

export default SearchScreen;
