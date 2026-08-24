import { typescriptBaseConfig } from "@planning-poker/config/eslint/base";

export default [...typescriptBaseConfig, { ignores: ["dist/**"] }];
