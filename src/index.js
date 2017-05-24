export connect from './connect';
import React, {PropTypes} from 'react';
import { RouterContext } from 'react-router';
import { hooks, environments, positions, register } from 'universal-redux';

register(hooks.CREATE_ROOT_COMPONENT, (data) => {
  return {
    ...data,
    render: (props) => <AsyncDataLoader clientOnly={data.clientOnly} {...props} />
  };
}, {
  position: positions.BEFORE,
  environments: [
    environments.CLIENT
  ]
});

register(hooks.CREATE_ROOT_COMPONENT, (promise, { store, renderProps }) => {
  return Promise.resolve()
    .then(() => Promise.all(loadAsync(store, renderProps.components, null, renderProps.params, null)))
    .then(() => promise, (err) => {
      console.error(err);
      return promise;
    });
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
    location: PropTypes.object.isRequired,
    clientOnly: PropTypes.bool.isRequired
  };

  constructor(props, context){
    super(props, context);
  }

  componentWillMount(){
    if(this.props.clientOnly){
      loadAsync(this.context.store, this.props.components, null, this.props.params, null);
    }
  }

  componentWillReceiveProps(newProps) {
    this.maybeLoadAsync(this.props, newProps);
  }

  componentDidUpdate(prevProps) {
    this.maybeLoadAsync(prevProps, this.props)
  }

  maybeLoadAsync(prevProps, newProps){
    const {location} = prevProps;
    const {location: nextLocation} = newProps;

    if((location.pathname !== nextLocation.pathname) || (location.search !== nextLocation.search)) {
      loadAsync(this.context.store, newProps.components, prevProps.components, newProps.params, prevProps.params);
    }
  }

  render() {
    return <RouterContext {...this.props} />
  }
}

function loadAsync(store, components, prevComponents, params, prevParams){
  return flattenComponents(components)
    .map((Component, i) => {
      if(!Component || typeof(Component.load) !== "function"){
        return null;
      }
      let prevComponentParams = (prevComponents != null && prevComponents[i] === Component) ? prevParams : null;
      return Component.load(store, params, prevComponentParams)
    })
    .filter(p => p !== null);
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

