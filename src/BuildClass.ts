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
    readTextFromDir = async (dir: string) => {
        if (!await this.isPathValid((dir))) {
            return
        }
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
    collectTextFromFiles = async (sourceDir = []): Promise<string> =>
        (await Promise.all(
            sourceDir.map(async (sd) => {
                return await this.readTextFromDir(sd)
            })
        )).join("")

    isPathValid = async (path: string) => {
        try {
            await readDir(path);
            return true;
        } catch (error) {
            return false;
        }
    }
    collectClasses = async (text: string) => {

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
        const allTexts: string = await this.collectTextFromFiles([this.sourceDir, 'node_modules/@blacksquareui/themebuilder/dist/lib/components'])
        const classNames = await this.collectClasses(allTexts)
        let styles = ""

        styles += ":root{"

        classNames.filter(c => c.includes("oo")).map(_class => {
            const classProps = this.props.find((cl) => cl.name === _class.split("oo-")[1])
            if (classProps) {
                styles += `--${_class}: ${classProps.val}${classProps.type == "range" ? "rem" : ""};`
            }
        })
        styles += "}"

        classNames
            .filter(c => c.includes("oo"))
            .map(_class => {
                const [property, multiplier] = _class.split("_")
                // FROM .oo-margin-left_2 TO .oo-margin-left-2 { .margin-left:calc(var(--oo-margin)*2) }

                const classProps = this.getPropByClassName(_class);
                // if ()
                // console.log(this.getPosFromClassName(_class))
                if (!classProps) return

                switch (classProps.type) {
                    case "range":
                        classProps.direction.map(pos => {
                            styles += `.${property}${pos}${multiplier ? `_${multiplier}` : ""} {${classProps.property}${this.getPosFromClassName(property)}:calc(var(--oo-${this.getPropByClassName(property).name})${multiplier ? ` * ${multiplier}` : ""});}`
                        })
                        break;
                    case "color":
                        styles += `.${property} { ${classProps.property}:var(--${property});}`
                        break;
                }
            })

        classNames.filter(c => c.includes("ee")).map(_class => {

            if (_class.includes("_")) {
                let [_name, _prop] = _class.split("_")
                styles += `.${_class}{${_name.split("ee-")[1]}:${parseInt(_prop) ? _prop + "rem" : _prop}}`
            }
        })
        return styles
    }
    getPropByClassName(className: string) {
        className = className.replace("ee-", "").replace("oo-", "").split("_")[0]
        let dirs = ["-left", "-right", "-top", "-bottom"]
        let prop = dirs.map(d => className.replace(d, ''))[0]
        return this.props.find(cl => cl.name === prop)
    }
    getPosFromClassName(className: string) {
        const { direction, property } = this.getPropByClassName(className)

        return direction?.filter(dir => {
            return property + dir === className
        })[0] || ""
    }
}
export { BuildClass }