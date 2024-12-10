import fs from 'node:fs';
import { getBuildConfig, getProps, fakeConfig, exportedForTesting } from '../src/configReader';
import {
    describe, test, expect, jest, beforeAll, afterAll
} from '@jest/globals';

jest.mock('fs')
const config = fakeConfig()

describe('getConfig', () => {
    beforeAll(() => {
        fs.writeFileSync("BlackSquareUI.json", JSON.stringify(config))
    });
    test('should return the config from the config file', async () => {
        const buildConfig = await exportedForTesting.getConfig();
        expect(buildConfig).toEqual(config);
    });
    afterAll(() => {
        fs.unlinkSync("BlackSquareUI.json")
    })
});
describe('getBuildConfig', () => {
    beforeAll(() => {
        fs.writeFileSync("BlackSquareUI.json", JSON.stringify(config))
    });
    test('should return the content from the config file', async () => {

        const buildConfig = await getBuildConfig();
        expect(buildConfig).toEqual(config.content);
    });
    afterAll(() => {
        fs.unlinkSync("BlackSquareUI.json")
    })
});

describe('getProps', () => {

    beforeAll(() => {
        fs.writeFileSync("BlackSquareUI.json", JSON.stringify(config))
    });
    test('should return the props from the config file', async () => {
        jest.mock('../src/configReader', () => ({
            getConfig: jest.fn().mockResolvedValue(config as never)
        }));

        const props = await getProps();
        expect(props).toEqual(config.props);
    });

    afterAll(() => {
        fs.unlinkSync("BlackSquareUI.json")
    })
});