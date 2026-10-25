// react-native-svg web shim — maps primitives to real SVG DOM elements
import React from 'react';

// Filter out RN-specific props that aren't valid SVG/DOM attributes
function clean(props) {
  const { fillRule, clipRule, stopColor, stopOpacity, ...rest } = props;
  const out = { ...rest };
  if (fillRule) out['fill-rule'] = fillRule;
  if (clipRule) out['clip-rule'] = clipRule;
  if (stopColor) out['stop-color'] = stopColor;
  if (stopOpacity !== undefined) out['stop-opacity'] = stopOpacity;
  return out;
}

export const Svg = ({ children, ...props }) => React.createElement('svg', clean(props), children);
export const Path = (props) => React.createElement('path', clean(props));
export const Circle = (props) => React.createElement('circle', clean(props));
export const Ellipse = (props) => React.createElement('ellipse', clean(props));
export const Rect = (props) => React.createElement('rect', clean(props));
export const Line = (props) => React.createElement('line', clean(props));
export const Polyline = (props) => React.createElement('polyline', clean(props));
export const Polygon = (props) => React.createElement('polygon', clean(props));
export const G = ({ children, ...props }) => React.createElement('g', clean(props), children);
export const Text = ({ children, ...props }) => React.createElement('text', clean(props), children);
export const TSpan = ({ children, ...props }) => React.createElement('tspan', clean(props), children);
export const TextPath = ({ children, ...props }) => React.createElement('textPath', clean(props), children);
export const Defs = ({ children }) => React.createElement('defs', {}, children);
export const Use = (props) => React.createElement('use', clean(props));
export const Symbol = ({ children, ...props }) => React.createElement('symbol', clean(props), children);
export const LinearGradient = ({ children, ...props }) => React.createElement('linearGradient', clean(props), children);
export const RadialGradient = ({ children, ...props }) => React.createElement('radialGradient', clean(props), children);
export const Stop = (props) => React.createElement('stop', clean(props));
export const ClipPath = ({ children, ...props }) => React.createElement('clipPath', clean(props), children);
export const Pattern = ({ children, ...props }) => React.createElement('pattern', clean(props), children);
export const Mask = ({ children, ...props }) => React.createElement('mask', clean(props), children);
export const Image = (props) => React.createElement('image', clean(props));
export const ForeignObject = ({ children, ...props }) => React.createElement('foreignObject', clean(props), children);

export const SvgUri = ({ uri, width, height, style, ...props }) => {
  const flattenedStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style || {});
  return React.createElement('img', {
    src: uri,
    width,
    height,
    style: {
      width,
      height,
      objectFit: 'contain',
      ...flattenedStyle,
    },
    ...clean(props),
  });
};

export const SvgXml = ({ xml, width, height, style, ...props }) => {
  const flattenedStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style || {});
  return React.createElement('div', {
    style: {
      width,
      height,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...flattenedStyle,
    },
    dangerouslySetInnerHTML: { __html: xml },
    ...clean(props),
  });
};

const components = {
  Svg, Path, Circle, Ellipse, Rect, Line, Polyline, Polygon,
  G, Text, TSpan, TextPath, Defs, Use, Symbol,
  LinearGradient, RadialGradient, Stop,
  ClipPath, Pattern, Mask, Image, ForeignObject,
  SvgUri, SvgXml,
};

Object.assign(Svg, components);

export default Svg;
