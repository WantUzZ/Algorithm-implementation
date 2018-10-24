/**
 * Copyright: Copyright (c) 2015-2020 honglian
 *
 * @FileName: bubbleSort.js
 * @Description: 冒泡排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/10/23
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 */

function init(){
  let a = [222,333,43,23,12,44,99];
  return a;
};

function sort(arr){
  //外层循环是每次pull出整个待排序数组的最值（大/小）到数组的一侧（左侧/右侧）
  for(let i = 0;i < arr.length - 1;i++){
    for(let j = 0 ;j < arr.length - 1 - i ;j++){
        if(arr[j] > arr[j+1]){
          let temp = arr[j];
          arr[j] = arr[j+1];
          arr[j+1] = temp;
        }
    }
    console.info(arr);
  }
  return arr;
};

function main(){
  let data = init();
  let result = sort(data);
  console.info(`排序结果为：${result}`);
}

main();