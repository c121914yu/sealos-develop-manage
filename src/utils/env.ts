export const getSealosDomain = () =>
  location.hostname.includes('sealos') ? location.hostname : 'cloud.sealos.io';
