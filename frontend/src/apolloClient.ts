import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const link = createHttpLink({
  uri: "http://127.0.0.1:8000/graphql/",
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
});

export default client;
