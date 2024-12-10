import { createCSS, extractStaticClasses, collectClasses, createColorStyles, createRootStyles, createClassStyles, removePrefix, getPropByClassName, getDirectionFromClassName, createCSSBundle, readTextFromDir, walkSync, createRangeStyles, createEEStyles, getClassesByPrefix, processOOClasses } from '../src/styleProcessor';
import fs, { existsSync, writeFileSync } from 'node:fs';
import {
    describe, test, expect, beforeAll, jest, afterAll, beforeEach, afterEach
} from '@jest/globals';
import { fakeConfig } from '../src/configReader';
import path from 'node:path';

const config = fakeConfig()

describe('collectClasses', () => {
    test('collectClasses should return an array of unique class names', async () => {
        const text = '<div className="oo-margin oo-padding-top ee-margin-top_2">...</div>';
        const classNames = await collectClasses(text);
        expect(classNames).toEqual(['oo-margin', 'oo-padding-top', 'ee-margin-top_2']);
    });
})

describe('createRootStyles', () => {
    test('createRootStyles should generate CSS variables for root element', () => {
        const classNames = ['oo-margin', 'oo-text-color-primary', 'oo-padding-top'];
        const styles = createRootStyles(classNames, config.props);
        expect(styles).toContain(`:root{--oo-margin: 1rem;--oo-text-color-primary: black;}`);
    });
})

describe('getPropByClassName', () => {
    test('getPropByClassName should return property object based on class name', () => {
        const className = 'oo-margin-top';
        const prop = getPropByClassName(className, config.props);
        let marginProp = config.props.find(i => i.name === "margin")
        expect(prop).toEqual(marginProp);
    });
})
describe('processOOClasses', () => {
    test('processOOClasses should process classes correctly', () => {
        const classNames = ['oo-margin', 'oo-text-color-primary'];
        const expected = createRangeStyles('oo-margin', config.props) + createColorStyles('oo-text-color-primary', config.props)
        expect(processOOClasses(classNames, config.props)).toBe(expected);
    });
})
describe('createRangeStyles', () => {
    test('should return css class', () => {
        expect(createRangeStyles('ee-margin-top_2', config.props)).toBe('.ee-margin-top_2 {margin-top:calc(var(--oo-margin) * 2);}');
    });
    test('should return empty string if class property not found in config.props', () => {
        expect(createRangeStyles('ee-margin-wrong', config.props)).toBe('');
    });
})

describe('createEEStyles', () => {
    test('should handle class names with underscores and numeric properties', () => {
        expect(createEEStyles('ee-padding_2')).toBe('.ee-padding_2{padding:2rem}');
        expect(createEEStyles('ee-margin_10')).toBe('.ee-margin_10{margin:10rem}');
        expect(createEEStyles('ee-margin')).toBe('');
        expect(createEEStyles('ee-border-style_solid')).toBe('.ee-border-style_solid{border-style:solid}');
    });
})
describe('getClassesByPrefix', () => {
    test("should return an empty array when classNames is empty", () => {
        expect(getClassesByPrefix([], "prefix")).toEqual([]);
    });

    test("should return class name  when classname contain the prefix", () => {
        expect(getClassesByPrefix(['ee-margin'], "ee")).toEqual(['ee-margin']);
    });

    test("should return empty array if classname doesnt contain the prefix", () => {
        expect(getClassesByPrefix(['oo-margin'], "ee")).toEqual([]);
    });
})
describe('getDirectionFromClassName', () => {
    test('should return position property based on class name', () => {
        const className = 'oo-padding-left';
        const pos = getDirectionFromClassName(className, config.props);
        expect(pos).toEqual('-left');
    });
    test('should return false if direcotion isnt found', () => {
        const className = 'oo-padding-ggg';
        const pos = getDirectionFromClassName(className, config.props);
        expect(pos).toEqual(false);
    });

    test('should return className if its not have direction', () => {
        const className = 'oo-padding';
        const pos = getDirectionFromClassName(className, config.props);
        expect(pos).toEqual("");
    });
})
describe('removePrefix', () => {
    test('should remove prefixes "ee-" and "oo-" from the class name', () => {
        expect(removePrefix('ee-myClass_1')).toBe('myClass_1');
        expect(removePrefix('oo-anotherClass_2')).toBe('anotherClass_2');
    });
    test('should return class name if it dont have prefix', () => {
        expect(removePrefix('regularClass_3')).toBe('regularClass_3');
    })
    test('should handle empty class names', () => {
        // Test with an empty class name
        expect(removePrefix('')).toBe('');
    });
})
describe("extractStaticClasses", () => {
    test('should extract static classes correctly', () => {
        const result = extractStaticClasses(`oo-margin oo-padding`);
        expect(result).toEqual(['oo-margin', 'oo-padding']);
    });
    test('should handle empty inputs', () => {
        const result = extractStaticClasses('');
        expect(result).toEqual([]);
    });
})
describe('collectClasses', () => {
    test('should correctly extract static and dynamic classes from the given text', async () => {
        const text = `className="static-class1 static-class2 static-class2" className={dynamicClass1} className='static-class3'`;
        const expectedClasses = ['static-class1', 'static-class2', 'static-class3', 'dynamicClass1'];
        const result = await collectClasses(text);

        expect(result).toEqual(expect.arrayContaining(expectedClasses));
    });
    test('should handle empty text and return an empty array', async () => {
        const text = '';
        const expectedClasses = [];

        const result = await collectClasses(text);

        expect(result).toEqual(expectedClasses);
    });
})
describe('readTextFromDir', () => {
    beforeAll(() => {
        fs.mkdirSync('readTextFromDir')
        fs.writeFileSync(`readTextFromDir/test1.txt`, `<div className="oo-margin ee-margin_10">Test</div> <div className="oo-text-color-primary">Test2</div>`);
        fs.writeFileSync(`readTextFromDir/test2.txt`, `<div className="oo-border-color">Test3</div>`)
    });
    test('hould read text files from a directory and concatenate their contents', async () => {
        const result = await readTextFromDir('readTextFromDir', 'txt');
        expect(result).toBe(`<div className=\"oo-margin ee-margin_10\">Test</div> <div className=\"oo-text-color-primary\">Test2</div><div className=\"oo-border-color\">Test3</div>`);
    });
    test('should return if directory doest exist', async () => {
        const result = await readTextFromDir("sdcsdc", 'txt');
        expect(result).toBe("");
    });
    afterAll(() => {

        fs.rmSync(`readTextFromDir/test1.txt`)
        fs.rmSync(`readTextFromDir/test2.txt`)
        fs.rmdirSync('readTextFromDir')
    })
})

