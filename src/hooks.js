import React, {PropTypes} from 'react';
import { RouterContext } from 'react-router';
import { hooks, environments, positions, register } from 'universal-redux/lib/hooks';

register(hooks.CREATE_ROOT_COMPONENT, (data) => {
  return {
    ...data,
    render: (props) => <AsyncDataLoader {...props} />
  };
}, {
  position: positions.BEFORE,
  environments: [
    environments.CLIENT
  ]
});

register(hooks.CREATE_ROOT_COMPONENT, (promise, { store, renderProps }) => {
  return Promise.all(loadAsync(store, renderProps.components))
    .then(() => promise);
}, {
  position: positions.AFTER,
  environments: [
    environments.SERVER
  ]
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