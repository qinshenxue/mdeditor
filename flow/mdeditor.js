declare interface Mdeditor {
    // public methods
    getMarkdown: () => string;
    getHtml: () => string;
    setMarkdown: (markdown: string) => void;
    insertMarkdown: (markdown: string) => void;
    // private methods
    _initEvent: Function;
}


declare type MdTree = {

    tag: string;  // html elm nodeName, lowercase
    children?: Array<MdTree>; // 子节点
    html?: string; // html string
    class?: string; // html elm class
    attr?: Object; // html elm attribute
    style?: Object; // html elm style
    md?: string; // markdown 文本
}


declare type Options = {
    markdown?: string
}

