import pkg from '../../package.json';
const name: string = pkg.name;
let pluginId = name;

if (name.startsWith('eslint-plugin-')) {
  pluginId = name.slice('eslint-plugin-'.length);
} else {
  const match = name.match(/^(@.+)\/eslint-plugin(?:-(.+))?$/);

  if (match) {
    if (match[2]) {
      pluginId = `${match[1]}/${match[2]}`;
    } else {
      pluginId = match[1];
    }
  }
}

export { pluginId };
