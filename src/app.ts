import { ConfigClass } from "./ConfigClass";
import { BuildClass } from "./BuildClass";

const { getBuildConfig, getProps } = new ConfigClass();

const build = async ({ sourceDir, fileExtension, outputFile }) => {
    const buildClass = new BuildClass(sourceDir, fileExtension, await getProps(), outputFile)
    await buildClass.createCSSBundle()
}


export { build, getBuildConfig }