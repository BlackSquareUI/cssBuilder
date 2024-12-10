import { readFile as rF, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { promisify } from "node:util"
import path from "node:path";
import { arrCount } from "./utils";
import { GeneralClassType } from "./types/GeneralClassType"
const readFile = promisify(rF)

export const createCSSBundle = async (sourceDir: string, fileExtension: string, props: GeneralClassType[], outputFile: string) => {
    const css = await createCSS(sourceDir, fileExtension, props);
    writeFileSync(`${sourceDir}/${outputFile}`, css)
}

export function* walkSync(dir: string) {
    const files = readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield path.join(dir, file.name);
        }
    }
}
export const readTextFromDir = async (dir: string, fileExtension: string) => {
    if (!existsSync(dir)) return ""

    let texts = ""

    for (const filePath of walkSync(dir)) {
        if (filePath.includes(fileExtension))
            texts += await readFile(filePath, 'utf-8')
    }

    return texts
}

export const extractStaticClasses = (className: string) => {
    if (!className) return []
    return className.split(" ");
};

export const collectClasses = async (text: string) => {
    const regex = /className=(?:"([^"]+)"|'([^']+)'|\{([^}]+)\})/g; // Create regex outside the function
    const matches = Array.from(text.matchAll(regex));
    return matches
        .map((match) => match.slice(1).find(Boolean))
        .filter(Boolean)
        .flatMap(extractStaticClasses);
}
export const createRootStyles = (classNames: string[], props: GeneralClassType[]): string => {
    const styles = classNames
        .filter(c => c.includes("oo"))
        .map((className: string) => {
            const classProps = props.find((cl) => cl.name === className.split("oo-")[1])
            if (!classProps) return

            return `--${className}: ${classProps.val}${classProps.type === "range" ? "rem" : ""};`;
        }).join("");

    return `:root{${styles}}`;
};

export const createRangeStyles = (className: string, props: GeneralClassType[]): string => {
    const [property, multiplier] = className.includes("_") ? className.split("_") : [className]
    const classProps = getPropByClassName(className, props);
    const pos = getDirectionFromClassName(property, props)

    if (!classProps || pos === false) return "";

    return `.${className} {${classProps.property}${pos}:calc(var(--oo-${classProps.name})${multiplier ? ` * ${multiplier}` : ""});}`;
};

export const createColorStyles = (className: string, props: GeneralClassType[]): string => {
    const { property, name } = getPropByClassName(className, props);
    return `.${className} {${property}:var(--oo-${name});}`;
};


export const createEEStyles = (className: string): string => {
    if (!className.includes("_")) return ""

    const [name, prop] = className.split("_");
    return `.${className}{${name.split("ee-")[1]}:${parseInt(prop) ? prop + "rem" : prop}}`;
};

export const getClassesByPrefix = (classNames: string[], prefix: string): string[] => classNames.filter(c => c.includes(prefix));

export const processEEClasses = (classNames: string[]): string => classNames.map(_class => createEEStyles(_class)).join("");

export const processOOClasses = (classNames: string[], props: GeneralClassType[]): string => classNames.reduce((acc, _class) => {
    const prop = getPropByClassName(_class, props);
    return acc + (prop.type === "range" ? createRangeStyles(_class, props) : createColorStyles(_class, props));
}, "");

export const createClassStyles = (classNames: string[], props: GeneralClassType[]): string =>
    processOOClasses(getClassesByPrefix(classNames, "oo"), props) + processEEClasses(getClassesByPrefix(classNames, "ee"));


export const createCSS = async (sourceDir: string, fileExtension: string, props: GeneralClassType[]) => {
    const allFilesContent: string = await readTextFromDir(sourceDir, fileExtension);
    const classNames = await collectClasses(allFilesContent);

    return createRootStyles(classNames, props) + createClassStyles(classNames, props);
};

export const removePrefix = (className: string): string => className.replace(/^ee-|oo-/, "");

export const getPropByClassName = (className: string, props: GeneralClassType[]) => props.find(cl => className.includes(cl.name));

export const getDirectionFromClassName = (className: string, props: GeneralClassType[]) => {
    const classNameWithoutPrefix = removePrefix(className)
    const classProps = getPropByClassName(classNameWithoutPrefix, props)
    const pos = classProps.direction.filter((dir: string) =>
        classProps.property + dir === classNameWithoutPrefix
    )
    return arrCount(pos) === 0 ? false : pos[0]
}

