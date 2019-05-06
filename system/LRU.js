const _ = require('lodash')
// 物理块size
const PBS = 3;
//队列
let sequence;
// 内存
let physicalBlockArr =  [];

init = (data)=>{
    if(Array.isArray(data))
    sequence = data
    else
    console.info(`初始化序列必须为数组`)
}

LRUFunction = ()=>{
    for(let s of sequence){
        //
        if(physicalBlockArr.length >= PBS && _.indexOf(physicalBlockArr,s) == -1){
            _.pullAt(physicalBlockArr,[0])
            physicalBlockArr.push(s)
        }
        if(physicalBlockArr.length < PBS && _.indexOf(physicalBlockArr,s) == -1){
            physicalBlockArr.push(s)
        }else{
            let indexLocation = _.indexOf(physicalBlockArr,s)
            pullDataArr = _.pullAt(physicalBlockArr,indexLocation)
            physicalBlockArr.push(pullDataArr[0])
        }
        console.info(`当前内存情况为：${physicalBlockArr}`)
    }
    console.info(`程序结束...`)
}

init([4,3,4,2,3,1,4,2])
LRUFunction()
