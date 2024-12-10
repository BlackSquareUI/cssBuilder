export type configType = {
    settings: {
        unit: string
    };
    content: ClassContentType;
    props: Array<GeneralClassType>
}
export type ClassContentType = {
    sourceDir: string
    fileExtension: string
    outputFile: string
}
export type GeneralClassType = {
    name: string;
    type: string;
    val: string | number;
    direction?: string[]
    min?: number;
    property: string
    max?: number;
    step?: number;
}
