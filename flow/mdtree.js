/**
 * Created by qinsx on 2017/8/2.
 */
declare type MdTree = {

    tag: string;  // html elm nodeName, lowercase
    children?: Array<MdTree>; // 子节点
    html?: string; // html string
    class?: string; // html elm class
    attr?: Object; // html elm attribute
    style?: Object; // html elm style
    md?: string; // markdown 文本
}
