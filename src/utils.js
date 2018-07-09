import { Role } from './_proto/uast_pb';

const reversedRoles = Object.keys(Role).reduce((acc, name) => {
  const newName = (
    name.charAt(0).toUpperCase() + name.substr(1).toLowerCase()
  ).replace(/_./g, match => {
    return match.charAt(1).toUpperCase();
  });

  return Object.assign(acc, { [Role[name]]: newName });
}, {});

export function roleToString(roleId) {
  return reversedRoles[roleId];
}
