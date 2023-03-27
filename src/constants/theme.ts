import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
  defineStyle,
  defineStyleConfig,
  extendTheme
} from '@chakra-ui/react';

const Button = defineStyleConfig({
  baseStyle: {
    _active: {
      transform: 'scale(0.98)'
    }
  },
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
    base: {
      backgroundColor: '#EAEEF1',
      color: '#54585C',
      px: 6,
      py: 1,
      _hover: {
        filter: 'brightness(95%)'
      },
      _disabled: {
        backgroundColor: 'gray.300 !important'
      }
    }
  },
  defaultProps: {
    size: 'md',
    colorScheme: 'blue'
  }
});

const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {}
  },
  variants: {
    outline: {
      field: {
        backgroundColor: 'transparent',
        border: '1px solid',
        borderColor: 'gray.300',
        _focus: {
          backgroundColor: 'transparent',
          borderColor: 'blue.500'
        }
      }
    }
  },
  defaultProps: {
    size: 'md',
    variant: 'outline'
  }
};

const Tooltip = defineStyleConfig({
  baseStyle: {
    backgroundColor: 'white',
    color: 'blackAlpha.800',
    borderRadius: 'sm',
    boxShadow: '1px 1px 7px rgba(0,0,0,0.2)'
  }
});

export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        color: 'blackAlpha.800',
        fontSize: 'md',
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
  colors: {
    divider: {
      100: '#E5E7E9'
    }
  },
  borders: {
    base: '1px solid #E5E7E9',
    md: '1px solid #DDE3E8'
  },
  components: {
    Button,
    Input,
    Tooltip
  }
});
