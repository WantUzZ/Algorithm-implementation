/**
 * Copyright: Copyright (c) 2015-2020 honglian
 *
 * @FileName: bfs.js
 * @Description: 基于广度优先搜索有向图的最短路径算法
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/10/23
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 *
 */


const MAX_LENGTH = 999999999;

/**
 * toDo:Node数据结构构造方法
 * @param id node节点ID
 * @param name node的名称
 * @constructor
 */
function Node(id,name){
    this.id = id
    this.name = name
}

/**
 * toDo:边数据结构的构造方法
 * @param id 边的ID
 * @param sourceNodeId 开始节点的ID
 * @param targetNodeId 结束节点的ID
 * @constructor
 */
function Side(id,sourceNodeId,targetNodeId,length){
    this.id = id
    this.sourceNodeId = sourceNodeId
    this.targetNodeId = targetNodeId
    this.length = length
}

/**
 * toDo:初始化数据
 * @returns {{nodeArr: *[], sideArr: *[]}}
 */
function initData(){
    let nodeArr = [
        new Node(1,'a'),
        new Node(2,'b'),
        new Node(3,'c'),
        new Node(4,'d'),
        new Node(5,'f'),
        new Node(6,'g')
        ];
    let sideArr = [
        new Side(1,1,3,1),
        new Side(2,1,2,2),
        new Side(3,2,3,5),
        new Side(4,2,4,10),
        new Side(5,2,5,6),
        new Side(6,2,6,30),
        new Side(8,5,6,7),
    ]
    return {
        nodeArr:nodeArr,
        sideArr:sideArr
    };
}


/**
 * toDo:获取输入
 * @returns {{startNodeId: number, endNodeId: number}}
 */
function getInputNode(){
  return {
      startNodeId:1,
      endNodeId:6};
}








