import React, { useState } from 'react';
import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Box
} from '@chakra-ui/react';

const MyRangeSlider = ({
  value,
  max = 100,
  min = 0,
  step = 1,
  setVal
}: {
  value: [number, number];
  setVal: (index: [number, number]) => void;
  max?: number;
  min?: number;
  step?: number;
}) => {
  const startEndPointStyle = {
    content: '""',
    borderRadius: '10px',
    width: '10px',
    height: '10px',
    backgroundColor: '#ffffff',
    border: '2px solid #D7DBE2',
    position: 'absolute',
    zIndex: 1,
    top: 0,
    transform: 'translateY(-3px)'
  };

  const startEndValStyle = {
    position: 'absolute' as const,
    top: '10px'
  };

  return (
    <RangeSlider
      // eslint-disable-next-line jsx-a11y/aria-proptypes
      aria-label={['min', 'max']}
      value={value}
      min={min}
      max={max}
      size={'lg'}
      step={step}
      minStepsBetweenThumbs={1}
      onChange={setVal}
    >
      <RangeSliderTrack
        bg={'#EAEDF3'}
        overflow={'visible'}
        h={'4px'}
        _before={{
          ...startEndPointStyle,
          left: '-5px'
        }}
        _after={{
          ...startEndPointStyle,
          right: '-5px'
        }}
      >
        <Box {...startEndValStyle} left={0} transform={'translateX(-50%)'}>
          {min}
        </Box>
        <Box {...startEndValStyle} right={0} transform={'translateX(50%)'}>
          {max}
        </Box>
        <RangeSliderFilledTrack />
      </RangeSliderTrack>
      <RangeSliderThumb index={0} border={'2.5px solid'} borderColor={'blue.500'}>
        <Box transform={'translateY(18px)'}>{value[0] === min ? '' : value[0]}</Box>
      </RangeSliderThumb>
      <RangeSliderThumb index={1} border={'2.5px solid'} borderColor={'blue.500'}>
        <Box transform={'translateY(18px)'}>{value[1] === max ? '' : value[1]}</Box>
      </RangeSliderThumb>
    </RangeSlider>
  );
};

export default MyRangeSlider;
