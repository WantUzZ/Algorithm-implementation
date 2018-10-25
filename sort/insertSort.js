/**
 * Copyright: Copyright (c) 2015-2020 
 *
 * @FileName: heapSort.js
 * @Description: 基于二分策略的插入排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/10/25
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 */

const _ = require('lodash');
function doSort(arr,data){
  let [start,end,mid] = [0,arr.length-1,(arr.length-1)>>1];
  while((end - start) > 1){
    if(data <= arr[start]){
      break;
    }
    if(data >= arr[end]){
      start = end;
      break;
    }
    if(data >= arr[mid]){
      start = mid + 1;
    }else{
      end = mid;
    }
    mid = (start+end)>>1;
  }
  console.info(`将要在数组下标位：${start} 的右侧进行插入目标值`)
  return start;
}

function main(){
  let isSortArr = [3,23,34,45,56,67];
  let needInsertArr = [12,7,88,49];
  for(let item of needInsertArr){
    let postion = doSort(isSortArr,item);
    isSortArr = _.concat(_.take(isSortArr,postion+1),item,_.takeRight(isSortArr,isSortArr.length-1-postion));
    console.info('插入后数组：'+isSortArr)
  }
}

main();