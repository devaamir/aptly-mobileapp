const template = (variables, { tpl }) => tpl`
${variables.imports};

const ${variables.componentName} = ({ width, height, ...props }) => (
  ${variables.jsx}
);

${variables.exports};
`;

module.exports = template;
