/**
 * Copyright: Copyright (c) 2015-2020 honglian
 *
 * @FileName: shortPath.js
 * @Description: 有向图的最短路径算法;最短路结果包含边的遍历过程。
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/9/11
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
        new Node(6,'g'),
        new Node(7,'h'),
    ];
    let sideArr = [
        new Side(1,1,3,1),
        new Side(2,1,2,2),
        new Side(3,2,3,5),
        new Side(4,2,4,10),
        new Side(5,2,5,6),
        new Side(6,2,7,30),
        new Side(7,5,6,2),
        new Side(8,6,7,3),
        new Side(9,5,7,7),
        new Side(10,1,7,777)
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
        endNodeId:7};
}

/**
 * toDo:开始节点和结束节点是否存在
 * @param start 开始节点
 * @param end   结束节点
 * @param nodeArr   节点数组
 * @returns {boolean} 存在true/
 */
function nodeIsInNodeArr(start,end,nodeArr){
    let i = 0;
    for(let item of nodeArr){
        if(item.id === start || item.id === end){
            i++;
        }
    }
    return i===2?true:false;
}

/**
 * toDo: 是否存在开始节点与结束节点直达的情况
 * @param start 开始节点
 * @param end   结束节点
 * @param sideArr   边数组
 * @return 距离
 */
function haveDirectPath(start,end,sideArr){
    let pathLengthArr = [];
    for(let item of sideArr){
        if(item.sourceNodeId === start && item.targetNodeId === end){
            pathLengthArr.push(item.length);
        }
    }
    if(pathLengthArr.length > 0){
        let sortPathLengthArr = pathLengthArr.sort((aa,bb)=>{
            return aa > bb;
    });
        return sortPathLengthArr[0];
    }else{
        return MAX_LENGTH;
    }
}

/**
 * toDo:判断是否在尾节点数组中
 * @param sourceNodeId  目标节点
 * @param deadNodeArr   尾节点数组
 * @returns {boolean}   在true/...
 */
function notInEndNodeArr(sourceNodeId,deadNodeArr){
    for(let i of deadNodeArr){
        if(i === sourceNodeId){
            return true;
        }
    }
    return false;
}

/**
 * toDo:                查找下一个节点
 * @param start         开始节点
 * @param end           结束节点
 * @param sideArr       边数组
 * @param nodeMovePath  移动路径数组
 * @param nodeArrLength 总共节点的数量
 * @param nodeSearchNum 已经搜索节点数量
 * @param deadNodeArr   尾节点数组
 */
function findNextNode(obj,sideArr,nodeMovePath,nodeArrLength,nodeSearchNum,deadNodeArr,returnObj){
    while(nodeSearchNum < nodeArrLength){
        let flag = false;
        for(let item of sideArr){
            if(item.sourceNodeId === obj.start && !notInEndNodeArr(item.targetNodeId,deadNodeArr)){
                nodeSearchNum ++;
                nodeMovePath.push(item.targetNodeId);
                if(item.targetNodeId === obj.end){
                    let moveLength = 0;
                    let sideMovePathArr = [];
                    let nodeMovePathArr = [];
                    for(let i = 0;i<nodeMovePath.length-1;i++){
                        nodeMovePathArr.push(nodeMovePath[i]);
                        for(let j = 0;j<sideArr.length;j++){
                            if(nodeMovePath[i] === sideArr[j].sourceNodeId && nodeMovePath[i+1] === sideArr[j].targetNodeId){
                               moveLength += sideArr[j].length;
                                sideMovePathArr.push(sideArr[j].id);
                            }
                        }
                    }
                    nodeMovePathArr.push(nodeMovePath[nodeMovePath.length-1]);
                    if(moveLength < returnObj.minLength){
                        returnObj.minLength = moveLength;
                        returnObj.sideMovePath = sideMovePathArr;
                        returnObj.nodeMovePath = nodeMovePathArr;
                    }
                    console.info(nodeMovePath.toString());
                    nodeMovePath.pop();
                    continue ;
                }
                obj.start = item.targetNodeId;
                findNextNode(obj,sideArr,nodeMovePath,nodeArrLength,nodeSearchNum,deadNodeArr,returnObj)
            }
        }
        //尾节点
        if(!flag){
            deadNodeArr.push(nodeMovePath[nodeMovePath.length - 1]);
            nodeMovePath.pop();
            obj.start = nodeMovePath[nodeMovePath.length - 1];
            break;
        }
    }
    return returnObj;
}

/**
 * toDo:    查找最短路径
 * @param start
 * @param end
 * @param nodeArr
 * @param sideArr
 * @return {[a,b,f,g],[...]}
 */
function getShortPath(obj,nodeArr,sideArr){

    let nodeMovePath = [];
    let sideMovePath = [];
    //尾节点
    let deadNodeArr  = [];
    let nodeArrLength = nodeArr.length;
    let newStartNode;
    let nodeSearchNum = 1;
    nodeMovePath.push(obj.start);
    let returnObj = {
        minLength:MAX_LENGTH,
        nodeMovePath:[],
        sideMovePath:[]
    };
    let oo = findNextNode(obj,sideArr,nodeMovePath,nodeArrLength,nodeSearchNum,deadNodeArr,returnObj);
    console.info(oo);
}

function main(){
    let nodeArr = initData().nodeArr;
    let sideArr = initData().sideArr;
    let start = getInputNode().startNodeId;
    let end = getInputNode().endNodeId;

    let nodeIsExit = nodeIsInNodeArr(start,end,nodeArr);
    //直连也不一定就是最短路
    let haveDirectPathLength = haveDirectPath(start,end,sideArr);
    if(!nodeIsExit){
        console.info('开始节点或者结束节点并不存在...');
    }if(haveDirectPathLength < MAX_LENGTH){
        console.info('开始节点与结束节点之间存在直连情况。边长为：'+haveDirectPathLength);
    }
    getShortPath({start:start,end:end},nodeArr,sideArr);
}

main();