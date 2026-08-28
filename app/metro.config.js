// Autorise l'app à importer shared/ (racine du repo), qui contient les types
// et libellés de sujets partagés avec functions/. Pattern standard Expo pour
// consommer un dossier frère hors du projet sans vrai monorepo/workspaces.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = config;