describe('createCSS', () => {
    beforeAll(() => {
        fs.mkdirSync('createCSS')
        fs.writeFileSync(`createCSS/test1.txt`, ` <div className="oo-margin oo-margin-top_2 ee-margin_10">Test</div> <div className="oo-text-color-primary">Test2</div>`);
        fs.writeFileSync(`createCSS/test2.txt`, `<div className="oo-border-color">Test3</div>`)
    });
    test('should correctly process CSS and return styles', async () => {
        const css = await createCSS('createCSS', '.txt', config.props);
        expect(css).toContain(':root{--oo-margin: 1rem;--oo-text-color-primary: black;--oo-border-color: black;}.oo-margin {margin:calc(var(--oo-margin));}.oo-margin-top_2 {margin-top:calc(var(--oo-margin) * 2);}.oo-text-color-primary {color:var(--oo-text-color-primary);}.oo-border-color {border-color:var(--oo-border-color);}.ee-margin_10{margin:10rem}');
    });
    afterAll(() => {
        fs.rmSync(`createCSS/test1.txt`)
        fs.rmSync(`createCSS/test2.txt`)
        fs.rmdirSync('createCSS')
    });
})

describe('walkSync', () => {
    beforeAll(() => {
        fs.mkdirSync('walkSync')
        fs.mkdirSync("walkSync/subDir")
        writeFileSync(path.join('walkSync', 'file1.txt'), '');
        writeFileSync(path.join("walkSync/subDir", 'file2.txt'), '');
    })
    test('should handle a directory with only files', () => {
        const files = Array.from(walkSync('walkSync'));
        expect(files).toEqual([
            path.join('walkSync', 'file1.txt'),
            path.join('walkSync' + "/subDir", 'file2.txt'),
        ]);
    });
    afterAll(() => {
        fs.unlinkSync("walkSync/subDir/file2.txt")
        fs.rmdirSync("walkSync/subDir")
        fs.unlinkSync("walkSync/file1.txt")
        fs.rmdirSync("walkSync")
    })
})
describe('createCSSBundle', () => {
    beforeAll(() => {
        fs.mkdirSync('createCSSBundle')
    })
    test('should create a CSS file successfully', async () => {
        const outputFile = 'styles.css';

        await createCSSBundle('createCSSBundle', 'txt', config.props, outputFile);
        expect(existsSync(`createCSSBundle/${outputFile}`)).toBe(true);
    });
    afterAll(() => {
        fs.rmSync('createCSSBundle/styles.css')
        fs.rmdirSync('createCSSBundle')
    })
})