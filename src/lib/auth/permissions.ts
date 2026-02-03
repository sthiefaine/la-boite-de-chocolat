import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

export const developerRole = ac.newRole({
  ...adminAc.statements,
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
});

export const moderatorRole = ac.newRole({
  ...adminAc.statements,
});

export { ac };
