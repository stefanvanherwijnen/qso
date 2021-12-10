import urql from '@urql/vue';

export default ({ app }) => {
  app.use(urql, {
    url: 'http://localhost:3030/graphql',
  })
}