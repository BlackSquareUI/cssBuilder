
import { readFile as RF } from 'node:fs';
import { promisify } from "node:util"
const readFile = promisify(RF);

class ConfigClass {
    configFileName: string = "BlackSquareUI.json"
    config = null
    getConfig = async () => {
        this.config = JSON.parse(await readFile(this.configFileName, 'utf-8'))
        return this.config;
    }
    getBuildConfig = async () => {
        const { content } = this.config || await this.getConfig()
        return { ...content }
    }
    getProps = async () => {
        const { props } = this.config || await this.getConfig()
        return props
    }
}

export { ConfigClass }