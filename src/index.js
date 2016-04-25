import { environments } from 'universal-redux/lib/hooks';

import registerHooks from './hooks';
export connect from './connect';


export const config = {
  environments: [
    environments.CLIENT,
    environments.SERVER,
    environments.DEVELOPMENT,
    environments.PRODUCTION,
  ]
};

