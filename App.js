import React from 'react';
import { AppRegistry, View, Text } from 'react-native';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from 'apollo-link-ws';
import { SearchScreen } from "./SearchScreen";
import { getMainDefinition } from 'apollo-utilities';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { withClientState } from 'apollo-link-state';

const RootStack = createBottomTabNavigator(
  {
    Search: createStackNavigator(
      { SearchScreen },
      {
        navigationOptions: () => ({
          title: "Search"
        })
      }
    ),
    MyTrips: createStackNavigator(
      { SearchScreen },
      {
        navigationOptions: () => ({
          title: "My Trips"
        })
      }
    )
  },
  {
    initialRouteName: "Search",
    navigationOptions: ({ navigation, focused }) => ({
      tabBarOptions: {
        labelStyle: {
          fontSize: 16,
          bottom: 12
        }
      },
      title: "Search Trips",
      tabBarLabel: ({ focused, tintColor }) => {
        return (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
              backgroundColor: focused ? "royalblue" : "transparent"
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: focused ? "800" : "100",
                color: focused ? "white" : "black"
              }}
            >
              {navigation.state.routeName}
            </Text>
          </View>
        )
      }
    })
  }
)

const API_URL = 'http://localhost:8080/graphql';

const WS_URL = 'ws://localhost:8080/subscriptions';

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  // resolvers: {
  //   Trip: {
  //     isNew: () => false
  //   }
  // },
  defaults: {
    trip: {
      __typename: 'Trip',
      isNew: false,
    }
  }
})

const httpLink = new HttpLink({ uri: API_URL });

  const wsClient = new SubscriptionClient(WS_URL, {
      reconnect: true
  });

  const wsLink = new WebSocketLink(wsClient);

  const link = ApolloLink.split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink,
    );

  const client = new ApolloClient({
      link: ApolloLink.from([link, stateLink]),
      cache,
      connectToDevTools: true
  })

export default App = () =>
  <ApolloProvider client={client}>
    <RootStack />
  </ApolloProvider>

AppRegistry.registerComponent('MyApplication', () => App);