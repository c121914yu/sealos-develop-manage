import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
  defineStyle,
  defineStyleConfig,
  extendTheme
} from '@chakra-ui/react';

export const theme = extendTheme({
  styles: {
    global: {
      html: {
        fontSize: 'md'
      }
    }
  },
  fontSizes: {
    sm: '12px',
    base: '12px',
    md: '14px',
    lg: '16px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '22px'
  }
});
