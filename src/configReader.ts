import { readFile as RF } from 'node:fs';
import { promisify } from "node:util"
import { ClassContentType, configType, GeneralClassType } from './types/GeneralClassType';
const readFile = promisify(RF);

export const getConfig = async (configFileName: string = "BlackSquareUI.json") => JSON.parse(await readFile(configFileName, 'utf-8'));

export const getBuildConfig = async (): Promise<ClassContentType> => {
    const { content } = await getConfig();
    return { ...content };
};

export const getProps = async (): Promise<GeneralClassType[]> => {
    const { props } = await getConfig();
    return props;
};
export const fakeConfig = (): configType => { return { content: { "sourceDir": "src/test_src", "fileExtension": "txt", "outputFile": "./assets/css/index.css" }, settings: { "unit": "rem" }, props: [{ "name": "margin", "type": "range", "property": "margin", "direction": ["", "-top", "-right", "-bottom", "-left"], "val": 1, "min": 0, "max": 3, "step": 0.1 }, { "name": "padding", "type": "range", "property": "padding", "direction": ["", "-top", "-right", "-bottom", "-left"], "val": 1, "min": 0, "max": 3, "step": 0.1 }, { "name": "border-width", "type": "range", "property": "border-width", "direction": [""], "val": 0.1, "min": 0, "max": 1, "step": 0.01 }, { "name": "border-radius", "type": "range", "property": "border-radius", "direction": [""], "val": 0.1, "min": 0, "max": 3, "step": 0.01 }, { "name": "background-color-primary", "type": "color", "property": "background-color", "val": "black" }, { "name": "background-color-success", "type": "color", "property": "background-color", "val": "blue" }, { "name": "background-color-danger", "type": "color", "property": "background-color", "val": "red" }, { "name": "border-color", "type": "color", "property": "border-color", "val": "black" }, { "name": "text-color-primary", "type": "color", "property": "color", "val": "black" }, { "name": "text-color-success", "type": "color", "property": "color", "val": "blue" }, { "name": "text-color-danger", "type": "color", "property": "color", "val": "red" }] } };
export const exportedForTesting = {
    getConfig
}