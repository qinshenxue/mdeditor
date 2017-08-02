/**
 * Created by qinsx on 2017/8/2.
 */
declare type MdTree = {

    tag: string;  // html 标签名
    children?: Array<MdTree>; // 子节点
    text?: string;
    class?: string;
    attr?: Object;
    style?: Object;
    md?: stirng; // markdown 文本
}
