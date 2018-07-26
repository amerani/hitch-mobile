import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { FlatList, View, Text, StyleSheet } from 'react-native';

const searchQuery = gql`
    query {
        trips(skip: 0, take:10) {
            id
            createdBy {
                userName
            }
            legs {
                origin { city }
                destination { city }
                arrival
                departure
            }
        }
    }
`

const tripSubscription = gql`
    subscription {
        tripCreated {
            id
            createdBy {
                userName
            }
            legs {
                origin { city }
                destination { city }
                arrival
                departure
            }
        }
    }
`

const subscription = {
    document: tripSubscription,
    updateQuery: (prev, { subscriptionData }) => {
        if(!subscriptionData.data) return prev;

        const newTrip = subscriptionData.data.tripCreated;
        newTrip.isNew = true;
        const trips = [newTrip, ...prev.trips];
        return { trips };
    }
}

// const SearchItem = (props) => {
//     const { item: trip } = props;
//     return <View style={styles.search} key={trip.id}>
//         <Text>{trip.id}</Text>
//         <Text>{trip.createdBy.userName}</Text>
//         <Text>{trip.legs[0].origin.city}</Text>
//         <Text>{trip.legs[0].destination.city}</Text>
//     </View>
// }

class SearchItem extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            ...props
        }
    }
    render() {
        const { item: trip } = this.props;
        const searchStyle = {
            padding: 20,
            borderColor: "lightgray",
            borderWidth: 1,
            fontSize: 24,
            backgroundColor: this.state.item.isNew ? "lightblue": "white"
        }
        if(this.state.item.isNew) {
            setTimeout(() => {
                const newItem = this.state.item;
                newItem.isNew = false;
                this.setState({item: newItem})
            }, 500);
        }
        return (
            <View style={searchStyle} key={trip.id}>
                <Text>{trip.createdBy.userName} is going from {trip.legs[0].origin.city} to {trip.legs[0].destination.city}</Text>
            </View>
        )
    }
}

class SearchPage extends React.Component{
    componentDidMount() {
        this.props.subscribeToNewTrips();
    }
    mapTrips(trip) {
        return trip;
        // if(trip.isNew) {
        //     return trip
        // }
        // return {isNew: false, ...trip}
    }
    render() {
        const { loading, data, error, client } = this.props;
        return (
            <>
                {loading
                    ? <Text>Loading</Text>
                    : <FlatList
                        data={data.trips.map(this.mapTrips)}
                        renderItem={({item}) => <SearchItem client={client} item={item} />}
                        keyExtractor={(item) => item.id}
                    />
                }
                {error && alert(error)}
            </>
            )
    }
}

export class SearchScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Query query={searchQuery} fetchPolicy="network-only">
                {({ subscribeToMore, ...result}) =>
                    <SearchPage
                        {...result}
                        subscribeToNewTrips={() =>
                            subscribeToMore(subscription)
                        }
                    />
                }
            </Query>
        )
    }
}

const styles = StyleSheet.create({
    search: {
      padding: 20,
      borderColor: "lightgray",
      borderWidth: 1,
      fontSize: 24
    },
})