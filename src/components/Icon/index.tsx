import React from 'react';
import type { IconProps } from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const map = {
  more: require('./icons/more.svg').default,
  store: require('./icons/store.svg').default,
  configMap: require('./icons/configMap.svg').default,
  noApp: require('./icons/noApp.svg').default,
  podList: require('./icons/podList.svg').default,
  arrowLeft: require('./icons/arrowLeft.svg').default,
  plus: require('./icons/plus.svg').default,
  delete: require('./icons/delete.svg').default,
  statusicon: require('./icons/statusicon.svg').default,
  restart: require('./icons/restart.svg').default,
  sealos: require('./icons/sealos.svg').default
};

const MyIcon = ({
  name,
  w = 'auto',
  h = 'auto',
  ...props
}: { name: keyof typeof map } & IconProps) => {
  return map[name] ? (
    <Icon
      as={map[name]}
      boxSizing={'content-box'}
      verticalAlign={'top'}
      fill={'currentColor'}
      w={w}
      h={h}
      {...props}
    />
  ) : null;
};

export default MyIcon;
