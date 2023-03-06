import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
  defineStyle,
  defineStyleConfig,
  extendTheme
} from '@chakra-ui/react';

// 按键
const Button = defineStyleConfig({
  baseStyle: {},
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 3,
      py: 0,
      fontWeight: 'normal',
      height: '26px',
      borderRadius: '2px'
    },
    md: {
      fontSize: 'md',
      px: 6,
      py: 0,
      height: '34px',
      fontWeight: 'normal',
      borderRadius: '4px'
    },
    lg: {
      fontSize: 'lg',
      px: 8,
      py: 0,
      height: '42px',
      fontWeight: 'normal',
      borderRadius: '8px'
    }
  },
  variants: {
    outline: {
      borderWidth: '1.5px'
    }
  },
  defaultProps: {
    size: 'md',
    colorScheme: 'blue'
  }
});

export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        color: 'blackAlpha.800',
        fontSize: 'md',
        fontFamily:
          'Söhne,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,Helvetica Neue,Arial,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        height: '100%',
        overflowY: 'auto'
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
  },
  components: {
    Button
  }
});
