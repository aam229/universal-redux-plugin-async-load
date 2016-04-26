import React, { Component } from 'react';

export default (loader) => (Container) => {

  return class AsyncConnect extends Component {
    static load = (...args) => {
      return loader(...args);
    };

    render(){
      return <Container {...this.props} />
    }
  }
}