/**
 * Copyright: Copyright (c) 2015-2020 
 *
 * @FileName: bucketSort.js
 * @Description: 桶排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/11/1
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *2018/11/1     wantu                              排序值小于1000000
 */

const _ = require('lodash')
function doSort(a){
  let arr = []
  _.forEach(a,(item)=>{ 
    arr[item] ? arr[item]++:arr[item]=1
  })
  let resultArr = [];
  for(let i = 1;i<1000000;i++){
    arr[i]?resultArr.push(i):0
  }
  console.info(resultArr)
}

function main(){
  let arr = [23,33,12,67,9,14,35,2,34,45,99999];
    doSort(arr);
}
main();