import React, {PropTypes} from 'react';
import { Provider } from 'react-redux';
import { RouterContext, Router } from 'react-router';
import { hooks, register } from 'universal-redux/lib/hooks';

register(hooks.client.GENERATE_ROOT_COMPONENT, ({ store, routes, history, devComponent }) => {
  console.log("Generating on client");
  const root = (
    <Provider store={store} key="provider">
      <div>
        <Router history={history} render={(props) => <AsyncDataLoader {...props} /> }>
          {routes}
        </Router>
        {devComponent}
      </div>
    </Provider>
  );
  return { root };
});

register(hooks.server.GENERATE_ROOT_COMPONENT, ({ store, renderProps }) => {
  console.log("Generating on server");
  const root = (
    <Provider store={store} key="provider">
      <div>
        <RouterContext {...renderProps} />
      </div>
    </Provider>
  );
  return Promise.all(loadAsync(store, renderProps.components))
    .then(() => ({ root }));
});

class AsyncDataLoader extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  static propTypes = {
    components: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    const {location} = this.props;
    const {location: nextLocation} = nextProps;

    if((location.pathname !== nextLocation.pathname) || (location.search !== nextLocation.search)){
      loadAsync(this.context.store, nextProps.components);
    }
  }

  render() {
    return <RouterContext {...this.props} />
  }
}

function loadAsync(store, components){
  return flattenComponents(components)
    .filter((Component) => typeof(Component.load) === "function")
    .map((Component) => Component.load(store.getState(), store.dispatch));
}

function flattenComponents(components) {
  const flattenedComponents = [];
  components.forEach((component) => {
    if (typeof component === 'object') {
      for (var key in component) {
        flattenedComponents.push(component[key]);
      }
    } else {
      flattenedComponents.push(component);
    }
  });
  return flattenedComponents;
}