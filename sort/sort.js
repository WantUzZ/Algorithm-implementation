/**
 * Copyright: Copyright (c) 2015-2020 
 *
 * @FileName: sort.js
 * @Description: 快速排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/11/1
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 */

const _ = require('lodash');
function doSort(start,end,arr){
  let temp,i,j;
  if(start > end){
    console.info(start+'-----'+end)
    return ;
  }
  [i,j,temp] = [start,end,arr[start]];
  while(i < j){
    while(arr[j]>= temp && j > i){
       j--;
    }
    while(arr[i] <= temp && i < j){
      i++;
    }
    if(j > i){
      let t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
  }
  arr[start] = arr[i];
  arr[i] = temp;
  console.info(arr)
  console.info(start+'======'+(i-1))
  doSort(start,i-1,arr);
  doSort(i+1,end,arr);
  console.info(arr);
}

function main(){
  let arr = [23,33,12,67,9,14,35,2,333,45];
  doSort(0,arr.length-1,arr);
}
main();