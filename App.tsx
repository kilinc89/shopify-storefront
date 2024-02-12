/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  TouchableOpacity,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Client from 'shopify-buy';
import {
  StripeProvider,
  CardField,
  useStripe,
} from '@stripe/stripe-react-native';
import ApplePayScreen from './ApplePayScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

export function PaymentScreen() {
  const {createToken} = useStripe();

  const handlePayment = async () => {
    // Create a token for the entered card details
    const {token, error} = await createToken({
      type: 'Card',
    });

    if (error) {
      console.log('Error creating token:', error);
    } else {
      console.log('Created token:', token);
      // You can now use this token to process the payment on your server
    }
  };

  return (
    <>
      <CardField
        postalCodeEnabled={true}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={{
          width: '100%',
          height: 50,
          marginVertical: 30,
        }}
        onCardChange={cardDetails => {
          console.log('cardDetails', cardDetails);
        }}
        onFocus={focusedField => {
          console.log('focusField', focusedField);
        }}
      />
      <Button onPress={handlePayment} title="Pay" />
    </>
  );
}

const client = Client.buildClient({
  domain: 'testibrahim123.myshopify.com',
  storefrontAccessToken: 'f68245ee74abefd669716e7f2ea8b64d',
});

async function fetchAllProducts() {
  return client.collection.fetchAll();
}

async function fetchCollections() {
  return client.product.fetchAll();
}

async function createCheckout() {
  return client.checkout.create();
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [products, setProducts] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      fetchAllProducts()
        .then(products => {
          console.log(1111, products);
        })
        .catch(error => {
          console.log(222222, error);
        });
    }, 1000);

    setTimeout(() => {
      fetchCollections()
        .then(products => {
          setProducts([...products]);
        })
        .catch(error => {
          console.log(222222, error);
        });
    }, 1500);

    setTimeout(() => {
      createCheckout()
        .then(checkout => {
          console.log(333, checkout);
          setCheckout(checkout.id);
        })
        .catch(error => {
          console.log(4444, error);
        });
    }, 2000);
  }, []);

  const onPress = product => {
    console.log('variantsId', checkout, product.variants[0].id);
    const lineItemsToAdd = [
      {
        variantId: product.variants[0].id,
        quantity: 1,
        customAttributes: [{key: 'MyKey', value: 'MyValue'}],
      },
    ];

    // Add an item to the checkout
    client.checkout.addLineItems(checkout, lineItemsToAdd).then(checkout => {
      // Do something with the updated checkout
      console.log(checkout); // Array with one additional line item
      setLineItems([...checkout.lineItems]);
    });
  };

  const pay = () => {
    console.log('pay');
    client.checkout.p;
  };

  return (
    <StripeProvider
      publishableKey="pk_test_yS8bTvvGQPxix2kipjOTCZXJ"
      merchantIdentifier="merchant.com.phenology.applepay" // required for Apple Pay
      // urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}>
          <View
            style={{
              backgroundColor: isDarkMode ? Colors.black : Colors.white,
            }}>
            <Section title="Cart Items" />
            {lineItems?.length > 0 &&
              lineItems.map((lineItem, index) => {
                return (
                  <View key={index} style={{marginTop: 24}}>
                    <Text style={{fontWeight: '700', textAlign: 'center'}}>
                      {lineItem.title}----------{lineItem.quantity}
                    </Text>
                  </View>
                );
              })}

            <PaymentScreen />

            <Section title="Products" />

            <View style={{flexDirection: 'column', alignItems: 'center'}}>
              {products?.length > 0 &&
                products.map((product, index) => {
                  return (
                    <View key={index} style={{marginTop: 24}}>
                      <TouchableOpacity
                        onPress={() => {
                          onPress(product);
                        }}>
                        <Text style={{fontWeight: '700', textAlign: 'center'}}>
                          {product.title}
                        </Text>
                        <Image
                          style={{width: 200, height: 200}}
                          source={{uri: product.images[0].src}}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          </View>
          <ApplePayScreen />
        </ScrollView>
      </SafeAreaView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
