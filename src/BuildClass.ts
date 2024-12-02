


import { walk } from "@root/walk";
import { readFile as rF, writeFile, readdir as rD } from 'node:fs';
import { promisify } from "node:util"
const readFile = promisify(rF)
const readDir = promisify(rD)

class BuildClass {

    constructor(public sourceDir: string,
        public fileExtension: string,
        public props: any,
        public outputFile: string
    ) { }
    createCSSBundle = async () => {
        const css = await this.createCSS()
        writeFile(`${this.sourceDir}/${this.outputFile}`, css, (e) => {
            if (e) console.log(e)
        });

    }
    readTextFromDir = async (dir) => {
        if (!await this.isPathValid((dir))) {
            return
        }
            console.log(dir)
        let texts = ""
        await walk(dir, async (err, pathname, dirent) => {
            if (err) {
                throw err;
            }
            if (!dirent.name.includes(this.fileExtension)) return

            texts += await readFile(dirent.path + "/" + dirent.name, 'utf-8')
        })
        return texts
    }
    collectTextFromFiles = async (sourceDir = []) =>
        await Promise.all(
            sourceDir.map(async (sd) => {
                return await this.readTextFromDir(sd)
            })
        )

    isPathValid = async (path) => {
        try {
            await readDir(path);
            return true;
        } catch (error) {
            return false;
        }
    }
    collectClasses = async (text) => {

        let classNames = []
        let classNameRegex = /className=(?:"([^"]+)"|'([^']+)'|\{([^}]+)\})/g;


        let match;
        while ((match = classNameRegex.exec(text)) !== null) {
            const [staticQuoted, singleQuoted, dynamic] = match.slice(1);

            if (staticQuoted || singleQuoted) {
                const classes = (staticQuoted || singleQuoted).split(" ");
                classes.filter(i => i != "").forEach((cls) => cls && classNames.push(cls));
            } else if (dynamic) {
                const dynamicClasses = dynamic.match(/[`"'']([^"`'']+)[`"'']|[a-zA-Z0-9_-]+/g);
                dynamicClasses?.forEach((cls) => {
                    cls.replace(/[`"']/g, "").split(" ").filter(i => i != "").forEach((name, i) => {
                        classNames.push(name)
                    });
                });
            }
        }
        classNames = classNames.filter((value, index, array) =>
            array.indexOf(value) === index
        )
        return classNames
    }
    createCSS = async () => {
        const allTexts = await this.collectTextFromFiles([this.sourceDir, 'node_modules/blacksquareui.themebuilder/lib/components'])
        const classNames = await this.collectClasses(allTexts)
        let styles = ""

        styles += ":root{"

        classNames.filter(c => c.includes("oo")).map(_class => {

            const classProps = this.props.find((cl) => cl.name === _class.split("oo-")[1])
            if (classProps)
                switch (classProps.type) {
                    case "range":
                        styles += `--${_class}: ${classProps.val}rem;`
                        break
                    case "color":
                        styles += `--${_class}: ${classProps.val};`
                        break
                }
        })
        styles += "}"

        classNames.filter(c => c.includes("oo")).map(_class => {
            const classProps = this.props.find((cl) => cl.name === _class.split("oo-")[1])
            if (classProps)
                styles += `.${_class} { ${classProps.property}:var(--${_class});}`
        })
        classNames.filter(c => c.includes("ee")).map(_class => {

            if (_class.includes("_")) {
                let [_name, _prop] = _class.split("_")
                styles += `.${_class}{${_name.split("ee-")[1]}:${parseInt(_prop) ? _prop + "rem" : _prop}}`
            }
        })
        return styles
    }

}
export { BuildClass }